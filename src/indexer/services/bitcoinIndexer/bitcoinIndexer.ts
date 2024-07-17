/*
The Licensed Work is (c) 2023 Sygma
SPDX-License-Identifier: LGPL-3.0-only
*/

import DomainRepository from "../../repository/domain"
import { Domain } from "../../config"
import winston from "winston";
import { logger as rootLogger } from "../../../utils/logger"
import { sleep } from "../../../indexer/utils/substrate";


const Client = require('bitcoin-core'); 
const BLOCK_TIME = Number(process.env.BLOCK_TIME) || 12000

export class BitcoinIndexer {
    private domainRepository: DomainRepository;
    private domain: Domain;
    private logger: winston.Logger;
    private stopped = false

    client: any;  
    constructor(domainRepository: DomainRepository, domain: Domain){
        this.domainRepository = domainRepository
        this.domain = domain 

        this.client = new Client({network: 'testnet', host: 'nd-878-662-521.p2pify.com', username: 'flamboyant-agnesi', password: 'sadden-demise-okay-caucus-alarm-comply', ssl: {enabled: true, strict: false}})
        this.logger = rootLogger.child({
            domain: domain.name,
            domainID: domain.id,
        })

    }

    public stop(): void {
        this.stopped = true
    }

    public async listenToEvents(): Promise<void> {
        this.logger.info("LISTENING")
        const lastIndexedBlock = await this.getLastIndexedBlock(this.domain.id)
        let currentBlockHeight = this.domain.startBlock
        if (lastIndexedBlock && lastIndexedBlock > this.domain.startBlock) {
          currentBlockHeight = lastIndexedBlock + 1
        }
        //testing purposes
        currentBlockHeight = 2822263;
        this.logger.info(`Starting querying for events from block: ${currentBlockHeight}`)
        while (!this.stopped) {
            try {
                const  info = await this.client.getBlockchainInfo()
                this.logger.info(`Info is: ${info}`)

                const currentBlockHash: string = await this.client.getBlockHash(currentBlockHeight);
                this.logger.info(`Blockhash is: ${currentBlockHash}`)
                const currentBlock = await this.client.getBlock(currentBlockHash);
                this.logger.debug(`Indexing block ${currentBlockHeight}`)
                this.logger.info(`Current block: ${currentBlock}`)
                return
                currentBlockHeight++; 

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



