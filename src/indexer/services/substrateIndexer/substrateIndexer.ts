import { ApiPromise, WsProvider } from "@polkadot/api"
import FeeRepository from "indexer/repository/fee"
import { Domain, SharedConfig, SubstrateResource } from "../../config"
import DomainRepository from "../../repository/domain"
import { logger } from "../../../utils/logger"
import ExecutionRepository from "../../../indexer/repository/execution"
import DepositRepository from "../../../indexer/repository/deposit"
import TransferRepository from "../../../indexer/repository/transfer"
import { saveEvents, sleep } from "../../../indexer/utils/substrate"
import AccountRepository from "../../../indexer/repository/account"
import CoinMarketCapService from "../coinmarketcap/coinmarketcap.service"

const BLOCK_TIME = 12000

export class SubstrateIndexer {
  private domainRepository: DomainRepository
  private executionRepository: ExecutionRepository
  private depositRepository: DepositRepository
  private transferRepository: TransferRepository
  private feeRepository: FeeRepository
  private resourceMap: Map<string, SubstrateResource>
  private eventsQueryInterval = 1
  private provider!: ApiPromise
  private domain: Domain
  private stopped = false
  private accountRepository: AccountRepository
  private coinMarketCapService: CoinMarketCapService
  private sharedConfig: SharedConfig

  constructor(
    domainRepository: DomainRepository,
    domain: Domain,
    executionRepository: ExecutionRepository,
    depositRepository: DepositRepository,
    transferRepository: TransferRepository,
    feeRepository: FeeRepository,
    resourceMap: Map<string, SubstrateResource>,
    accountRepository: AccountRepository,
    coinmarketcapService: CoinMarketCapService,
    sharedConfig: SharedConfig,
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
    this.sharedConfig = sharedConfig
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
    let currentBlock = this.domain.startBlock
    if (lastIndexedBlock && lastIndexedBlock > this.domain.startBlock) {
      currentBlock = lastIndexedBlock + 1
    }

    logger.info(`Starting querying on ${this.domain.name} from ${currentBlock}`)

    while (!this.stopped) {
      try {
        const latestBlock = await this.provider.rpc.chain.getBlock()
        const currentBlockHash = await this.provider.rpc.chain.getBlockHash(currentBlock)
        if (currentBlock >= Number(latestBlock.block.header.number)) {
          await sleep(BLOCK_TIME)
          continue
        }

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
          this.sharedConfig,
        )

        await this.domainRepository.updateBlock(currentBlock.toString(), this.domain.id)
        logger.info(`indexed block on ${this.domain.name}: ${currentBlock}, domainID: ${this.domain.id}`)

        currentBlock += this.eventsQueryInterval
      } catch (error) {
        logger.error(`Failed to process events for block ${currentBlock} for domain ${this.domain.id}:`, error)
        await sleep(BLOCK_TIME)
      }
    }
  }

  private async getLastIndexedBlock(domainID: number): Promise<number> {
    const domainRes = await this.domainRepository.getLastIndexedBlock(domainID)
    return domainRes ? Number(domainRes.lastIndexedBlock) : this.domain.startBlock
  }
}
