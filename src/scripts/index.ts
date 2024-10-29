/*
The Licensed Work is (c) 2023 Sygma
SPDX-License-Identifier: LGPL-3.0-only
*/
import { caching } from "cache-manager"
import { logger } from "../utils/logger"
import { PriceCalculation } from "./classes/PriceCalculation"
import { IFixInterface } from "./interfaces"
import { DuplicateRemover } from "./classes/DuplicateRemover"
import { Config, Environment, SygmaConfig } from "@buildwithsygma/core"

export enum FixType {
  PriceCalculations = "price-calculations",
  RemoveDuplicates = "remove-duplicates",
}

async function getObject(config: SygmaConfig, fixType: FixType): Promise<IFixInterface> {
  if (fixType == FixType.PriceCalculations) {
    const ttlInMins = Number(process.env.CACHE_TTL_IN_MINS) || 5
    const memoryCache = await caching("memory", {
      ttl: ttlInMins * 1000,
    })

    const priceCalculationObject = new PriceCalculation(memoryCache, config)
    return priceCalculationObject
  } else if (fixType == FixType.RemoveDuplicates) {
    const duplicateRemover = new DuplicateRemover()
    return duplicateRemover
  } else {
    throw new Error("Incorrect argument passed when running script")
  }
}

async function run(): Promise<void> {
  if (!process.env.SYGMA_ENV) throw new Error("Environment is required")
  const fixType = process.argv[2] as FixType
  const config = new Config()
  await config.init(process.env.SYGMA_ENV as Environment)
  const object = await getObject(config.getConfiguration(), fixType)
  await object.executeAction()
}

run()
  .then(() => {
    logger.info(`Successfully finished executing script`)
  })
  .catch(err => logger.error("Error while executing script", err))
