import dotenv from 'dotenv'
import { SygmaConfig } from 'sygmaTypes'
import { SharedConfigDomains, SharedConfigFormated } from 'types'
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
  return formatConfig(localConfig as SharedConfigDomains, "local") as SharedConfigFormated[];
}

const getSharedConfig = async (): Promise<SharedConfigFormated[]> => {
  const { env: { CONFIG_SERVER_URL, STAGE } } = process

  try {
    const response = await fetch(CONFIG_SERVER_URL!)
    const data: SharedConfigDomains = await response.json()
    const formatedConfig = formatConfig(data, STAGE as "devnet" | "testnet" | "mainnet")
    return formatedConfig
  } catch (e) {
    console.error(`Failed to fecth config for ${process.env.STAGE}`, e)
    return Promise.reject(e)
  }

}

export async function getSygmaConfig(): Promise<SharedConfigFormated[] | { error: { message: string } }> {
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
