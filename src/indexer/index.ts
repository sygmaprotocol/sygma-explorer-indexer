import nodeCleanup from "node-cleanup"
import { logger } from "../utils/logger"
import { SubstrateIndexer } from "./services/substrateIndexer/substrateIndexer"
import { EvmIndexer } from "./services/evmIndexer/evmIndexer"
import { getSharedConfig, DomainTypes, Domain, getSsmDomainConfig, getDomainsToIndex, Resource } from "./config"
import DomainRepository from "./repository/domain"
import DepositRepository from "./repository/deposit"
import TransferRepository from "./repository/transfer"
import ExecutionRepository from "./repository/execution"
import FeeRepository from "./repository/fee"
import ResourceRepository from "./repository/resource"
import { healthcheckRoute } from "./healthcheck"

interface DomainIndexer {
  listenToEvents(): Promise<void>
  stop(): void
}

init()
  .then(domainIndexers => {
    nodeCleanup(function () {
      for (const indexer of domainIndexers) {
        indexer.stop()
        nodeCleanup.uninstall()
        return false
      }
    })

    for (const domainIndexer of domainIndexers) {
      domainIndexer.listenToEvents().catch(reason => {
        logger.error("Failed listening to events because of: ", reason)
      })
    }
  })
  .catch(reason => {
    logger.error("Failed to initialize app because of: ", reason)
  })

async function init(): Promise<Array<DomainIndexer>> {
  const sharedConfig = await getSharedConfig(process.env.SHARED_CONFIG_URL!)

  const domainRepository = new DomainRepository()
  const depositRepository = new DepositRepository()
  const transferRepository = new TransferRepository()
  const executionRepository = new ExecutionRepository()
  const feeRepository = new FeeRepository()
  const resourceRepository = new ResourceRepository()

  healthcheckRoute()
  const resourceMap = await insertDomains(sharedConfig.domains, resourceRepository, domainRepository)

  const rpcUrlConfig = getSsmDomainConfig()

  const domainsToIndex = getDomainsToIndex(sharedConfig.domains)
  const domainIndexers: Array<DomainIndexer> = []
  for (const domain of domainsToIndex) {
    const rpcURL = rpcUrlConfig.get(domain.id)
    if (!rpcURL) {
      logger.error(`local domain is not defined for the domain: ${domain.id}`)
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
        )
        await substrateIndexer.init(rpcURL)
        domainIndexers.push(substrateIndexer)
      } catch (err) {
        logger.error(`error on domain: ${domain.id}... skipping`)
        continue
      }
    } else if (domain.type == DomainTypes.EVM) {
      try {
        const evmIndexer = new EvmIndexer(domain, rpcURL, domainRepository, depositRepository, transferRepository, executionRepository, feeRepository)
        domainIndexers.push(evmIndexer)
      } catch (err) {
        logger.error(`error on domain: ${domain.id}... skipping`)
        continue
      }
    } else {
      logger.error(`unsuported type: ${JSON.stringify(domain)}`)
    }
  }

  return domainIndexers
}

async function insertDomains(
  domains: Array<Domain>,
  resourceRepository: ResourceRepository,
  domainRepository: DomainRepository,
): Promise<Map<string, Resource>> {
  const resourceMap = new Map<string, Resource>()
  for (const domain of domains) {
    await domainRepository.insertDomain(domain.id, domain.startBlock.toString(), domain.name)
    for (const resource of domain.resources) {
      if (domain.type == DomainTypes.SUBSTRATE) {
        resourceMap.set(resource.resourceId, resource)
      }
      await resourceRepository.insertResource({ id: resource.resourceId, type: resource.type })
    }
  }
  return resourceMap
}
