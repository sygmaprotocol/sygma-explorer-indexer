import { ApiPromise, WsProvider } from "@polkadot/api"
import { Domain } from "../../config"
import DomainRepository from "../../repository/domain"
import { logger } from "../../../utils/logger"
import ExecutionRepository from "../../../indexer/repository/execution"
import DepositRepository from "../../../indexer/repository/deposit"
import TransferRepository from "../../../indexer/repository/transfer"
import { saveEvents } from "../../../indexer/utils/substrate"

export class SubstrateIndexer {
  private domainRepository: DomainRepository
  private executionRepository: ExecutionRepository
  private depositRepository: DepositRepository
  private transferRepository: TransferRepository
  private eventsQueryInterval = 1
  private provider!: ApiPromise
  private domain: Domain

  constructor(
    domainRepository: DomainRepository,
    domain: Domain,
    executionRepository: ExecutionRepository,
    depositRepository: DepositRepository,
    transferRepository: TransferRepository,
  ) {
    this.domainRepository = domainRepository
    this.domain = domain
    this.executionRepository = executionRepository
    this.depositRepository = depositRepository
    this.transferRepository = transferRepository
  }
  async init(rpcUrl: string): Promise<void> {
    const wsProvider = new WsProvider(rpcUrl)
    this.provider = await ApiPromise.create({
      provider: wsProvider,
    })
  }

  public async listenToEvents(): Promise<void> {
    const lastIndexedBlock = await this.getLastIndexedBlock(this.domain.id.toString())
    let currentBlock = this.domain.startBlock
    if (lastIndexedBlock && lastIndexedBlock > this.domain.startBlock) {
      currentBlock = lastIndexedBlock + 1
    }

    logger.info(`Starting querying on ${this.domain.name} from ${currentBlock}`)

    // eslint-disable-next-line no-constant-condition
    while (true) {
      try {
        const latestBlock = await this.provider.rpc.chain.getBlock()
        const currentBlockHash = await this.provider.rpc.chain.getBlockHash(currentBlock)
        if (currentBlock >= Number(latestBlock.block.header.number)) {
          await new Promise(resolve => setTimeout(resolve, 10000))
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
          this.domainRepository,
        )
        currentBlock += this.eventsQueryInterval
      } catch (error) {
        logger.error(`Failed to process events for block ${currentBlock} for domain ${this.domain.id}:`, error)
      }
    }
  }

  async getLastIndexedBlock(domainID: string): Promise<number> {
    const domainRes = await this.domainRepository.getLastIndexedBlock(domainID)
    return domainRes ? Number(domainRes.lastIndexedBlock) : this.domain.startBlock
  }
}
