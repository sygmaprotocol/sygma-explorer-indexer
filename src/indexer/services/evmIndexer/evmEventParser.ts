/*
The Licensed Work is (c) 2023 Sygma
SPDX-License-Identifier: LGPL-3.0-only
*/
import { Provider, Log } from "ethers"
import { Domain, EvmResource } from "../../config"
import { getDecodedLogs } from "../../utils/evm"
import { logger } from "../../../utils/logger"
import { DecodedLogs } from "./evmTypes"

export const nativeTokenAddress = "0x0000000000000000000000000000000000000000"

export async function decodeLogs(
  provider: Provider,
  domain: Domain,
  logs: Log[],
  resourceMap: Map<string, EvmResource>,
  domains: Domain[],
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
        logger.error((e as Error).message)
      }
    }),
  )

  return decodedLogs
}
