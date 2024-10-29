/*
The Licensed Work is (c) 2023 Sygma
SPDX-License-Identifier: LGPL-3.0-only
*/
import { Signer, ethers, AbiCoder } from "ethers"
import { ERC20Handler__factory as Erc20HandlerFactory, ERC721Handler__factory as Erc721HandlerFactory } from "@buildwithsygma/sygma-contracts"
import { EthereumConfig, ResourceType, SygmaConfig } from "@buildwithsygma/core"
import { sleep } from "../indexer/utils/substrate"
import { HandlersMap } from "../sygmaTypes"
import { IncludedQueryParams } from "../interfaces"

export function getNetworkName(domainId: number, sygmaConfig: SygmaConfig): string {
  return sygmaConfig.domains.find(c => c.id === domainId)?.name || ""
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

export function convertMillisecondsToMinutes(duration: number): number {
  return duration / 1000 / 60
}

export function getHandlersMap(bridge: EthereumConfig, provider: ethers.JsonRpcProvider): HandlersMap {
  const erc20HandlerAddress = bridge.handlers.find(h => h.type === ResourceType.FUNGIBLE)?.address
  const erc721HandlerAddress = bridge.handlers.find(h => h.type === ResourceType.NON_FUNGIBLE)?.address
  const handlersMap: HandlersMap = {}

  if (erc20HandlerAddress) {
    const erc20HandlerContract = Erc20HandlerFactory.connect(erc20HandlerAddress, provider as unknown as Signer)
    handlersMap[erc20HandlerAddress] = erc20HandlerContract
  }

  if (erc721HandlerAddress) {
    const erc721HandlerContract = Erc721HandlerFactory.connect(erc721HandlerAddress, provider as unknown as Signer)
    handlersMap[erc721HandlerAddress] = erc721HandlerContract
  }

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
          id: true,
          amount: true,
          tokenAddress: true,
          tokenSymbol: true,
          decimals: true,
          transferId: true,
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
