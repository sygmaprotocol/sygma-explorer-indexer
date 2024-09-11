/*
The Licensed Work is (c) 2023 Sygma
SPDX-License-Identifier: LGPL-3.0-only
*/

import winston from "winston"
import { RPCClient } from "rpc-bitcoin"
import { logger as rootLogger } from "../../../utils/logger"
import { sleep } from "../../../indexer/utils/substrate"
import { Domain } from "../../config"
import DomainRepository from "../../repository/domain"
import { saveEvents } from "../../../indexer/utils/bitcoin"
import ExecutionRepository from "../../../indexer/repository/execution"
import DepositRepository from "../../../indexer/repository/deposit"
import TransferRepository from "../../../indexer/repository/transfer"
import FeeRepository from "../../../indexer/repository/fee"
import CoinMarketCapService from "../coinmarketcap/coinmarketcap.service"
import { Block } from "./bitcoinTypes"

const BLOCK_TIME = Number(process.env.BLOCK_TIME) || 12000
const BLOCK_DELAY = Number(process.env.BLOCK_DELAY) || 3

export class BitcoinIndexer {
  private domainRepository: DomainRepository
  private executionRepository: ExecutionRepository
  private depositRepository: DepositRepository
  private transferRepository: TransferRepository
  private feeRepository: FeeRepository
  private domain: Domain
  private logger: winston.Logger
  private stopped = false
  private client: RPCClient
  private coinMarketCapService: CoinMarketCapService

  constructor(
    domainRepository: DomainRepository,
    domain: Domain,
    executionRepository: ExecutionRepository,
    depositRepository: DepositRepository,
    transferRepository: TransferRepository,
    feeRepository: FeeRepository,
    coinMarketCapService: CoinMarketCapService,
    client: RPCClient,
  ) {
    this.domainRepository = domainRepository
    this.executionRepository = executionRepository
    this.transferRepository = transferRepository
    this.depositRepository = depositRepository
    this.feeRepository = feeRepository
    this.domain = domain
    this.coinMarketCapService = coinMarketCapService
    this.client = client

    this.logger = rootLogger.child({
      domain: domain.name,
      domainID: domain.id,
    })
  }

  public stop(): void {
    this.stopped = true
  }

  public async listenToEvents(): Promise<void> {
    const lastIndexedBlock = await this.getLastIndexedBlock(this.domain.id)
    let currentBlockHeight = this.domain.startBlock
    if (lastIndexedBlock && lastIndexedBlock > this.domain.startBlock) {
      currentBlockHeight = lastIndexedBlock + 1
    }

    this.logger.info(`Starting querying for events from block: ${currentBlockHeight}`)
    while (!this.stopped) {
      try {
        const bestBlockHash = (await this.client.getbestblockhash()) as string
        const bestBlock = (await this.client.getblock({ blockhash: bestBlockHash, verbosity: 1 })) as Block

        if (currentBlockHeight + BLOCK_DELAY >= bestBlock.height) {
          await sleep(BLOCK_TIME)
          continue
        }
        this.logger.debug(`Indexing block ${currentBlockHeight}`)
        const currentBlockHash = (await this.client.getblockhash({ height: currentBlockHeight })) as string
        const currentBlock = (await this.client.getblock({ blockhash: currentBlockHash, verbosity: 2 })) as Block

        await saveEvents(
          this.client,
          currentBlock,
          this.domain,
          this.executionRepository,
          this.transferRepository,
          this.depositRepository,
          this.feeRepository,
          this.coinMarketCapService,
        )
        await this.domainRepository.updateBlock(currentBlock.height.toString(), this.domain.id)
        currentBlockHeight++
      } catch (error) {
        this.logger.error(`Failed to process events for block ${currentBlockHeight}:`, error)
        await sleep(BLOCK_TIME)
      }
    }
  }

  private async getLastIndexedBlock(domainID: number): Promise<number> {
    const domainRes = await this.domainRepository.getLastIndexedBlock(domainID)
    return domainRes ? Number(domainRes.lastIndexedBlock) : this.domain.startBlock
  }
}
