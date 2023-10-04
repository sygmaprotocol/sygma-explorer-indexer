/*
The Licensed Work is (c) 2023 Sygma
SPDX-License-Identifier: LGPL-3.0-only
*/
import { Contract, Provider } from "ethers"
import ERC20Contract from "@openzeppelin/contracts/build/contracts/ERC20.json"
import { ERC20 } from "@buildwithsygma/sygma-contracts"

export function getERC20Contract(provider: Provider, contractAddress: string): ERC20 {
  return new Contract(contractAddress, ERC20Contract.abi, provider) as unknown as ERC20
}
