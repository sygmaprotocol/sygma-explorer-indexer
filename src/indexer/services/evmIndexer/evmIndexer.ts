/*
The Licensed Work is (c) 2023 Sygma
SPDX-License-Identifier: LGPL-3.0-only
*/
import { EthereumConfig, EvmResource, Resource, SubstrateConfig, SygmaConfig } from "@buildwithsygma/core"
import { ethers } from "ethers"
import winston from "winston"
import { sleep } from "../../utils/substrate"
import { saveDepositLogs, saveFailedHandlerExecutionLogs, saveProposalExecutionLogs } from "../../utils/evm"
import DepositRepository from "../../repository/deposit"
import TransferRepository from "../../repository/transfer"
import ExecutionRepository from "../../repository/execution"
import DomainRepository from "../../repository/domain"
import FeeRepository from "../../repository/fee"
import { logger as rootLogger } from "../../../utils/logger"
import AccountRepository from "../../repository/account"
import CoinMarketCapService from "../coinmarketcap/coinmarketcap.service"
import { OfacComplianceService } from "../ofac"
import { getLogs } from "./evmfilter"
import { decodeLogs } from "./evmEventParser"

const BLOCK_TIME = Number(process.env.BLOCK_TIME) || 15000
const BLOCK_DELAY = Number(process.env.BLOCK_DELAY) || 10
export class EvmIndexer {
  private pastEventsQueryInterval = 1000
  private eventsQueryInterval = 1

  private provider: ethers.JsonRpcProvider
  private domainRepository: DomainRepository
  private depositRepository: DepositRepository
  private transferRepository: TransferRepository
  private executionRepository: ExecutionRepository
  private feeRepository: FeeRepository
  private domain: EthereumConfig
  private domains: Array<SubstrateConfig | EthereumConfig>
  private resourceMap: Map<string, EvmResource>
  private stopped = false
  private ofacComplianceService: OfacComplianceService
  private accountRepository: AccountRepository
  private coinMarketCapService: CoinMarketCapService
  private sygmaConfig: SygmaConfig
  private logger: winston.Logger

  constructor(
    domain: EthereumConfig,
    rpcURL: string,
    domains: EthereumConfig[],
    domainRepository: DomainRepository,
    depositRepository: DepositRepository,
    transferRepository: TransferRepository,
    executionRepository: ExecutionRepository,
    feeRepository: FeeRepository,
    ofacComplianceService: OfacComplianceService,
    accountRepository: AccountRepository,
    coinMarketCapServiceInstance: CoinMarketCapService,
    sygmaConfig: SygmaConfig,
  ) {
    this.provider = new ethers.JsonRpcProvider(rpcURL)
    this.domainRepository = domainRepository
    this.domain = domain
    this.depositRepository = depositRepository
    this.transferRepository = transferRepository
    this.executionRepository = executionRepository
    this.feeRepository = feeRepository
    this.ofacComplianceService = ofacComplianceService
    this.domains = domains
    this.resourceMap = new Map<string, EvmResource>()
    domain.resources.map((resource: Resource) => this.resourceMap.set(resource.resourceId, resource as EvmResource))
    this.accountRepository = accountRepository
    this.coinMarketCapService = coinMarketCapServiceInstance
    this.sygmaConfig = sygmaConfig
    this.logger = rootLogger.child({
      domain: domain.name,
      domainID: domain.id,
    })
  }

  public stop(): void {
    this.stopped = true
  }

  async listenToEvents(): Promise<void> {
    const lastIndexedBlock = await this.getLastIndexedBlock(this.domain.id)
    let currentBlock = Number(this.domain.startBlock)
    if (lastIndexedBlock && lastIndexedBlock > this.domain.startBlock) {
      currentBlock = lastIndexedBlock + 1
    }

    this.logger.info(`Starting querying for events from block: ${currentBlock}`)

    while (!this.stopped) {
      try {
        const latestBlock = await this.provider.getBlockNumber()
        if (currentBlock + BLOCK_DELAY >= latestBlock) {
          await sleep(BLOCK_TIME)
          continue
        }

        let queryInterval = this.pastEventsQueryInterval
        if (currentBlock + this.pastEventsQueryInterval > latestBlock) {
          queryInterval = this.eventsQueryInterval
        }
        this.logger.debug(`Indexing block ${currentBlock}`)
        await this.saveEvents(currentBlock, currentBlock + queryInterval)
        await this.domainRepository.updateBlock((currentBlock + queryInterval).toString(), this.domain.id)

        currentBlock += queryInterval + 1
      } catch (error) {
        this.logger.error(`Failed to process events for block ${currentBlock}:`, error)
        await sleep(BLOCK_TIME)
      }
    }
  }

  async saveEvents(startBlock: number, endBlock: number): Promise<void> {
    const logs = await getLogs(this.provider, this.domain, startBlock, endBlock)
    if (logs.length == 0) {
      return
    }

    this.logger.info(`Found past events in block range [${startBlock}-${endBlock}]`)
    const decodedLogs = await decodeLogs(this.provider, this.domain, logs, this.resourceMap, this.domains)

    for (const decodedLog of decodedLogs.deposit) {
      await saveDepositLogs(
        decodedLog,
        this.transferRepository,
        this.depositRepository,
        this.feeRepository,
        this.ofacComplianceService,
        this.accountRepository,
        this.coinMarketCapService,
        this.sygmaConfig,
      )
    }

    for (const error of decodedLogs.errors) {
      await saveFailedHandlerExecutionLogs(error, this.domain.id, this.transferRepository, this.executionRepository)
    }

    for (const decodedLog of decodedLogs.proposalExecution) {
      await saveProposalExecutionLogs(decodedLog, this.domain.id, this.transferRepository, this.executionRepository)
    }
  }

  async getLastIndexedBlock(domainID: number): Promise<number> {
    const domainRes = await this.domainRepository.getLastIndexedBlock(domainID)

    return domainRes ? Number(domainRes.lastIndexedBlock) : 0
  }
}
