import { ApiPromise, WsProvider } from "@polkadot/api"
import { Domain, LocalDomainConfig } from "indexer/config"
import { logger } from "../../../utils/logger"
import DomainRepository from "indexer/repository/domain"

export class SubstrateIndexer {
  private domainRepository: DomainRepository
  private pastEventsQueryInterval = 2000
  private currentEventsQueryInterval = 10
  private provider!: ApiPromise
  private domainConfig: LocalDomainConfig
  private domain: Domain
  constructor(domainRepository: DomainRepository, domainConfig: LocalDomainConfig, domain: Domain) {
    this.domainRepository = domainRepository
    this.domainConfig = domainConfig
    this.domain = domain
  }
  async init(): Promise<void> {
    const wsProvider = new WsProvider(this.domainConfig.url)
    this.provider = await ApiPromise.create({
      provider: wsProvider,
    })
  }

  async indexPastEvents(): Promise<number> {
    const lastIndexedBlock = await this.getLastIndexedBlock(this.domain.id.toString())

    let toBlock = this.domainConfig.startBlock + this.pastEventsQueryInterval

    let latestBlock = Number((await this.provider.rpc.chain.getBlock()).block.header.number)

    let fromBlock = this.domainConfig.startBlock

    if (lastIndexedBlock && lastIndexedBlock > this.domainConfig.startBlock) {
      // move 1 block from last processed db block
      fromBlock = lastIndexedBlock + 1
    }

    logger.info(`Starting querying past blocks on ${this.domain.name}`)
    do {
      try {
        latestBlock = Number((await this.provider.rpc.chain.getBlock()).block.header.number)
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
    await this.provider.rpc.chain.subscribeNewHeads(async header => {
      // start at last block from past events query and move to new blocks range
      if (latestBlock + this.currentEventsQueryInterval === Number(header.number)) {
        // connect executions to deposits
        try {
          // fetch and decode logs

          await this.saveDataToDb(this.domain.id, header.number.toString(), this.domain.name)
          // move to next range of blocks
          latestBlock += this.currentEventsQueryInterval
        } catch (error) {
          logger.error(`Failed to process current events because of: ${error}`)
        }
      }
    })
  }

  async saveDataToDb(domainID: number, latestBlock: string, domainName: string): Promise<void> {
    logger.info(`save block on substrate ${this.domain.name}: ${latestBlock}`)
    await this.domainRepository.upserDomain(domainID, latestBlock, domainName)
  }

  async getLastIndexedBlock(domainID: string): Promise<number> {
    const domainRes = await this.domainRepository.getLastIndexedBlock(domainID)

    return domainRes ? Number(domainRes.lastIndexedBlock) : 0
  }
}
