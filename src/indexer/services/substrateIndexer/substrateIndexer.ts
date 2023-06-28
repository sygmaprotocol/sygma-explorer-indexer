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
  private pastEventsQueryInterval = 1
  private currentEventsQueryInterval = 1
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
      provider: wsProvider
    })
  }

  async indexPastEvents(): Promise<number> {
    const lastIndexedBlock = await this.getLastIndexedBlock(this.domain.id.toString())

    const currentBlock = await this.provider.rpc.chain.getBlock()

    let latestBlock = Number(currentBlock.block.header.number)
    let toBlock = latestBlock

    let fromBlock = lastIndexedBlock

    if (lastIndexedBlock && lastIndexedBlock > this.domain.startBlock) {
      // move 1 block from last processed db block
      fromBlock = lastIndexedBlock + 1
    }

    logger.info(`Starting querying past blocks on ${this.domain.name}`)
    do {
      try {
        latestBlock = Number(currentBlock.block.header.number)

        // check block range for getting logs query exceeds latestBlock on network
        // if true -> get logs until that block, else query next range of blocks
        if (fromBlock + this.pastEventsQueryInterval >= latestBlock) {
          toBlock = latestBlock
        } else {
          toBlock = fromBlock + this.pastEventsQueryInterval
        }

        const blockHash = await this.provider.rpc.chain.getBlockHash(toBlock)

        await saveEvents(
          blockHash,
          this.provider,
          toBlock,
          this.domain,
          this.executionRepository,
          this.transferRepository,
          this.depositRepository,
          this.domainRepository
        )

        // move to next range of blocks
        fromBlock += this.pastEventsQueryInterval
        toBlock += this.pastEventsQueryInterval
      } catch (error) {
        logger.error(`Failed to process past events because of: ${error}`)
      }
    } while (fromBlock < latestBlock)
    // move to next block from the last queried range in past events
    return latestBlock + 1
  }

  async listenToEvents(): Promise<void> {
    logger.info(`Starting querying current blocks for events on ${this.domain.name}`)
    let latestBlock = await this.indexPastEvents()
    await this.provider.rpc.chain.subscribeNewHeads(async header => {
      // start at last block from past events query and move to new blocks range
      if (latestBlock + this.currentEventsQueryInterval < Number(header.number)) {
        // connect executions to deposits
        try {
          // fetch and decode logs
          const blockHash = await this.provider.rpc.chain.getBlockHash(latestBlock)

          await saveEvents(
            blockHash,
            this.provider,
            latestBlock,
            this.domain,
            this.executionRepository,
            this.transferRepository,
            this.depositRepository,
            this.domainRepository
          )

          // move to next range of blocks
          latestBlock += this.currentEventsQueryInterval
        } catch (error) {
          logger.error(`Failed to process current events because of: ${error}`)
        }
      }
    })
  }

  async saveProposalExecutionToDb(domainID: number, latestBlock: string, proposalExecutionData: ProposalExecutionDataToSave): Promise<void> {
    logger.info(`Saving proposal execution. Save block on substrate ${this.domain.name}: ${latestBlock}, domain Id: ${domainID}`)
    await saveProposalExecution(proposalExecutionData, this.executionRepository, this.transferRepository)
  }

  async saveDepositToDb(domainID: number, latestBlock: string, depositData: DepositDataToSave): Promise<void> {
    logger.info(`Saving deposit. Save block on substrate ${this.domain.name}: ${latestBlock}, domain Id: ${domainID}`)

    await saveDeposit(domainID, depositData, this.transferRepository, this.depositRepository)
  }

  async saveFailedHandlerExecution(domainID: number, latestBlock: string, failedHandlerExecutionData: FailedHandlerExecutionToSave) {
    logger.info(`Saving failed proposal execution. Save block on substrate ${this.domain.name}: ${latestBlock}, domain Id: ${domainID}`)
    
    await saveFailedHandlerExecution(failedHandlerExecutionData, this.executionRepository, this.transferRepository)
  }

  async getLastIndexedBlock(domainID: string): Promise<number> {
    const domainRes = await this.domainRepository.getLastIndexedBlock(domainID)

    return domainRes ? Number(domainRes.lastIndexedBlock) : 0
  }
}
