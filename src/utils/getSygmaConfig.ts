import dotenv from 'dotenv'
import { SygmaConfig } from 'sygmaTypes'
import { IndexerSharedConfig, SharedConfigDomains } from 'types'
import { formatConfig } from './helpers'

if (process.env.STAGE !== 'devnet') {
  dotenv.config({
    path: `${process.cwd()}/.env.testnet`
  })
} else {
  dotenv.config({
    path: `${process.cwd()}/.env.devnet`
  })
}

const getLocalConfig = () => {
  const localConfig = require("../../public/sygma-explorer-shared-config.json")
  return { chains: formatConfig(localConfig as SharedConfigDomains, "local") } as IndexerSharedConfig;
}

const getSharedConfig = async (): Promise<IndexerSharedConfig> => {
  const { env: { CONFIG_SERVER_URL, STAGE } } = process

  try {
    const response = await fetch(CONFIG_SERVER_URL!)
    const data: SharedConfigDomains = await response.json()
    const formatedConfig = formatConfig(data, STAGE as "devnet" | "testnet" | "mainnet")
    const indexerSharedConfig: IndexerSharedConfig = { chains: formatedConfig }
    return indexerSharedConfig
  } catch (e) {
    console.error(`Failed to fecth config for ${process.env.STAGE}`, e)
    return Promise.reject(e)
  }

}

export async function getSygmaConfig(): Promise<IndexerSharedConfig | { error: { message: string } }> {
  let config
  try {
    if (process.env.NODE_ENV === 'production') {
      config = await getSharedConfig()
    } else {
      config = await getLocalConfig()
    }
  } catch (e) {
    return { error: { message: "Failed to fetch" } };
  }

  return config;
}
