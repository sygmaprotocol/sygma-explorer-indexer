/*
The Licensed Work is (c) 2023 Sygma
SPDX-License-Identifier: LGPL-3.0-only
*/
import { SubstrateConfig, SubstrateResource, SygmaConfig } from "@buildwithsygma/core"
import { ApiPromise, WsProvider } from "@polkadot/api"
import FeeRepository from "indexer/repository/fee"
import winston from "winston"
import DomainRepository from "../../repository/domain"
import { logger as rootLogger } from "../../../utils/logger"
import ExecutionRepository from "../../../indexer/repository/execution"
import DepositRepository from "../../../indexer/repository/deposit"
import TransferRepository from "../../../indexer/repository/transfer"
import { saveEvents, sleep } from "../../../indexer/utils/substrate"
import AccountRepository from "../../../indexer/repository/account"
import CoinMarketCapService from "../coinmarketcap/coinmarketcap.service"

const BLOCK_TIME = Number(process.env.BLOCK_TIME) || 12000
const BLOCK_DELAY = Number(process.env.BLOCK_DELAY) || 10
export class SubstrateIndexer {
  private domainRepository: DomainRepository
  private executionRepository: ExecutionRepository
  private depositRepository: DepositRepository
  private transferRepository: TransferRepository
  private feeRepository: FeeRepository
  private resourceMap: Map<string, SubstrateResource>
  private eventsQueryInterval = 1
  private provider!: ApiPromise
  private domain: SubstrateConfig
  private stopped = false
  private accountRepository: AccountRepository
  private coinMarketCapService: CoinMarketCapService
  private sygmaConfig: SygmaConfig
  private logger: winston.Logger

  constructor(
    domainRepository: DomainRepository,
    domain: SubstrateConfig,
    executionRepository: ExecutionRepository,
    depositRepository: DepositRepository,
    transferRepository: TransferRepository,
    feeRepository: FeeRepository,
    resourceMap: Map<string, SubstrateResource>,
    accountRepository: AccountRepository,
    coinmarketcapService: CoinMarketCapService,
    sygmaConfig: SygmaConfig,
  ) {
    this.domainRepository = domainRepository
    this.domain = domain
    this.executionRepository = executionRepository
    this.depositRepository = depositRepository
    this.transferRepository = transferRepository
    this.feeRepository = feeRepository
    this.resourceMap = resourceMap
    this.accountRepository = accountRepository
    this.coinMarketCapService = coinmarketcapService
    this.sygmaConfig = sygmaConfig
    this.logger = rootLogger.child({
      domain: domain.name,
      domainID: domain.id,
    })
  }

  public async init(rpcUrl: string): Promise<void> {
    const wsProvider = new WsProvider(rpcUrl)
    this.provider = await ApiPromise.create({
      provider: wsProvider,
    })
  }

  public stop(): void {
    this.stopped = true
  }

  public async listenToEvents(): Promise<void> {
    const lastIndexedBlock = await this.getLastIndexedBlock(this.domain.id)
    let currentBlock = Number(this.domain.startBlock)
    if (lastIndexedBlock && lastIndexedBlock > this.domain.startBlock) {
      currentBlock = lastIndexedBlock + 1
    }

    this.logger.info(`Starting querying for events from block: ${currentBlock}`)

    while (!this.stopped) {
      try {
        const latestBlock = await this.provider.rpc.chain.getBlock()
        const currentBlockHash = await this.provider.rpc.chain.getBlockHash(currentBlock)
        if (currentBlock + BLOCK_DELAY >= Number(latestBlock.block.header.number)) {
          await sleep(BLOCK_TIME)
          continue
        }
        this.logger.debug(`Indexing block ${currentBlock}`)

        await saveEvents(
          currentBlockHash,
          this.provider,
          currentBlock,
          this.domain,
          this.executionRepository,
          this.transferRepository,
          this.depositRepository,
          this.feeRepository,
          this.resourceMap,
          this.accountRepository,
          this.coinMarketCapService,
          this.sygmaConfig,
        )
        await this.domainRepository.updateBlock(currentBlock.toString(), this.domain.id)

        currentBlock += this.eventsQueryInterval
      } catch (error) {
        this.logger.error(`Failed to process events for block ${currentBlock}:`, error)
        await sleep(BLOCK_TIME)
      }
    }
  }

  private async getLastIndexedBlock(domainID: number): Promise<number> {
    const domainRes = await this.domainRepository.getLastIndexedBlock(domainID)
    return domainRes ? Number(domainRes.lastIndexedBlock) : Number(this.domain.startBlock)
  }
}
