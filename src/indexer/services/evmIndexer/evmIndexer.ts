import { PrismaClient } from "@prisma/client"
import { Provider } from "@ethersproject/providers"

import { DomainConfig } from "indexer/config"
import { providers } from "ethers"
import { Domain } from "../../types"

export class EvmIndexer {
  private provider: Provider
  private pastEventsQueryInterval = 2000
  private currentEventsQueryInterval = 10
  private prisma: PrismaClient
  private domain: Domain
  private domainConfig: DomainConfig
  constructor(domainConfig: DomainConfig, prisma: PrismaClient, domain: Domain) {
    this.provider = providers.getDefaultProvider(domainConfig.url)
    this.prisma = prisma
    this.domain = domain
    this.domainConfig = domainConfig
  }

  async indexPastEvents(): Promise<number> {
    const lastIndexedBlock = await this.getLastIndexedBlock(this.domain.id.toString())

    let toBlock = this.domainConfig.startBlock + this.pastEventsQueryInterval

    let latestBlock = await this.provider.getBlockNumber()

    let fromBlock = this.domainConfig.startBlock

    if (lastIndexedBlock && lastIndexedBlock > this.domainConfig.startBlock) {
      // move 1 block from last processed db block
      fromBlock = lastIndexedBlock + 1
    }

    console.debug(`Starting querying past blocks on ${this.domain.name}`)
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
        console.error(`Failed to process past events because of: ${error}`)
      }
    } while (fromBlock < latestBlock)
    // move to next block from the last queried range in past events
    return latestBlock + 1
  }

  async listenOnEvents(fromBlock: number): Promise<void> {
    console.debug(`Starting querying current blocks for events on ${this.domain.name}`)
    this.provider.on("block", async (currentBlock: number) => {
      // start at last block from past events query and move to new blocks range
      if (fromBlock + this.currentEventsQueryInterval === currentBlock) {
        // connect executions to deposits
        try {
          // fetch and decode logs
          await this.saveDataToDb(this.domain.id, currentBlock.toString(), this.domain.name)
          // move to next range of blocks
          fromBlock += this.currentEventsQueryInterval
        } catch (error) {
          console.error(`Failed to process current events because of: ${error}`)
        }
      }
    })
  }

  async saveDataToDb(domainID: number, latestBlock: string, domainName: string): Promise<void> {
    console.debug(`save block on ${domainName}: ${latestBlock}`)

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
