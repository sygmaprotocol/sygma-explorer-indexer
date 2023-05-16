import { DomainTypes } from "./types"
import { SubstrateIndexer } from "./services/substrateIndexer/substrateIndexer"
import { EvmIndexer } from "./services/evmIndexer/evmIndexer"
import { getSharedConfig, getLocalConfig } from "./config"
import DomainRepository from "./repository/domain"
import { logger } from "../utils/logger"

async function main() {
  const sharedConfig = await getSharedConfig(process.env.SHARED_CONFIG_URL || "https://config.develop.buildwithsygma.com/share/")
  const localDomainsConfig = getLocalConfig()

  for (const domain of sharedConfig.domains) {
    const localdomain = localDomainsConfig.get(domain.id)
    if (!localdomain) {
      logger.error("local domain is not defined for the domain: " + domain.id)
      continue
    }

    if (domain.type == DomainTypes.SUBSTRATE) {
      const localDomainConfig = localDomainsConfig.get(domain.id)
      if (!localDomainConfig) {
        logger.error("domain not configured in local config")
        continue
      }
      try {
        const domainRepository = new DomainRepository()
        const substrateIndexer = new SubstrateIndexer(domainRepository, localDomainConfig, domain)
        await substrateIndexer.init()
        substrateIndexer.listenToEvents()
      } catch (err) {
        logger.error(`error on domain: ${domain.id}... skipping`)
        continue
      }
    } else if (domain.type == DomainTypes.EVM) {
      const localDomainConfig = localDomainsConfig.get(domain.id)
      if (!localDomainConfig) {
        logger.error("domain not configured in local config")
        continue
      }
      try {
        const domainRepository = new DomainRepository()
        const evmIndexer = new EvmIndexer(localDomainConfig, domainRepository, domain)
        await evmIndexer.listenToEvents()
      } catch (err) {
        logger.error(`error on domain: ${domain.id}... skipping`)
        continue
      }
    } else {
      logger.error("unsuported type: " + domain.type)
    }
  }
}

main().catch(e => {
  logger.error(e)
})
