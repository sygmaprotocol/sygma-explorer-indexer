/*
The Licensed Work is (c) 2023 Sygma
SPDX-License-Identifier: LGPL-3.0-only
*/
import { EthereumConfig, EvmResource, SubstrateConfig } from "@buildwithsygma/core"
import { Provider, Log } from "ethers"

import { getDecodedLogs } from "../../utils/evm"
import { logger } from "../../../utils/logger"
import { DecodedLogs } from "./evmTypes"

export const nativeTokenAddress = "0x0000000000000000000000000000000000000000"

export async function decodeLogs(
  provider: Provider,
  domain: EthereumConfig,
  logs: Log[],
  resourceMap: Map<string, EvmResource>,
  domains: Array<EthereumConfig | SubstrateConfig>,
): Promise<DecodedLogs> {
  const decodedLogs: DecodedLogs = {
    deposit: [],
    proposalExecution: [],
    errors: [],
  }
  await Promise.all(
    logs.map(async log => {
      try {
        await getDecodedLogs(log, provider, domain, resourceMap, decodedLogs, domains)
      } catch (e) {
        logger.error(e)
      }
    }),
  )

  return decodedLogs
}
