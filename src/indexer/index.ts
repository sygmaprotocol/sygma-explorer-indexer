import { PrismaClient } from "@prisma/client";
import {ChainbridgeConfig, EvmBridgeConfig} from "../chainbridgeTypes"
import {indexer} from "./indexer";
const prisma = new PrismaClient();

async function main() {
  const chainbridgeConfig: ChainbridgeConfig = require('../../public/chainbridge-explorer-runtime-config.json');
  console.log("🚀 ~ file: index.ts ~ line 8 ~ main ~ chainbridgeConfig", chainbridgeConfig)
  await prisma.$connect();
  
  await prisma.vote.deleteMany({});
  await prisma.proposal.deleteMany({});
  await prisma.transfer.deleteMany({});

  const evmBridges = chainbridgeConfig.chains
    .filter((c) => c.type !== "Substrate")
  for (const bridge of evmBridges) {
    await indexer(bridge as EvmBridgeConfig, chainbridgeConfig)
  }
}
main().catch((e) => {
  console.error(e)
  throw e;
})
.finally(async () => {
  await prisma.$disconnect();
  console.log('disconnect')
  process.exit();
});
