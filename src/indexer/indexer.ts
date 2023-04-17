import {
  Bridge__factory as BridgeFactory,
  ERC20Handler__factory as Erc20HandlerFactory,
  ERC721Handler__factory as Erc721HandlerFactory,
} from "@buildwithsygma/sygma-contracts"
import { ChainbridgeConfig, EvmBridgeConfig, HandlersMap } from "../sygmaTypes"
import { getProvider } from "../utils/helpers"

import { saveDeposits } from "./saveDeposits"
import { saveProposals } from "./saveProposals"
import { saveFailedHandlerExecutions } from "./saveFailedHandlerExecutions"
import {BigNumber} from "ethers";
import {Domain} from "../cfg/types";

export async function indexAllEvents(fromBlock: BigNumber, toBlock: BigNumber, domain: Domain, rpcMap: Map<number, string>) {
  console.log("index all events for domain " + domain.name + " inside range:" + fromBlock + "-" + toBlock)

  if(!rpcMap.has(domain.id)) {
    throw new Error("RPC URL not provided for network: " + domain.name)
  }
  const rpcUrl = rpcMap.get(domain.id) as string
  const provider = getProvider(rpcUrl, domain.id)
  provider.ready

  const bridgeContract = BridgeFactory.connect(domain.bridge, provider)

  await saveDeposits(bridgeContract, provider, domain, fromBlock.toString(), toBlock.toString())
}
