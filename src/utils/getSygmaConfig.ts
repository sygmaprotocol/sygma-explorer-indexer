import dotenv from 'dotenv'
import { SharedConfigDomains, SharedConfig } from 'types'
import { formatConfig } from './helpers'

dotenv.config({
  path: `${process.cwd()}/.env`
});

const getLocalConfig = () => {
  const localConfig = require("../../public/sygma-explorer-shared-config.json")
  return formatConfig(localConfig as SharedConfigDomains, "local") as SharedConfig[];
}

const getSharedConfig = async (): Promise<SharedConfig[]> => {
  const { env: { CONFIG_SERVER_URL, STAGE } } = process

  try {
    const response = await fetch(CONFIG_SERVER_URL!)
    const data: SharedConfigDomains = await response.json()
    const formatedConfig = formatConfig(data, STAGE as "devnet" | "testnet" | "mainnet")
    return formatedConfig
  } catch (e) {
    console.error(`Failed to fecth config for ${process.env.STAGE}`, e)
    throw new Error("Failed to fetch config")
  }

}

export async function getSygmaConfig(): Promise<SharedConfig[] | { error: { message: string } }> {
  let config
  try {
    if (process.env.NODE_ENV !== 'development') {
      config = await getSharedConfig()
    } else {
      config = await getLocalConfig()
    }
  } catch (e) {
    return { error: { message: "Failed to fetch" } };
  }

  return config;
}
