import {PrismaClient} from "@prisma/client"
import {loadSharedConfiguration} from "../cfg/util"
import {Domain, SharedConfiguration} from "../cfg/types"
import {BigNumber} from "ethers"
import {indexAllEvents} from "./indexer";

const prisma = new PrismaClient()

async function main() {
  const configUrl = process.env.CONFIG_URL;

  if (!configUrl) {
    throw new Error("CONFIG_URL is not defined");
  }

  const config: SharedConfiguration = await loadSharedConfiguration(configUrl)

  await indexEventsForAllDomains(config)


  // await prisma.$connect()

  // const deleteTransfers = prisma.transfer.deleteMany()
  //
  // await prisma.$transaction([deleteTransfers])

  // const evmBridges = chainbridgeConfig.chains.filter(
  //   (c) => c.type !== "Substrate"
  // )
  // for (const bridge of evmBridges) {
  //   await indexDeposits(bridge as EvmBridgeConfig, chainbridgeConfig)
  // }
  // console.log("\n***\n")
  // for (const bridge of evmBridges) {
  //   await indexProposals(bridge as EvmBridgeConfig, chainbridgeConfig)
  // }
  // console.log("\n***\n")
  // for (const bridge of evmBridges) {
  //   await indexFailedHandlerExecutions(bridge as EvmBridgeConfig, chainbridgeConfig)
  // }
}

function getLastIndexedBlock(domain: Domain): BigNumber {
  return  BigNumber.from(321)
}

function getLatestBlock(domain: Domain): BigNumber {
  return BigNumber.from(328)
}

function setLastIndexedBlock(domainID: number, latestBlock: any) {
  console.log("set last indexed block for domain " + domainID + " to: " + latestBlock)
}

async function indexEventsForAllDomains(config: SharedConfiguration): Promise<void> {
  while (true) {
    let indexedAll = true;

    for (const domain of config.domains) {
      const { id: domainID } = domain;
      const lastIndexedBlock = await getLastIndexedBlock(domain);
      const latestBlock = await getLatestBlock(domain);

      console.log(latestBlock.toString(), lastIndexedBlock.toString())

      const delta = latestBlock.sub(lastIndexedBlock)
      console.log(delta.toString())
      if (delta.gte(BigNumber.from(5))) {
        indexedAll = false;
        await indexAllEvents(lastIndexedBlock.add(BigNumber.from(1)), latestBlock, domain);
        await setLastIndexedBlock(domainID, latestBlock);
      }
    }

    if (indexedAll) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
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
