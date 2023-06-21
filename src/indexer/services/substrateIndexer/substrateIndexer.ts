import { ApiPromise, WsProvider } from "@polkadot/api"
import { Domain, getSsmDomainConfig, getSharedConfig } from "../../config"
import DomainRepository from "../../repository/domain"
import { logger } from "../../../utils/logger"
import ExecutionRepository from "../../../indexer/repository/execution"
import DepositRepository from "../../../indexer/repository/deposit"
import { saveDeposit, saveProposalExecution } from "../../../utils/indexer/substrate"
import TransferRepository from "../../../indexer/repository/transfer"

type ProposalExecutionEvent = { event: { data: { originDomainId: string; depositNonce: string; dataHash: string } } }

export class SubstrateIndexer {
  private domainRepository: DomainRepository
  private executionRepository: ExecutionRepository
  private depositRepository: DepositRepository
  private transferRepository: TransferRepository
  private pastEventsQueryInterval = 1
  private currentEventsQueryInterval = 10
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
        latestBlock = Number(currentBlock.block.header.number) // SINCE IT A DO WHILE, IT GETS THE FIRST CALL TO THE LATEST BLOCK. THERE IS GOING TO BE A DIFF, AND THIS IS WHY THIS INDEX PAST EVENTS
        // check block range for getting logs query exceeds latestBlock on network
        // if true -> get logs until that block, else query next range of blocks
        if (fromBlock + this.pastEventsQueryInterval >= latestBlock) {
          toBlock = latestBlock
        } else {
          toBlock = fromBlock + this.pastEventsQueryInterval
        }

        const blockHash = await this.provider.rpc.chain.getBlockHash(fromBlock)
        const signedBlock = await this.provider.rpc.chain.getBlock(blockHash)
        const at = await this.provider.at(blockHash)
        const allRecords = await at.query.system.events()

        // @ts-ignore
        const proposalExecutionEvent = allRecords.find(
          ({ event }: any) => event.method === "ProposalExecution" && event.section === "sygmaBridge",
        ) as ProposalExecutionEvent
        // @ts-ignore
        const depositEvent = allRecords.find(({ event }: any) => event.method === "Deposit" && event.section === "sygmaBridge")

        const sectionIndex = signedBlock.block.extrinsics.findIndex(ex => ex.method.section === "sygmaBridge")

        const txIdentifier = `${fromBlock}-${sectionIndex}` //this is like the txHash but for the substrate

        if (proposalExecutionEvent !== undefined) {
          const { data } = (proposalExecutionEvent.event as any).toHuman()

          const { originDomainId, depositNonce } = data

          this.saveProposalExecutionToDb(this.domain.id, fromBlock.toString(), {
            originDomainId,
            depositNonce: Number(depositNonce),
            txIdentifier,
            blockNumber: `${fromBlock}`,
          })
        } else if (depositEvent !== undefined) {
          const { data } = (depositEvent.event as any).toHuman()

          /**
           * data: {
                destDomainId: '1',
                resourceId: '0x0000000000000000000000000000000000000000000000000000000000001000',
                depositNonce: '8',
                sender: '43vNPAxiYuWSvxapizZJ9xtNu3out1xu3gxu3zbCpeoqRZRK',
                transferType: 'FungibleTransfer',
                depositData: '0x000000000000000000000000000000000000000000000002b480699e53fe00000000000000000000000000000000000000000000000000000000000000000014d31e89fecccf6f2de10eac92adfff48d802b695c',
                handlerResponse: ''
              }
           */

          const { destDomainId: destinationDomainId, resourceId, depositNonce, sender, transferType, depositData, handlerResponse } = data

          this.saveDepositToDb(this.domain.id, fromBlock.toString(), {
            destinationDomainId,
            resourceId,
            depositNonce: Number(depositNonce),
            sender,
            transferType,
            depositData,
            handlerResponse,
            txIdentifier,
            blockNumber: `${fromBlock}`,
          })
        }

        // move to next range of blocks
        fromBlock += this.pastEventsQueryInterval
        toBlock += this.pastEventsQueryInterval
      } catch (error) {
        logger.error(`Failed to process past events because of: ${(error as Error).message}`)
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
      if (latestBlock + this.currentEventsQueryInterval === Number(header.number)) {
        // connect executions to deposits
        try {
          // fetch and decode logs

          await this.saveDataToDb(this.domain.id, header.number.toString())
          // move to next range of blocks
          latestBlock += this.currentEventsQueryInterval
        } catch (error) {
          logger.error(`Failed to process current events because of: ${(error as Error).message}`)
        }
      }
    })
  }

  async saveProposalExecutionToDb(domainID: number, latestBlock: string, proposalExecutionData?: any): Promise<void> {
    logger.info(`save block on substrate ${this.domain.name}: ${latestBlock}`)
    logger.info(`domain Id: ${domainID}, latestBlock: ${latestBlock}`)
    logger.info("Saving proposal execution")

    /**
     * to insert this execution I need to update the transfer
     * to update the transfer I need to get the transfer by depositNonce + domain id => because this is unique combination
     */
    await saveProposalExecution(proposalExecutionData, this.executionRepository, this.transferRepository)
  }

  async saveDepositToDb(domainID: number, latestBlock: string, depositData?: any): Promise<void> {
    logger.info(`save block on substrate ${this.domain.name}: ${latestBlock}`)
    logger.info(`domain Id: ${domainID}, latestBlock: ${latestBlock}`)

    logger.info("Saving deposit")
    /**
     * to insert deposit I need to fill first the transfer entity
     */
    await saveDeposit(depositData, this.transferRepository, this.depositRepository)
  }

  async getLastIndexedBlock(domainID: string): Promise<number> {
    const domainRes = await this.domainRepository.getLastIndexedBlock(domainID)

    return domainRes ? Number(domainRes.lastIndexedBlock) : 0
  }
}
