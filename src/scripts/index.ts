/*
The Licensed Work is (c) 2023 Sygma
SPDX-License-Identifier: LGPL-3.0-only
*/
import { caching } from "cache-manager"
import { getSharedConfig } from "../indexer/config"
import { logger } from "../utils/logger"
import { PriceCalculation } from "./classes/PriceCalculation"
import { IFixInterface } from "./interfaces"
import { fixDatabaseEntries } from "./fixDatabaseEntries"

enum FixType {
  PriceCalculations = "price-calculations",
}

async function getObject(fixType: FixType): Promise<IFixInterface> {
  if (fixType == FixType.PriceCalculations) {
    const ttlInMins = Number(process.env.CACHE_TTL_IN_MINS) || 5
    const memoryCache = await caching("memory", {
      ttl: ttlInMins * 1000,
    })

    const sharedConfig = await getSharedConfig(process.env.SHARED_CONFIG_URL!)

    const priceCalculationObject = new PriceCalculation(memoryCache, sharedConfig)
    return priceCalculationObject
  } else {
    throw new Error("Incorrect argument passed when running script")
  }
}

async function run(): Promise<void> {
  const fixType = process.argv[2] as FixType
  const object = await getObject(fixType)
  await fixDatabaseEntries(object)
}

run()
  .then(() => {
    logger.info(`Successfully finished executing script`)
  })
  .catch(err => logger.error("Error while executing script", err))
