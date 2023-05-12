import { ApiPromise, WsProvider } from "@polkadot/api"

import { DomainConfig } from "indexer/config"
import { PrismaClient } from "@prisma/client"

import { Domain } from "../../types"

export class SubstrateIndexer {
  private prisma: PrismaClient
  private pastEventsQueryInterval = 2000
  private currentEventsQueryInterval = 10
  private provider!: ApiPromise
  private domainConfig: DomainConfig
  private domain: Domain
  constructor(prisma: PrismaClient, domainConfig: DomainConfig, domain: Domain) {
    this.prisma = prisma
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

    console.debug(`Starting querying past blocks on ${this.domain.name}`)
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
        console.error(`Failed to process past events because of: ${error}`)
      }
    } while (fromBlock < latestBlock)
    // move to next block from the last queried range in past events
    return latestBlock + 1
  }

  async listenOnEvents(fromBlock: number): Promise<void> {
    console.debug(`Starting querying current blocks for events on ${this.domain.name}`)
    await this.provider.rpc.chain.subscribeNewHeads(async header => {
      // start at last block from past events query and move to new blocks range
      if (fromBlock + this.currentEventsQueryInterval === Number(header.number)) {
        // connect executions to deposits
        try {
          // fetch and decode logs

          await this.saveDataToDb(this.domain.id, header.number.toString(), this.domain.name)
          // move to next range of blocks
          fromBlock += this.currentEventsQueryInterval
        } catch (error) {
          console.error(`Failed to process current events because of: ${error}`)
        }
      }
    })
  }

  async saveDataToDb(domainID: number, latestBlock: string, domainName: string): Promise<void> {
    console.debug(`save block on substrate ${this.domain.name}: ${latestBlock}`)
    await this.prisma.domain.upsert({
      where: {
        id: domainID.toString(),
      },
      create: {
        id: domainID.toString(),
        name: domainName,
        lastIndexedBlock: latestBlock,
      },
      update: {
        lastIndexedBlock: latestBlock,
      },
    })
  }

  async getLastIndexedBlock(domainID: string): Promise<number> {
    const domainRes = await this.prisma.domain.findFirst({
      where: {
        id: domainID,
      },
    })

    return domainRes ? Number(domainRes.lastIndexedBlock) : 0
  }
}
