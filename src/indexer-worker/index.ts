import { ChainbridgeConfig, EvmBridgeConfig } from "../sygmaTypes"
import { indexer } from "./indexer"

async function main() {
  const chainbridgeConfig: ChainbridgeConfig = require("../../public/chainbridge-explorer-runtime-config.json")
  console.log(
    "🚀 ~ file: index.ts ~ line 8 ~ main ~ chainbridgeConfig",
    chainbridgeConfig
  )

  const evmBridges = chainbridgeConfig.chains.filter(
    (c) => c.type !== "Substrate"
  )
  for (const bridge of evmBridges) {
    await indexer(bridge as EvmBridgeConfig, chainbridgeConfig)
  }
}
main()
  .catch((e) => {
    console.error(e)
    throw e
  })
  .finally(() => {
    console.log("Finish init")
    // process.exit()
  })
