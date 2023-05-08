// @ts-nocheck
import { PrismaClient } from "@prisma/client"
import { indexEvmDeposits, indexProposals, indexFailedHandlerExecutions } from "./indexer"

import {getSygmaConfig} from '../utils/getSygmaConfig'
import { EthereumSharedConfigDomain, SharedConfigDomainBase, SharedConfigFormated } from "types"

const prisma = new PrismaClient()

async function main() {
  const sygmaconfig = await getSygmaConfig() as SharedConfigFormated[]
  
  try {
    await prisma.$connect()
    console.log("Connected to prisma client")
  } catch (e) {
    console.error("Error on prisma connection", e);
  }

  const deleteTransfers = prisma.transfer.deleteMany()

  try {
    await prisma.$transaction([deleteTransfers])
  } catch (e) {
    console.error("Error deleting transfers", e);
  }

  // JUST GOERLI AND MUMBAI FOR TESTING PURPOSES
  const evmDomains = sygmaconfig.filter(
    (domain) => domain.id === 0 || domain.id === 1
  )

  // for await(const domain of evmDomains) {
  //   await indexEvmDeposits(domain as EthereumSharedConfigDomain, sygmaconfig)
  // }
  
  // NOTE: testing this just for Mumbai
  await indexEvmDeposits(evmDomains[1] as EthereumSharedConfigDomain, evmDomains)
  
  // console.log("\n***\n")
  // for (const bridge of evmBridges) {
  //   await indexProposals(bridge as Config, sygmaconfig)
  // }
  // console.log("\n***\n")
  // for (const bridge of evmBridges) {
  //   await indexFailedHandlerExecutions(bridge as Config, sygmaconfig)
  // }
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
