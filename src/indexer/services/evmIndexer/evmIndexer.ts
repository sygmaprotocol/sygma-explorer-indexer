import { Domain, EvmResource, SharedConfig } from "indexer/config"
import { ethers } from "ethers"

import { sleep } from "../../utils/substrate"
import { saveDepositLogs, saveFailedHandlerExecutionLogs, saveFeeLogs, saveProposalExecutionLogs } from "../../utils/evm"
import DepositRepository from "../../repository/deposit"
import TransferRepository from "../../repository/transfer"
import ExecutionRepository from "../../repository/execution"
import DomainRepository from "../../repository/domain"
import FeeRepository from "../../repository/fee"
import { logger } from "../../../utils/logger"
import AccountRepository from "../../repository/account"
import CoinMarketCapService from "../coinmarketcap/coinmarketcap.service"
import { getLogs } from "./evmfilter"
import { decodeLogs } from "./evmEventParser"
import { OfacComplianceService } from "./ofac"

const BLOCK_TIME = 15000

export class EvmIndexer {
  private pastEventsQueryInterval = 1000
  private eventsQueryInterval = 1

  private provider: ethers.JsonRpcProvider
  private domainRepository: DomainRepository
  private depositRepository: DepositRepository
  private transferRepository: TransferRepository
  private executionRepository: ExecutionRepository
  private feeRepository: FeeRepository
  private domain: Domain
  private domains: Domain[]
  private resourceMap: Map<string, EvmResource>
  private stopped = false
  private ofacComplianceService: OfacComplianceService
  private accountRepository: AccountRepository
  private coinMarketCapService: CoinMarketCapService
  private sharedConfig: SharedConfig

  constructor(
    domain: Domain,
    rpcURL: string,
    domains: Domain[],
    domainRepository: DomainRepository,
    depositRepository: DepositRepository,
    transferRepository: TransferRepository,
    executionRepository: ExecutionRepository,
    feeRepository: FeeRepository,
    ofacComplianceService: OfacComplianceService,
    accountRepository: AccountRepository,
    coinMarketCapServiceInstance: CoinMarketCapService,
    sharedConfig: SharedConfig,
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
    domain.resources.map((resource: EvmResource) => this.resourceMap.set(resource.resourceId, resource))
    this.accountRepository = accountRepository
    this.coinMarketCapService = coinMarketCapServiceInstance
    this.sharedConfig = sharedConfig
  }

  public stop(): void {
    this.stopped = true
  }

  async listenToEvents(): Promise<void> {
    const lastIndexedBlock = await this.getLastIndexedBlock(this.domain.id)
    let currentBlock = this.domain.startBlock
    if (lastIndexedBlock && lastIndexedBlock > this.domain.startBlock) {
      currentBlock = lastIndexedBlock + 1
    }

    logger.info(`Starting querying blocks for events on ${this.domain.name}, domainID: ${this.domain.id} from ${currentBlock}`)

    while (!this.stopped) {
      try {
        const latestBlock = await this.provider.getBlockNumber()
        if (currentBlock >= latestBlock) {
          await sleep(BLOCK_TIME)
          continue
        }

        let queryInterval = this.pastEventsQueryInterval
        if (currentBlock + this.pastEventsQueryInterval > latestBlock) {
          queryInterval = this.eventsQueryInterval
        }
        await this.saveEvents(currentBlock, currentBlock + queryInterval)

        logger.info(`indexed block on ${this.domain.name}: ${currentBlock}, domainID: ${this.domain.id}`)
        await this.domainRepository.updateBlock(currentBlock.toString(), this.domain.id)

        currentBlock += queryInterval
      } catch (error) {
        logger.error(`Failed to process events for block ${currentBlock} for domain ${this.domain.id}:`, error)
        await sleep(BLOCK_TIME)
      }
    }
  }

  async saveEvents(startBlock: number, endBlock: number): Promise<void> {
    const logs = await getLogs(this.provider, this.domain, startBlock, endBlock)
    if (logs.length == 0) {
      return
    }

    logger.info(`Found past events on ${this.domain.name} in block range [${startBlock}-${endBlock}]`)
    const decodedLogs = await decodeLogs(this.provider, this.domain, logs, this.resourceMap, this.domains)

    const transferMap = new Map<string, string>()
    await Promise.all(
      decodedLogs.deposit.map(async decodedLog =>
        saveDepositLogs(
          decodedLog,
          this.transferRepository,
          this.depositRepository,
          transferMap,
          this.ofacComplianceService,
          this.accountRepository,
          this.coinMarketCapService,
          this.sharedConfig,
        ),
      ),
    )

    await Promise.all(decodedLogs.feeCollected.map(async fee => saveFeeLogs(fee, transferMap, this.feeRepository)))

    await Promise.all(
      decodedLogs.proposalExecution.map(async decodedLog =>
        saveProposalExecutionLogs(decodedLog, this.domain.id, this.transferRepository, this.executionRepository),
      ),
    )

    await Promise.all(
      decodedLogs.errors.map(async error => saveFailedHandlerExecutionLogs(error, this.domain.id, this.transferRepository, this.executionRepository)),
    )
  }

  async getLastIndexedBlock(domainID: number): Promise<number> {
    const domainRes = await this.domainRepository.getLastIndexedBlock(domainID)

    return domainRes ? Number(domainRes.lastIndexedBlock) : 0
  }
}
