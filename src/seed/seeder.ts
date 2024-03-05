/*
The Licensed Work is (c) 2023 Sygma
SPDX-License-Identifier: LGPL-3.0-only
*/
// @ts-nocheck
/* eslint-disable */
import { PrismaClient, TransferStatus } from "@prisma/client"
import { Signer, ethers, AbiCoder, formatUnits } from "ethers"
import { Bridge__factory } from "@buildwithsygma/sygma-contracts"
import { getSharedConfig } from "../indexer/config"

const prismaClient = new PrismaClient()

const decodeAmountsOrTokenId = (data: string, decimals: number, type: "erc20" | "erc721"): string => {
  const abiCoder = AbiCoder.defaultAbiCoder()
  if (type === "erc20") {
    const amount = abiCoder.decode(["uint256"], data)
    const amountValue = amount.toArray()[0] as string
    return formatUnits(amountValue, decimals)
  } else {
    const tokenId = abiCoder.decode(["uint256"], data)
    const tokenIdValue = tokenId.toArray()[0] as BigInt
    return tokenIdValue.toString()
  }
}

const seeder = async (): Promise<void> => {
  console.log("Start seeding ...")
  try {
    await prismaClient.$connect()
  } catch (e) {
    console.log("Error on connecting to database", e)
  }

  const domains = await getSharedConfig("https://cloudflare-ipfs.com/ipfs/QmfPxe4ajcmPBt9Pr2Tr7FeM2Z9ndj9USJwxMdfazo9Jr5") // using old one because new one doesn't have transfers

  const localConfig = getLocalConfig()
  const domainsWithRpcURL = domains.domains.map(domain => {
    const rpcURL = localConfig.get(domain.id)
    return {
      ...domain,
      rpcURL,
    }
  })
  const evmDomain = domainsWithRpcURL.filter(domain => domain.type === "evm")[0]

  const { rpcURL } = evmDomain

  const provider = new ethers.providers.JsonRpcProvider(rpcURL)
  const bridge = Bridge__factory.connect(evmDomain.bridge, provider as unknown as Signer)
  const depositFilter = bridge.filters.Deposit(null, null, null, null, null, null)
  const depositLogs = await provider.getLogs({
    ...depositFilter,
    fromBlock: evmDomain.startBlock,
    toBlock: "latest",
  })

  const parsedLogs = depositLogs.map(log => ({
    parsedData: bridge.interface.parseLog(log),
    txHash: log.transactionHash,
    blockNumber: log.blockNumber,
  }))

  // Avoiding generic transfers
  const filteredResource = "0x0000000000000000000000000000000000000000000000000000000000000500"

  const onlyTokensTransfers = parsedLogs.filter(log => {
    const { resourceID } = log.parsedData.args
    const resourceIDAndType = evmDomain.resources.find(resource => resource.resourceId === resourceID)

    return resourceIDAndType?.resourceId === resourceID && resourceIDAndType?.resourceId !== filteredResource
  })

  const amountOfTokenTransfers = onlyTokensTransfers.length

  const onlyResourcesForTokensTransfers = evmDomain.resources
    .filter(resource => resource.type !== "permissionlessGeneric")
    .map(resource => ({ resourceId: resource.resourceId, type: resource.type }))

  for (const resource of onlyResourcesForTokensTransfers) {
    await prismaClient.resource.create({
      data: {
        resourceId: resource.resourceId,
        type: resource.type,
      },
    })
  }
  console.log(`Adding ${onlyResourcesForTokensTransfers.length} resources`)

  for (const domain of domainsWithRpcURL) {
    const { name, startBlock, id } = domain
    await prismaClient.domain.create({
      data: {
        domainId: `${id}`,
        name,
        lastIndexedBlock: startBlock.toString(),
      },
    })
  }
  console.log(`Adding ${domainsWithRpcURL.length} domains`)

  for (const pl of onlyTokensTransfers) {
    const { destinationDomainID, resourceID, depositNonce, user, data} = pl.parsedData.args
    const { txHash, blockNumber } = pl

    const destinationDomain = domainsWithRpcURL.find(domain => domain.id === destinationDomainID)

    const resourceIDAndType = evmDomain.resources.map(resource => ({
      resourceId: resource.resourceId,
      type: resource.type,
      tokenAddress: resource.address,
      tokenSymbol: resource.symbol,
    }))

    const transferType = resourceIDAndType.find(resource => resource.resourceId === resourceID)?.type
    const tokenData = resourceIDAndType.find(resource => resource.resourceId === resourceID)
    const amountOrTokenId = decodeAmountsOrTokenId(data as string, 18, transferType as "erc20" | "erc721")
    const arrayifyData = ethers.utils.arrayify(data as string)

    const transferStatus = ["pending", "executed", "failed"][Math.floor(Math.random() * 3)]

    const filtered = arrayifyData.filter((_, idx) => idx + 1 > 65)
    const hexAddress = ethers.utils.hexlify(filtered)

    const transferData = {
      depositNonce: (depositNonce as BigNumber).toNumber(),
      type: transferType,
      sender: user as string,
      amount: amountOrTokenId,
      destination: hexAddress,
      status: transferStatus as TransferStatus,
      resource: resourceID as string,
      fromDomain: `${evmDomain.id}`,
      toDomain: `${destinationDomain?.id!}`,
    }

    if (transferStatus === "pending") {
      try {
        await prismaClient.transfer.create({
          data: {
            depositNonce: transferData.depositNonce,
            type: transferData.type!,
            sender: transferData.sender,
            amount: transferData.amount,
            destination: transferData.destination,
            status: transferData.status,
            resource: {
              connect: {
                resourceId: transferData.resource,
              },
            },
            fromDomain: {
              connect: {
                domainId: transferData.fromDomain,
              },
            },
            toDomain: {
              connect: {
                domainId: transferData.toDomain,
              },
            },
            timestamp: Date.now(),
          },
        })
      } catch (e) {
        console.log("Error on creating transfer", e)
      }
    } else {
      const augmentedTransfer = {
        ...transferData,
        fee: {
          amount: amountOrTokenId,
          tokenAddress: tokenData?.tokenAddress,
          tokenSymbol: tokenData?.tokenSymbol,
        },
        deposit: {
          txHash,
          blockNumber,
          depositData: data as string,
        },
        execution: {
          txHash,
          blockNumber,
          handlerResponse: handlerResponse as string,
        },
      }

      try {
        await prismaClient.transfer.create({
          data: {
            depositNonce: transferData.depositNonce,
            type: transferData.type!,
            sender: transferData.sender,
            amount: transferData.amount,
            destination: transferData.destination,
            status: transferData.status,
            resource: {
              connect: {
                resourceId: transferData.resource,
              },
            },
            fromDomain: {
              connect: {
                domainId: transferData.fromDomain,
              },
            },
            toDomain: {
              connect: {
                domainId: transferData.toDomain,
              },
            },
            fee: {
              create: {
                amount: augmentedTransfer.fee.amount,
                tokenAddress: augmentedTransfer.fee.tokenAddress!,
                tokenSymbol: augmentedTransfer.fee.tokenSymbol!,
              },
            },
            deposit: {
              create: {
                txHash: augmentedTransfer.deposit.txHash,
                blockNumber: `${augmentedTransfer.deposit.blockNumber}`,
                depositData: augmentedTransfer.deposit.depositData,
              },
            },
            execution: {
              create: {
                txHash: augmentedTransfer.execution.txHash,
                blockNumber: `${augmentedTransfer.execution.blockNumber}`,
                handlerResponse: augmentedTransfer.execution.handlerResponse,
              },
            },
            timestamp: Date.now(),
          },
        })
      } catch (e) {
        console.log("Error on creating transfer", e)
      }
    }
  }

  console.log(`Finished seeding, ${amountOfTokenTransfers} transfers created`)
}

export { seeder }
