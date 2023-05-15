import { PrismaClient, Transfer, TransferStatus } from '@prisma/client';
import { getSygmaConfig } from '../utils/getSygmaConfig';
import { SharedConfigFormated } from 'types';
import { ethers } from 'ethers';
import { Bridge__factory } from '@chainsafe/chainbridge-contracts';
const prismaClient = new PrismaClient();

const decodeAmountsOrTokenId = (data: string, decimals: number, type: "erc20" | "erc721") => {
  if (type === 'erc20') {
    const amount = ethers.utils.defaultAbiCoder.decode(['uint256'], data)[0]
    return ethers.utils.formatUnits(amount, decimals)
  } else {
    const tokenId = ethers.utils.defaultAbiCoder.decode(['uint256'], data)[0]
    return tokenId.toString();
  }

}

const seeder = async () => {
  console.log('Start seeding ...');
  try {
    await prismaClient.$connect();
  } catch (e) {
    console.log("Error on connecting to database", e);
  }

  const domains = await getSygmaConfig();
  const firstDomain = (domains as SharedConfigFormated[])[0];

  const { rpcUrl } = firstDomain;

  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const bridge = Bridge__factory.connect(firstDomain.bridge, provider);
  const depositFilter = bridge.filters.Deposit(null, null, null, null, null, null);
  const depositLogs = await provider.getLogs({
    ...depositFilter,
    fromBlock: firstDomain.startBlock,
    toBlock: "latest"
  });


  const parsedLogs = depositLogs.map((log) => ({ parsedData: bridge.interface.parseLog(log), txHash: log.transactionHash, blockNumber: log.blockNumber }));

  // Avoiding generic transfers
  const filteredResource = '0x0000000000000000000000000000000000000000000000000000000000000500';

  const onlyTokensTransfers = parsedLogs.filter((log) => {
    const { resourceID } = log.parsedData.args
    const resourceIDAndType = firstDomain.resources.find((resource) => resource.resourceId === resourceID);

    return resourceIDAndType?.resourceId === resourceID && resourceIDAndType?.resourceId !== filteredResource;
  })

  const amountOfTokenTransfers = onlyTokensTransfers.length;

  const onlyResourcesForTokensTransfers = firstDomain.resources.filter((resource) => resource.type !== 'permissionlessGeneric').map((resource) => ({ resourceId: resource.resourceId, type: resource.type }));

  for (const resource of onlyResourcesForTokensTransfers){
    await prismaClient.resource.create({
      data: {
        resourceId: resource.resourceId,
        type: resource.type,
      }
    });
  }
  console.log(`Adding ${onlyResourcesForTokensTransfers.length} resources`);

  for (const domain of domains as SharedConfigFormated[]) {
    const { name, startBlock, id  } = domain;
    await prismaClient.domain.create({
      data: {
        id: `${id}`,
        name,
        lastIndexedBlock: startBlock.toString(),
      }
    });
  }
  console.log(`Adding ${(domains as SharedConfigFormated[]).length} domains`);

  for (const pl of onlyTokensTransfers) {
    const { destinationDomainID, resourceID, depositNonce, user, data, handlerResponse } = pl.parsedData.args;
    const { txHash, blockNumber } = pl

    const destinationDomain = (domains as SharedConfigFormated[]).find((domain) => domain.id === destinationDomainID);

    const resourceIDAndType = firstDomain.resources.map((resource) => ({ resourceId: resource.resourceId, type: resource.type, tokenAddress: resource.address, tokenSymbol: resource.symbol }));

    const transferType = resourceIDAndType.find((resource) => resource.resourceId === resourceID)?.type;
    const tokenData = resourceIDAndType.find((resource) => resource.resourceId === resourceID);
    const amountOrTokenId = decodeAmountsOrTokenId(data, 18, transferType as "erc20" | "erc721");
    const arrayifyData = ethers.utils.arrayify(data);

    let filtered

    const transferStatus = ['pending', 'executed', 'failed'][Math.floor(Math.random() * 3)]

    filtered = arrayifyData.filter((_, idx) => idx + 1 > 65);
    const hexAddress = ethers.utils.hexlify(filtered);

    const transferData = {
      depositNonce: depositNonce.toNumber(),
      type: transferType,
      sender: user,
      amount: amountOrTokenId,
      destination: hexAddress,
      status: transferStatus as TransferStatus,
      resource: resourceID,
      fromDomain: `${firstDomain.id}`,
      toDomain: `${destinationDomain?.id}`
    };

    if (transferStatus === 'pending') {
      try {
        await prismaClient.transfer.create({
          data: {
            depositNonce: transferData.depositNonce,
            type: transferData.type!,
            sender: transferData.sender,
            amount: transferData.amount,
            destination: transferData.destination,
            status: transferData.status! as TransferStatus,
            resource: {
              connect: {
                resourceId: transferData.resource,
              }
            },
            fromDomain: {
              connect: {
                id: transferData.fromDomain,
              }
            },
            toDomain: {
              connect: {
                id: transferData.toDomain,
              }
            },
            timestamp: Date.now()
          },
        });
      } catch (e) {
        console.log("Error on creating transfer", e);
      }
    } else {
      let augmentedTransfer = {
        ...transferData,
        fee: {
          amount: amountOrTokenId,
          tokenAddress: tokenData?.tokenAddress,
          tokenSymbol: tokenData?.tokenSymbol,
        },
        deposit: {
          txHash,
          blockNumber,
          depositData: data,
          handlerResponse
        },
        execution: {
          txHash,
          blockNumber,
          handlerResponse,
        }
      };

      try {
        await prismaClient.transfer.create({
          data: {
            depositNonce: transferData.depositNonce,
            type: transferData.type!,
            sender: transferData.sender,
            amount: transferData.amount,
            destination: transferData.destination,
            status: transferData.status! as TransferStatus,
            resource: {
              connect: {
                resourceId: transferData.resource,
              }
            },
            fromDomain: {
              connect: {
                id: transferData.fromDomain,
              }
            },
            toDomain: {
              connect: {
                id: transferData.toDomain,
              }
            },
            fee: {
              create: {
                amount: augmentedTransfer.fee.amount,
                tokenAddress: augmentedTransfer.fee.tokenAddress!,
                tokenSymbol: augmentedTransfer.fee.tokenSymbol!,
              }
            },
            deposit: {
              create: {
                txHash: augmentedTransfer.deposit.txHash,
                blockNumber: `${augmentedTransfer.deposit.blockNumber}`,
                depositData: augmentedTransfer.deposit.depositData,
                handlerResponse: augmentedTransfer.deposit.handlerResponse,
              }
            },
            execution: {
              create: {
                txHash: augmentedTransfer.execution.txHash,
                blockNumber: `${augmentedTransfer.execution.blockNumber}`,
                handlerResponse: augmentedTransfer.execution.handlerResponse,
              }
            },
            timestamp: Date.now()
          },
        });
      } catch (e) {
        console.log("Error on creating transfer", e);
      }
    }
  }

  console.log(`Finished seeding, ${amountOfTokenTransfers} transfers created`);
};

export { seeder };