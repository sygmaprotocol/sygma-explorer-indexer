import { Provider, Log, id } from "ethers"

import { Domain } from "indexer/config"

enum Topics {
  DEPOSIT = "Deposit(uint8,bytes32,uint64,address,bytes,bytes)",
  FAILED_HANDLER_EXECUTION = "FailedHandlerExecution(bytes,uint8,uint64)",
  PROPOSAL_EXECUTION = "ProposalExecution(uint8,uint64,bytes32,bytes)",
  FEE_COLLECTED = "FeeCollected(address,uint8,uint8,bytes32,uint256,address)",
}

export async function getLogs(provider: Provider, domain: Domain, fromBlock: number, toBlock: number): Promise<Log[]> {
  const filter: Array<string> = [domain.bridge]
  domain.feeHandlers.forEach(handler => {
    filter.push(handler.address)
  })

  return await provider.getLogs({
    address: filter,
    fromBlock,
    toBlock,
    topics: [[id(Topics.DEPOSIT), id(Topics.FAILED_HANDLER_EXECUTION), id(Topics.PROPOSAL_EXECUTION), id(Topics.FEE_COLLECTED)]],
  })
}
