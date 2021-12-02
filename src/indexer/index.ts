import { PrismaClient } from "@prisma/client"
import { ChainbridgeConfig, EvmBridgeConfig } from "../chainbridgeTypes"
import { indexDeposits, indexProposals, indexVotes } from "./indexer"
const prisma = new PrismaClient()

async function main() {
  const chainbridgeConfig: ChainbridgeConfig = require("../../public/chainbridge-explorer-runtime-config.json")
  console.log(
    "🚀 ~ file: index.ts ~ line 8 ~ main ~ chainbridgeConfig",
    chainbridgeConfig
  )
  await prisma.$connect()

  const deleteVotes = prisma.voteEvent.deleteMany()
  const deleteProposals = prisma.proposalEvent.deleteMany()
  const deleteTransfers = prisma.transfer.deleteMany()

  await prisma.$transaction([deleteVotes, deleteProposals, deleteTransfers])

  const evmBridges = chainbridgeConfig.chains.filter(
    (c) => c.type !== "Substrate"
  )
  for (const bridge of evmBridges) {
    await indexDeposits(bridge as EvmBridgeConfig, chainbridgeConfig)
  }
  for (const bridge of evmBridges) {
    await indexProposals(bridge as EvmBridgeConfig, chainbridgeConfig)
  }
  for (const bridge of evmBridges) {
    await indexVotes(bridge as EvmBridgeConfig, chainbridgeConfig)
  }
}
main()
  .catch((e) => {
    console.error(e)
    throw e
  })
  .finally(async() => {
    await prisma.$disconnect()
    console.log("disconnect")
    process.exit()
  })
