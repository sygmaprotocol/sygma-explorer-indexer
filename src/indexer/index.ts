import { PrismaClient } from "@prisma/client"
import { ChainbridgeConfig, EvmBridgeConfig } from "../chainbridgeTypes"
import { indexDeposits, indexProposals, indexFailedHandlerExecutions } from "./indexer"
const prisma = new PrismaClient()

async function main() {
  const chainbridgeConfig: ChainbridgeConfig = require("../../public/chainbridge-explorer-runtime-config.json")
  console.log(
    "🚀 ~ file: index.ts ~ line 8 ~ main ~ chainbridgeConfig",
    chainbridgeConfig
  )
  await prisma.$connect()

  const deleteTransfers = prisma.transfer.deleteMany()

  await prisma.$transaction([deleteTransfers])

  const evmBridges = chainbridgeConfig.chains.filter(
    (c) => c.type !== "Substrate"
  )
  for (const bridge of evmBridges) {
    await indexDeposits(bridge as EvmBridgeConfig, chainbridgeConfig)
  }
  console.log("\n***\n")
  for (const bridge of evmBridges) {
    await indexProposals(bridge as EvmBridgeConfig, chainbridgeConfig)
  }
  console.log("\n***\n")
  for (const bridge of evmBridges) {
    await indexFailedHandlerExecutions(bridge as EvmBridgeConfig, chainbridgeConfig)
  }
}
main()
  .catch((e) => {
    console.error(e)
    throw e
  })
  .finally(async() => {
    await prisma.$disconnect()
    console.log("\ndisconnect")
    process.exit()
  })
