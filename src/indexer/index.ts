import { logger } from "../utils/logger"
import { SubstrateIndexer } from "./services/substrateIndexer/substrateIndexer"
import { EvmIndexer } from "./services/evmIndexer/evmIndexer"
import { getSharedConfig, getLocalConfig, DomainTypes } from "./config"
import DomainRepository from "./repository/domain"
import DepositRepository from "./repository/deposit"
import TransferRepository from "./repository/transfer"
import ExecutionRepository from "./repository/execution"
import FeeRepository from "./repository/fee"

async function main() {
  const sharedConfig = await getSharedConfig(process.env.SHARED_CONFIG_URL || "https://config.develop.buildwithsygma.com/share/")
  const localDomainsConfig = getLocalConfig()

  const domainRepository = new DomainRepository()
  const depositRepository = new DepositRepository()
  const transferRepository = new TransferRepository()
  const executionRepository = new ExecutionRepository()
  const feeRepository = new FeeRepository()
  for (const domain of sharedConfig.domains) {
    const rpcURL = localDomainsConfig.get(domain.id)
    if (!rpcURL) {
      logger.error("local domain is not defined for the domain: " + domain.id)
      continue
    }

    if (domain.type == DomainTypes.SUBSTRATE) {
      try {
        const substrateIndexer = new SubstrateIndexer(domainRepository, domain)
        await substrateIndexer.init(rpcURL)
        substrateIndexer.listenToEvents()
      } catch (err) {
        logger.error(`error on domain: ${domain.id}... skipping`)
        continue
      }
    } else if (domain.type == DomainTypes.EVM) {
      try {
        const evmIndexer = new EvmIndexer(domain, rpcURL, domainRepository, depositRepository, transferRepository, executionRepository, feeRepository)
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

process.on("unhandledRejection", (reason, promise) => {
  console.log("Unhandled Rejection:", reason)
})
