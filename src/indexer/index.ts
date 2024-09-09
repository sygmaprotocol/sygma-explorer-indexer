/*
The Licensed Work is (c) 2023 Sygma
SPDX-License-Identifier: LGPL-3.0-only
*/
import nodeCleanup from "node-cleanup"
import { FastifyInstance } from "fastify"
import { PrismaClient } from "@prisma/client"
import { CronJob } from "cron"
import { caching } from "cache-manager"
import { logger } from "../utils/logger"
import { SubstrateIndexer } from "./services/substrateIndexer/substrateIndexer"
import { EvmIndexer } from "./services/evmIndexer/evmIndexer"
import { getSharedConfig, DomainTypes, Domain, getSsmDomainConfig, getDomainsToIndex, SubstrateResource } from "./config"
import DomainRepository from "./repository/domain"
import DepositRepository from "./repository/deposit"
import TransferRepository from "./repository/transfer"
import ExecutionRepository from "./repository/execution"
import FeeRepository from "./repository/fee"
import ResourceRepository from "./repository/resource"
import { healthcheckRoute } from "./healthcheck"
import { OfacComplianceService } from "./services/ofac"
import AccountRepository from "./repository/account"
import CoinMarketCapService from "./services/coinmarketcap/coinmarketcap.service"
import { checkTransferStatus, getCronJob } from "./services/monitoringService"
import { NotificationSender } from "./services/monitoringService/notificationSender"
import { BitcoinIndexer } from "./services/bitcoinIndexer/bitcoinIndexer"

interface DomainIndexer {
  listenToEvents(): Promise<void>
  stop(): void
}
const prisma = new PrismaClient()

init()
  .then(initData => {
    nodeCleanup(function () {
      for (const indexer of initData.domainIndexers) {
        // stop the indexer
        indexer.stop()
      }

      // close server connection
      initData.app
        .close()
        .then(() => {
          logger.warning("Server closed.")
        })
        .catch(err => {
          logger.error("Error occurred during server closing: ", err)
        })

      // close database connection
      prisma
        .$disconnect()
        .then(() => {
          logger.warning("Database connection closed.")
        })
        .catch(err => logger.error("Error occurred during database closing: ", err))

      initData.cron.stop()
      nodeCleanup.uninstall()
      return false
    })

    for (const domainIndexer of initData.domainIndexers) {
      domainIndexer.listenToEvents().catch(reason => {
        logger.error("Error occurred while listening to events: ", reason)
      })
    }
  })
  .catch(reason => {
    logger.error("Error occurred on app initialization: ", reason)
  })

async function init(): Promise<{ domainIndexers: Array<DomainIndexer>; app: FastifyInstance; cron: CronJob }> {
  const sharedConfig = await getSharedConfig(process.env.SHARED_CONFIG_URL!)

  const chainAnalysisUrl = process.env.CHAIN_ANALYSIS_URL || ""
  const chainAnalysisApiKey = process.env.CHAIN_ANALYSIS_API_KEY || ""

  const coinMarketCapAPIKey = process.env.COINMARKETCAP_API_KEY || ""
  const coinMarketCapUrl = process.env.COINMARKETCAP_API_URL || ""

  const ofacComplianceService = new OfacComplianceService(chainAnalysisUrl, chainAnalysisApiKey)

  const ttlInMins = Number(process.env.CACHE_TTL_IN_MINS) || 5
  const memoryCache = await caching("memory", {
    ttl: ttlInMins * 1000,
  })
  const coinMarketCapServiceInstance = new CoinMarketCapService(coinMarketCapAPIKey, coinMarketCapUrl, memoryCache)

  const domainRepository = new DomainRepository()
  const depositRepository = new DepositRepository()
  const transferRepository = new TransferRepository()
  const executionRepository = new ExecutionRepository()
  const feeRepository = new FeeRepository()
  const resourceRepository = new ResourceRepository()
  const accountRepository = new AccountRepository()

  const app = healthcheckRoute()
  const resourceMap = await insertDomains(sharedConfig.domains, resourceRepository, domainRepository)

  const rpcUrlConfig = getSsmDomainConfig()

  const domainsToIndex = getDomainsToIndex(sharedConfig.domains)
  const domainIndexers: Array<DomainIndexer> = []

  const notificationSender = new NotificationSender(process.env.SNS_REGION!)

  const cronTime = process.env.CRON_TIME || "* */10 * * * *"
  const cron = getCronJob(cronTime, checkTransferStatus, transferRepository, notificationSender)
  cron.start()

  for (const domain of domainsToIndex) {
    const rpcURL = rpcUrlConfig.get(domain.id)
    if (!rpcURL) {
      logger.error(`Local domain is not defined for the domain: ${domain.id}`)
      continue
    }

    if (domain.type == DomainTypes.SUBSTRATE) {
      try {
        const substrateIndexer = new SubstrateIndexer(
          domainRepository,
          domain,
          executionRepository,
          depositRepository,
          transferRepository,
          feeRepository,
          resourceMap,
          accountRepository,
          coinMarketCapServiceInstance,
          sharedConfig,
        )
        await substrateIndexer.init(rpcURL)
        domainIndexers.push(substrateIndexer)
      } catch (err) {
        logger.error(`Error on domain: ${domain.id}... skipping`)
      }
    } else if (domain.type == DomainTypes.EVM) {
      try {
        const evmIndexer = new EvmIndexer(
          domain,
          rpcURL,
          domainsToIndex,
          domainRepository,
          depositRepository,
          transferRepository,
          executionRepository,
          feeRepository,
          ofacComplianceService,
          accountRepository,
          coinMarketCapServiceInstance,
          sharedConfig,
        )
        domainIndexers.push(evmIndexer)
      } catch (err) {
        logger.error(`Error on domain: ${domain.id}... skipping`)
      }
    } else if (domain.type == DomainTypes.BTC) {
      try {
        const bitcoinIndexer = new BitcoinIndexer(
          domainRepository,
          domain,
          executionRepository,
          depositRepository,
          transferRepository,
          feeRepository,
          coinMarketCapServiceInstance,
        )
        domainIndexers.push(bitcoinIndexer)
      } catch (err) {
        logger.error(err)
        logger.error(`Error on domain: ${domain.id}... skipping`)
      }
    } else {
      logger.error(`Unsupported type: ${JSON.stringify(domain)}`)
    }
  }
  return { domainIndexers, app, cron }
}

async function insertDomains(
  domains: Array<Domain>,
  resourceRepository: ResourceRepository,
  domainRepository: DomainRepository,
): Promise<Map<string, SubstrateResource>> {
  const resourceMap = new Map<string, SubstrateResource>()
  for (const domain of domains) {
    await domainRepository.insertDomain(domain.id, domain.startBlock.toString(), domain.name)
    for (const resource of domain.resources) {
      if (domain.type == DomainTypes.SUBSTRATE) {
        resourceMap.set(resource.resourceId, resource as SubstrateResource)
      }
      await resourceRepository.insertResource({ id: resource.resourceId, type: resource.type, decimals: resource.decimals })
    }
  }
  return resourceMap
}
