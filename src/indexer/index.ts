import { PrismaClient } from "@prisma/client"
import { EvmBridgeConfig, SygmaConfig } from "../sygmaTypes"
import { indexDeposits, indexProposals, indexFailedHandlerExecutions } from "./indexer"

import {getSygmaConfig} from '../utils/getSygmaConfig'

const prisma = new PrismaClient()

async function main() {
  const sygmaconfig: SygmaConfig = await getSygmaConfig()
  
  await prisma.$connect()

  const deleteTransfers = prisma.transfer.deleteMany()

  await prisma.$transaction([deleteTransfers])

  const evmBridges = sygmaconfig.chains.filter(
    (c) => c.type !== "Substrate"
  )
  for (const bridge of evmBridges) {
    await indexDeposits(bridge as EvmBridgeConfig, sygmaconfig)
  }
  console.log("\n***\n")
  for (const bridge of evmBridges) {
    await indexProposals(bridge as EvmBridgeConfig, sygmaconfig)
  }
  console.log("\n***\n")
  for (const bridge of evmBridges) {
    await indexFailedHandlerExecutions(bridge as EvmBridgeConfig, sygmaconfig)
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
