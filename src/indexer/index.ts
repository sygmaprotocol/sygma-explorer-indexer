import { logger } from "../utils/logger"
import { SubstrateIndexer } from "./services/substrateIndexer/substrateIndexer"
import { EvmIndexer } from "./services/evmIndexer/evmIndexer"
import { getSharedConfig, DomainTypes, Domain, getSsmDomainConfig, getDomainsToIndex } from "./config"
import DomainRepository from "./repository/domain"
import DepositRepository from "./repository/deposit"
import TransferRepository from "./repository/transfer"
import ExecutionRepository from "./repository/execution"
import FeeRepository from "./repository/fee"
import ResourceRepository from "./repository/resource"
import { healthcheckRoute } from "./healthcheck"

async function main(): Promise<void> {
  const sharedConfig = await getSharedConfig(process.env.SHARED_CONFIG_URL!)

  const domainRepository = new DomainRepository()
  const depositRepository = new DepositRepository()
  const transferRepository = new TransferRepository()
  const executionRepository = new ExecutionRepository()
  const feeRepository = new FeeRepository()
  const resourceRepository = new ResourceRepository()

  healthcheckRoute()
  await insertDomains(sharedConfig.domains, resourceRepository, domainRepository)

  const rpcUrlConfig = getSsmDomainConfig()

  const domainsToIndex = getDomainsToIndex(sharedConfig.domains)
  const domainIndexers: Array<Promise<void>> = []
  for (const domain of domainsToIndex) {
    const rpcURL = rpcUrlConfig.get(domain.id)
    if (!rpcURL) {
      logger.error(`local domain is not defined for the domain: ${domain.id}`)
      continue
    }

    if (domain.type == DomainTypes.SUBSTRATE) {
      try {
        const substrateIndexer = new SubstrateIndexer(domainRepository, domain, executionRepository, depositRepository, transferRepository)
        await substrateIndexer.init(rpcURL)
        domainIndexers.push(substrateIndexer.listenToEvents())
      } catch (err) {
        logger.error(`error on domain: ${domain.id}... skipping`)
        continue
      }
    } else if (domain.type == DomainTypes.EVM) {
      try {
        const evmIndexer = new EvmIndexer(domain, rpcURL, domainRepository, depositRepository, transferRepository, executionRepository, feeRepository)
        domainIndexers.push(evmIndexer.listenToEvents())
      } catch (err) {
        logger.error(`error on domain: ${domain.id}... skipping`)
        continue
      }
    } else {
      logger.error(`unsuported type: ${JSON.stringify(domain)}`)
    }
  }

  await Promise.all(domainIndexers)
}

main().catch(e => {
  logger.error(e)
})

async function insertDomains(domains: Array<Domain>, resourceRepository: ResourceRepository, domainRepository: DomainRepository): Promise<void> {
  for (const domain of domains) {
    await domainRepository.insertDomain(domain.id, domain.startBlock.toString(), domain.name)
    for (const resource of domain.resources) {
      await resourceRepository.insertResource({ id: resource.resourceId, type: resource.type })
    }
  }
}
