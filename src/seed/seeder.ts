import { PrismaClient, TransferStatus } from '@prisma/client';
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

  const { rpcUrl } = firstDomain

  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const bridge = Bridge__factory.connect(firstDomain.bridge, provider);
  const depositFilter = bridge.filters.Deposit(null, null, null, null, null, null)
  const depositLogs = await provider.getLogs({
    ...depositFilter,
    fromBlock: firstDomain.startBlock,
    toBlock: "latest"
  })

  const parsedLogs = depositLogs.map((log) => bridge.interface.parseLog(log));

  // Avoiding generic transfers
  const filteredResource = '0x0000000000000000000000000000000000000000000000000000000000000500'

  const onlyTokensTransfers = parsedLogs.filter((log) => {
    const { resourceID } = log.args
    const resourceIDAndType = firstDomain.resources.find((resource) => resource.resourceId === resourceID)

    return resourceIDAndType?.resourceId === resourceID && resourceIDAndType?.resourceId !== filteredResource
  })

  const amountOfTokenTransfers = onlyTokensTransfers.length;

  for (const pl of onlyTokensTransfers) {
    const { destinationDomainID, resourceID, depositNonce, user, data, handlerResponse } = pl.args

    const destinationDomain = (domains as SharedConfigFormated[]).find((domain) => domain.id === destinationDomainID)

    const resourceIDAndType = firstDomain.resources.map((resource) => ({ resourceId: resource.resourceId, type: resource.type }))

    const transferType = resourceIDAndType.find((resource) => resource.resourceId === resourceID)?.type
    const amountOrTokenId = decodeAmountsOrTokenId(data, 18, transferType as "erc20" | "erc721")
    const arrayifyData = ethers.utils.arrayify(data);
   
    let filtered

    filtered = arrayifyData.filter((_, idx) => idx + 1 > 65);
    const hexAddress = ethers.utils.hexlify(filtered);

    const transferData = {
      depositNonce: depositNonce.toNumber(),
      type: transferType,
      sender: user,
      amount: amountOrTokenId,
      destination: hexAddress,
      status: ['pending', 'executed', 'failed'][Math.floor(Math.random() * 3)],
      resource: {
        type: transferType,
        resourceId: resourceID,
      },
      fromDomain: {
        name: firstDomain.name,
        lastIndexedBlock: firstDomain.startBlock.toString(),
        domainId: `${firstDomain.id}`
      },
      toDomain: {
        name: destinationDomain?.name,
        lastIndexedBlock: destinationDomain?.startBlock.toString(),
        domainId: `${destinationDomain?.id}`
      }
    }

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
            create: {
              type: transferData.resource.type!,
              resourceId: transferData.resource.resourceId!,
            }
          },
          fromDomain: {
            create: {
              name: transferData.fromDomain.name!,
              lastIndexedBlock: transferData.fromDomain.lastIndexedBlock!,
              domainId: transferData.fromDomain.domainId!,
            }
          },
          toDomain: {
            create: {
              name: transferData.toDomain.name!,
              lastIndexedBlock: transferData.toDomain.lastIndexedBlock!,
              domainId: transferData.toDomain.domainId!,
            }
          },
          timestamp: Date.now()
        },
      });
    } catch (e) {
      console.log("Error on creating transfer", e);
    }
  }

  console.log(`Finished seeding, ${amountOfTokenTransfers} transfers created`)
};

export { seeder };