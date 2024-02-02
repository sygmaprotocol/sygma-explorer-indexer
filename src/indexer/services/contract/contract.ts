/*
The Licensed Work is (c) 2023 Sygma
SPDX-License-Identifier: LGPL-3.0-only
*/
import { Contract, Provider } from "ethers"
import ERC20Contract from "@openzeppelin/contracts/build/contracts/ERC20.json"
import BasicFeeHandlerContract from "@buildwithsygma/sygma-contracts/build/contracts/BasicFeeHandler.json"
import PercentageErc20FeeHandlerEVM from "@buildwithsygma/sygma-contracts/build/contracts/PercentageERC20FeeHandlerEVM.json"
import Bridge from "@buildwithsygma/sygma-contracts/build/contracts/Bridge.json"
import FeeHandlerRouter from "./FeeHandlerRouter.json"

export function getERC20Contract(provider: Provider, contractAddress: string): Contract {
  return new Contract(contractAddress, ERC20Contract.abi, provider)
}

export function getBridgeContract(provider: Provider, contractAddress: string): Contract {
  return new Contract(contractAddress, Bridge.abi, provider)
}

export function getBasicFeeContract(provider: Provider, contractAddress: string): Contract {
  return new Contract(contractAddress, BasicFeeHandlerContract.abi, provider)
}

export function getPercentageFeeContract(provider: Provider, contractAddress: string): Contract {
  return new Contract(contractAddress, PercentageErc20FeeHandlerEVM.abi, provider)
}

export function gerFeeRouterContract(provider: Provider, contractAddress: string): Contract {
  return new Contract(contractAddress, FeeHandlerRouter.abi, provider)
}
