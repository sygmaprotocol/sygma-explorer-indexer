/*
The Licensed Work is (c) 2023 Sygma
SPDX-License-Identifier: LGPL-3.0-only
*/
import { Signer, ethers, AbiCoder } from "ethers"
import { ERC20Handler__factory as Erc20HandlerFactory, ERC721Handler__factory as Erc721HandlerFactory } from "@buildwithsygma/sygma-contracts"
import { sleep } from "../indexer/utils/substrate"
import { EvmBridgeConfig, HandlersMap, SygmaConfig } from "../sygmaTypes"
import { IncludedQueryParams } from "../Interfaces"

export function getNetworkName(domainId: number, sygmaConfig: SygmaConfig): string {
  return sygmaConfig.chains.find(c => c.domainId === domainId)?.name || ""
}

export function decodeDataHash(data: string): { amount: string; destinationRecipientAddress: string } {
  const abiCoder = AbiCoder.defaultAbiCoder()
  const decodedData = abiCoder.decode(["uint", "uint"], data)
  const destinationRecipientAddressLen = Number(decodedData.toArray()[1]) * 2 // adjusted for bytes
  const result = {
    amount: `${decodedData.toArray()[0] as string}`,
    destinationRecipientAddress: `0x${data.slice(130, 130 + destinationRecipientAddressLen)}`,
  }
  return result
}

export function getHandlersMap(bridge: EvmBridgeConfig, provider: ethers.JsonRpcProvider): HandlersMap {
  const erc20HandlerContract = Erc20HandlerFactory.connect(bridge.erc20HandlerAddress, provider as unknown as Signer)
  const erc721HandlerContract = Erc721HandlerFactory.connect(bridge.erc721HandlerAddress, provider as unknown as Signer)

  const handlersMap: HandlersMap = {}
  handlersMap[bridge.erc20HandlerAddress] = erc20HandlerContract
  handlersMap[bridge.erc721HandlerAddress] = erc721HandlerContract
  return handlersMap
}

export const getTransferQueryParams = (): IncludedQueryParams => {
  return {
    include: {
      resource: {
        select: {
          type: true,
          id: true,
        },
      },
      toDomain: {
        select: {
          name: true,
          lastIndexedBlock: true,
          id: true,
        },
      },
      fromDomain: {
        select: {
          name: true,
          lastIndexedBlock: true,
          id: true,
        },
      },
      fee: {
        select: {
          amount: true,
          tokenAddress: true,
          tokenSymbol: true,
        },
      },
      deposit: {
        select: {
          txHash: true,
          blockNumber: true,
          depositData: true,
          handlerResponse: true,
          timestamp: true,
        },
      },
      execution: {
        select: {
          txHash: true,
          blockNumber: true,
          timestamp: true,
        },
      },
      account: {
        select: {
          addressStatus: true,
        },
      },
    },
  }
}

export class NotFound extends Error {
  constructor(message: string) {
    super(message)
  }
}

export async function fetchRetry(
  input: RequestInfo | URL,
  init?: RequestInit | undefined,
  retryCount = parseInt(process.env.RETRY_COUNT || "3"),
  backoff = parseInt(process.env.BACKOFF || "500"),
): Promise<Response> {
  let statusCode = 0
  while (retryCount > 0) {
    try {
      const res = await fetch(input, init)
      if (res.status != 200) {
        statusCode = res.status
        throw new Error()
      }
      return res
    } catch {
      await sleep(backoff)
      backoff *= 2
    } finally {
      retryCount -= 1
    }
  }
  throw new Error(`Error while fetching URL: ${input.toString()}. Status code: ${statusCode}`)
}
