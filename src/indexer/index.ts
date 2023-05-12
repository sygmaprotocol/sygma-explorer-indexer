import { PrismaClient } from "@prisma/client"
import { testDomains, devDomains } from "./config"
import { DomainTypes } from "./types"
import { SubstrateIndexer } from "./services/substrateIndexer/substrateIndexer"
import { EvmIndexer } from "./services/evmIndexer/evmIndexer"

enum Environment {
  TESTNET = "testnet",
  STAGE = "stage",
}

async function main() {
  const prisma: PrismaClient = new PrismaClient()
  const sharedConfig = await getSharedConfig(process.env.SHARED_CONFIG_URL || "https://config.develop.buildwithsygma.com/share/")
  const localDomainsConfig = process.env.ENVIRONMENT == Environment.TESTNET ? testDomains : devDomains

  for (const domain of sharedConfig.domains) {
    const localdomain = localDomainsConfig.get(domain.id)
    if (!localdomain) {
      console.error("local domain is not defined for the domain: " + domain.id)
      continue
    }

    if (domain.type == DomainTypes.SUBSTRATE) {
      const domainConfig = localDomainsConfig.get(domain.id)
      if (!domainConfig) {
        console.error("domain not configured in local config")
        continue
      }
      try {
        const substrateIndexer = new SubstrateIndexer(prisma, domainConfig, domain)
        await substrateIndexer.init()

        const latestBlock = await substrateIndexer.indexPastEvents()
        substrateIndexer.listenOnEvents(latestBlock)
      } catch (err) {
        console.error(`error on domain: ${domain.id}... skipping`)
        continue
      }
    } else if (domain.type == DomainTypes.EVM) {
      const domainConfig = localDomainsConfig.get(domain.id)
      if (!domainConfig) {
        console.error("domain not configured in local config")
        continue
      }
      try {
        const evmIndexer = new EvmIndexer(domainConfig, prisma, domain)
        const latestBlock = await evmIndexer.indexPastEvents()
        await evmIndexer.listenOnEvents(latestBlock)
      } catch (err) {
        console.error(`error on domain: ${domain.id}... skipping`)
        continue
      }
    } else {
      console.error("unsuported type: " + domain.type)
    }
  }
}

async function getSharedConfig(url: string) {
  const response = await fetch(url)
  return await response.json()
}

main().catch(e => {
  console.error(e)
})
