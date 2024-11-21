/*
The Licensed Work is (c) 2023 Sygma
SPDX-License-Identifier: LGPL-3.0-only
*/
import { EthereumConfig } from "@buildwithsygma/core"
import { Provider, Log, id } from "ethers"

enum Topics {
  DEPOSIT = "Deposit(uint8,bytes32,uint64,address,bytes,bytes)",
  FAILED_HANDLER_EXECUTION = "FailedHandlerExecution(bytes,uint8,uint64)",
  PROPOSAL_EXECUTION = "ProposalExecution(uint8,uint64,bytes32,bytes)",
}

export async function getLogs(provider: Provider, domain: EthereumConfig, fromBlock: number, toBlock: number): Promise<Log[]> {
  const filter: Array<string> = [domain.bridge]

  return await provider.getLogs({
    address: filter,
    fromBlock,
    toBlock,
    topics: [[id(Topics.DEPOSIT), id(Topics.FAILED_HANDLER_EXECUTION), id(Topics.PROPOSAL_EXECUTION)]],
  })
}
