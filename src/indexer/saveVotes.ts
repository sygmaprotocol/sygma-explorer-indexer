import { ethers, utils, Event } from "ethers";

import { PrismaClient } from "@prisma/client";
import { getNetworkName } from "../utils/helpers";
import { Bridge } from "@chainsafe/chainbridge-contracts";
import { ChainbridgeConfig, EvmBridgeConfig } from "./chainbridgeTypes";

const prisma = new PrismaClient();

export async function saveVotes(
  bridge: EvmBridgeConfig,
  bridgeContract: Bridge,
  provider: ethers.providers.JsonRpcProvider,
  config: ChainbridgeConfig
) {
  const proposalVoteFilter = bridgeContract.filters.ProposalVote(
    null,
    null,
    null,
    null
  );

  const proposalVoteLogs = await provider.getLogs({
    ...proposalVoteFilter,
    fromBlock: bridge.deployedBlockNumber,
  });
  for (const pvl of proposalVoteLogs) {
    const parsedLog = bridgeContract.interface.parseLog(pvl);

    await prisma.vote.create({
      data: {
        voteBlockNumber: pvl.blockNumber,
        voteTransactionHash: pvl.transactionHash,
        dataHash: parsedLog.args.dataHash,
        timestamp: (await provider.getBlock(pvl.blockNumber)).timestamp,
        voteStatus: Boolean(parsedLog.args.status),

        transfer: {
          connectOrCreate: {
            where: {
              depositNonce: parsedLog.args.depositNonce.toNumber(),
            },
            create: {
              depositNonce: parsedLog.args.depositNonce.toNumber(),
              resourceId: parsedLog.args.resourceID,
              fromChainId: parsedLog.args.originChainID,
              fromNetworkName: getNetworkName(
                parsedLog.args.originChainID,
                config
              ),
              toChainId: bridge.chainId,
              toNetworkName: bridge.name,
            },
          },
        },
      },
    });
  }
  console.log(
    `Added ${bridge.name} ${proposalVoteLogs.length} proposal votes`
  );
}
