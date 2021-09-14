import request from "supertest";
import { PrismaClient } from "@prisma/client";

import { app } from "../app";

const prisma = new PrismaClient();

describe("Test TransfersController", () => {
  beforeAll(async () => {
    await prisma.transfer.create({
      data: {
        depositNonce: 25,
        resourceId:
          "0x0000000000000000000000000000000000000000000000000000000000000000",
        fromChainId: 0,
        fromNetworkName: "EVM Celo Testnet",
        toChainId: 1,
        toNetworkName: "Ethereum - Rinkeby",
        fromAddress: "0x284D2Cb760D5A952f9Ea61fd3179F98a2CbF0B3E",
        toAddress: "0x42da3ba8c586f6fe9ef6ed1d09423eb73e4fe25b",
        tokenAddress: "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1",
        amount: parseInt("1000000000000000000n"),
        timestamp: 1630511631,
        depositTransactionHash:
          "0x6679cc6180fecb446bd9b2f2cba420601e4781dae5c3be681be1ef6c27214da0",
        depositBlockNumber: 7031371,
        proposals: {
          create: [
            {
              proposalStatus: 1,
              dataHash:
                "0x808499ffbc353a1c892ff051e3f2ace42f30c7b7352636988ced15dcddcb758d",
              proposalEventTransactionHash:
                "0x557e71b9d44aeb230d6a4af47002a68c5a0e58f05566b42d20d9302d3eebd0d6",
              proposalEventBlockNumber: 9217370,
              timestamp: 1630511687,
            },
            {
              proposalStatus: 2,
              dataHash:
                "0x808499ffbc353a1c892ff051e3f2ace42f30c7b7352636988ced15dcddcb758d",
              proposalEventTransactionHash:
                "0x4d742e070477ec6b05d0288da1f8ba9f8c73323e90bfb8e4d2f9fac023150bfc",
              proposalEventBlockNumber: 9217370,
              timestamp: 1630511687,
            },
            {
              proposalStatus: 3,
              dataHash:
                "0x808499ffbc353a1c892ff051e3f2ace42f30c7b7352636988ced15dcddcb758d",
              proposalEventTransactionHash:
                "0xad4d7d7d6dc402cd49e54d8094f817f5b60105ad0f56310568a3318a84751fd7",
              proposalEventBlockNumber: 9217371,
              timestamp: 1630511702,
            },
          ],
        },
        votes: {
          create: [
            {
              voteBlockNumber: 9217370,
              voteTransactionHash:
                "0x557e71b9d44aeb230d6a4af47002a68c5a0e58f05566b42d20d9302d3eebd0d6",
              dataHash: null,
              timestamp: 1630511687,
              voteStatus: true,
            },
            {
              voteBlockNumber: 9217370,
              voteTransactionHash:
                "0x4d742e070477ec6b05d0288da1f8ba9f8c73323e90bfb8e4d2f9fac023150bfc",
              dataHash: null,
              timestamp: 1630511687,
              voteStatus: true,
            },
          ],
        },
      },
    });
    console.log("✨ 1 transfer successfully created!");
  });

  afterAll(async () => {
    await prisma.vote.deleteMany({});
    await prisma.proposal.deleteMany({});
    await prisma.transfer.deleteMany({});

    await prisma.$disconnect();
  });
  
  it("Request /transfers should return one transfers with proposals and votes", async () => {
    const result = await request(app).get("/transfers").send();

    expect(result.status).toBe(200);
    expect(result.body[0]).toMatchObject({
      depositNonce: 25,
      resourceId:
        "0x0000000000000000000000000000000000000000000000000000000000000000",
      fromChainId: 0,
      fromNetworkName: "EVM Celo Testnet",
      toChainId: 1,
      toNetworkName: "Ethereum - Rinkeby",
      fromAddress: "0x284D2Cb760D5A952f9Ea61fd3179F98a2CbF0B3E",
      toAddress: "0x42da3ba8c586f6fe9ef6ed1d09423eb73e4fe25b",
      tokenAddress: "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1",
      amount: "1000000000000000000n",
      timestamp: 1630511631,
      depositTransactionHash:
        "0x6679cc6180fecb446bd9b2f2cba420601e4781dae5c3be681be1ef6c27214da0",
      depositBlockNumber: 7031371,
      proposals: [
        {
          proposalStatus: 1,
          dataHash:
            "0x808499ffbc353a1c892ff051e3f2ace42f30c7b7352636988ced15dcddcb758d",
          proposalEventTransactionHash:
            "0x557e71b9d44aeb230d6a4af47002a68c5a0e58f05566b42d20d9302d3eebd0d6",
          proposalEventBlockNumber: 9217370,
          timestamp: 1630511687,
        },
        {
          proposalStatus: 2,
          dataHash:
            "0x808499ffbc353a1c892ff051e3f2ace42f30c7b7352636988ced15dcddcb758d",
          proposalEventTransactionHash:
            "0x4d742e070477ec6b05d0288da1f8ba9f8c73323e90bfb8e4d2f9fac023150bfc",
          proposalEventBlockNumber: 9217370,
          timestamp: 1630511687,
        },
        {
          proposalStatus: 3,
          dataHash:
            "0x808499ffbc353a1c892ff051e3f2ace42f30c7b7352636988ced15dcddcb758d",
          proposalEventTransactionHash:
            "0xad4d7d7d6dc402cd49e54d8094f817f5b60105ad0f56310568a3318a84751fd7",
          proposalEventBlockNumber: 9217371,
          timestamp: 1630511702,
        },
      ],
      votes: [
        {
          voteBlockNumber: 9217370,
          voteTransactionHash:
            "0x557e71b9d44aeb230d6a4af47002a68c5a0e58f05566b42d20d9302d3eebd0d6",
          dataHash: null,
          timestamp: 1630511687,
          voteStatus: true,
        },
        {
          voteBlockNumber: 9217370,
          voteTransactionHash:
            "0x4d742e070477ec6b05d0288da1f8ba9f8c73323e90bfb8e4d2f9fac023150bfc",
          dataHash: null,
          timestamp: 1630511687,
          voteStatus: true,
        },
      ],
    });
  });
});
