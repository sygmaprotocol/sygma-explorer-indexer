import { Provider } from "@ethersproject/providers"
import { Domain } from "indexer/config"
import { providers } from "ethers"
import DomainRepository from "indexer/repository/domain"
import { logger } from "../../../utils/logger"

export class EvmIndexer {
  private provider: Provider
  private pastEventsQueryInterval = 2000
  private currentEventsQueryInterval = 10
  private domainRepository: DomainRepository
  private domain: Domain
  constructor(rpcURL: string, domainRepository: DomainRepository, domain: Domain) {
    this.provider = providers.getDefaultProvider(rpcURL)
    this.domainRepository = domainRepository
    this.domain = domain
  }

  async indexPastEvents(): Promise<number> {
    const lastIndexedBlock = await this.getLastIndexedBlock(this.domain.id.toString())

    let toBlock = this.domain.startBlock + this.pastEventsQueryInterval
    let latestBlock = await this.provider.getBlockNumber()
    let fromBlock = this.domain.startBlock
    if (lastIndexedBlock && lastIndexedBlock > this.domain.startBlock) {
      // move 1 block from last processed db block
      fromBlock = lastIndexedBlock + 1
    }

    logger.info(`Starting querying past blocks on ${this.domain.name}`)
    do {
      try {
        latestBlock = await this.provider.getBlockNumber()
        // check block range for getting logs query exceeds latestBlock on network
        // if true -> get logs until that block, else query next range of blocks
        if (fromBlock + this.pastEventsQueryInterval >= latestBlock) {
          toBlock = latestBlock
        } else {
          toBlock = fromBlock + this.pastEventsQueryInterval
        }

        await this.saveDataToDb(this.domain.id, toBlock.toString(), this.domain.name)
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
    this.provider.on("block", async (currentBlock: number) => {
      // start at last block from past events query and move to new blocks range
      if (latestBlock + this.currentEventsQueryInterval === currentBlock) {
        // connect executions to deposits
        try {
          // fetch and decode logs
          await this.saveDataToDb(this.domain.id, currentBlock.toString(), this.domain.name)
          // move to next range of blocks
          latestBlock += this.currentEventsQueryInterval
        } catch (error) {
          logger.error(`Failed to process current events because of: ${error}`)
        }
      }
    })
  }

  async saveDataToDb(domainID: number, latestBlock: string, domainName: string): Promise<void> {
    logger.info(`save block on ${domainName}: ${latestBlock}`)
    this.domainRepository.upserDomain(domainID, latestBlock, domainName)
  }

  async getLastIndexedBlock(domainID: string): Promise<number> {
    const domainRes = await this.domainRepository.getLastIndexedBlock(domainID)

    return domainRes ? Number(domainRes.lastIndexedBlock) : 0
  }
}
