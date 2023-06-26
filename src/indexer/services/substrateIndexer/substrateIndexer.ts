import { ApiPromise, WsProvider } from "@polkadot/api"
import { Domain, getSsmDomainConfig, getSharedConfig } from "../../config"
import DomainRepository from "../../repository/domain"
import { logger } from "../../../utils/logger"
import ExecutionRepository from "../../../indexer/repository/execution"
import DepositRepository from "../../../indexer/repository/deposit"
import { saveDeposit, saveProposalExecution } from "../../../utils/indexer/substrate"
import TransferRepository from "../../../indexer/repository/transfer"
import { DepositDataToSave, DepositEvent, ProposalExecutionDataToSave, ProposalExecutionEvent, SygmaPalleteEvents } from "./substrateTypes"
import { getSubstrateEvents } from "./substrateEventParser"

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

        const blockHash = await this.provider.rpc.chain.getBlockHash(fromBlock)
        const signedBlock = await this.provider.rpc.chain.getBlock(blockHash)
        const at = await this.provider.at(blockHash)
        const allRecords = await at.query.system.events()

        // we get the proposal execution events - ts-ignore because of allRecords
        // @ts-ignore
        const proposalExecutionEvents = getSubstrateEvents(SygmaPalleteEvents.ProposalExecution, allRecords) as Array<ProposalExecutionEvent>

        // we get the deposit events - ts-ignore because of allRecords
        // @ts-ignore
        const depositEvents = getSubstrateEvents(SygmaPalleteEvents.Deposit, allRecords) as Array<DepositEvent>

        // we get the index of the section in the extrinsic
        const sectionIndex = signedBlock.block.extrinsics.findIndex(ex => ex.method.section === "sygmaBridge")

        // this is our identifier for the tx
        const txIdentifier = `${fromBlock}-${sectionIndex}` //this is like the txHash but for the substrate

        if (proposalExecutionEvents.length) {
          proposalExecutionEvents.forEach((proposalExecutionEvent: ProposalExecutionEvent) => {
            const { data } = (proposalExecutionEvent.event as any).toHuman()

            const { originDomainId, depositNonce } = data

            this.saveProposalExecutionToDb(this.domain.id, fromBlock.toString(), {
              originDomainId,
              depositNonce: depositNonce,
              txIdentifier,
              blockNumber: `${fromBlock}`,
            })
          })
        } else if (depositEvents.length) {
          depositEvents.forEach((depositEvent: DepositEvent) => {
            const { data } = (depositEvent.event as any).toHuman()

            const { destDomainId, resourceId, depositNonce, sender, transferType, depositData, handlerResponse } = data

            this.saveDepositToDb(this.domain.id, fromBlock.toString(), {
              destDomainId,
              resourceId,
              depositNonce: depositNonce,
              sender,
              transferType,
              depositData,
              handlerResponse,
              txIdentifier,
              blockNumber: `${fromBlock}`,
            })
          })
        }

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
          const signedBlock = await this.provider.rpc.chain.getBlock(blockHash)
          const at = await this.provider.at(blockHash)
          const allRecords = await at.query.system.events()

          // we get the proposal execution events - ts-ignore because of allRecords
          // @ts-ignore
          const proposalExecutionEvents = getSubstrateEvents(SygmaPalleteEvents.ProposalExecution, allRecords) as Array<ProposalExecutionEvent>

          // we get the deposit events - ts-ignore because of allRecords
          // @ts-ignore
          const depositEvents = getSubstrateEvents(SygmaPalleteEvents.Deposit, allRecords) as Array<DepositEvent>

          // we get the index of the section in the extrinsic
          const sectionIndex = signedBlock.block.extrinsics.findIndex(ex => ex.method.section === "sygmaBridge")

          // this is our identifier for the tx
          const txIdentifier = `${latestBlock}-${sectionIndex}` //this is like the txHash but for the substrate

          if (proposalExecutionEvents.length) {
            proposalExecutionEvents.forEach((proposalExecutionEvent: ProposalExecutionEvent) => {
              const { data } = (proposalExecutionEvent.event as any).toHuman()

              const { originDomainId, depositNonce } = data

              this.saveProposalExecutionToDb(this.domain.id, latestBlock.toString(), {
                originDomainId,
                depositNonce: depositNonce,
                txIdentifier,
                blockNumber: `${latestBlock}`,
              })
            })
          } else if (depositEvents.length) {
            depositEvents.forEach((depositEvent: DepositEvent) => {
              const { data } = (depositEvent.event as any).toHuman()

              const { destDomainId, resourceId, depositNonce, sender, transferType, depositData, handlerResponse } = data

              this.saveDepositToDb(this.domain.id, latestBlock.toString(), {
                destDomainId,
                resourceId,
                depositNonce: depositNonce,
                sender,
                transferType,
                depositData,
                handlerResponse,
                txIdentifier,
                blockNumber: `${latestBlock}`,
              })
            })
          }

          // move to next range of blocks
          latestBlock += this.currentEventsQueryInterval
        } catch (error) {
          logger.error(`Failed to process current events because of: ${(error as Error).message}`)
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

    await saveDeposit(depositData, this.transferRepository, this.depositRepository)
  }

  async getLastIndexedBlock(domainID: string): Promise<number> {
    const domainRes = await this.domainRepository.getLastIndexedBlock(domainID)

    return domainRes ? Number(domainRes.lastIndexedBlock) : 0
  }
}
