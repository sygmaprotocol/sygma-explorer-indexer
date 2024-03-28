/*
The Licensed Work is (c) 2023 Sygma
SPDX-License-Identifier: LGPL-3.0-only
*/

const resourceSchema = {
  type: "object",
  properties: {
    resourceId: { type: "string", format: "ObjectId", example: "0x0000000000000000000000000000000000000000000000000000000000000000" },
    type: { type: "string", example: "ERC20" },
  },
}

const domainSchema = {
  type: "object",
  properties: {
    id: { type: "string", format: "ObjectId", example: "60f7da143ce83aef2d325dd0" },
    name: { type: "string", example: "Ethereum" },
    lastIndexedBlock: { type: "string", example: "12984723" },
  },
}

const feeSchema = {
  type: "object",
  properties: {
    id: { type: "string", format: "ObjectId", example: "60f7da143ce83aef2d325dd2" },
    amount: { type: "string", example: "10000000000000000" },
    tokenAddress: { type: "string", example: "0x6B175474E89094C44Da98b954EedeAC495271d0F" },
    tokenSymbol: { type: "string", example: "DAI" },
    transferId: { type: "string", format: "ObjectId", uniqueItems: true, example: "60f7da143ce83aef2d325dcd" },
  },
}

const depositSchema = {
  type: "object",
  properties: {
    id: { type: "string", format: "ObjectId", example: "60f7da143ce83aef2d325dd3" },
    transferId: { type: "string", format: "ObjectId", uniqueItems: true, example: "60f7da143ce83aef2d325dcd" },
    type: { type: "string", example: "ERC20" },
    txHash: { type: "string", example: "0x9f464d3b3c85b007aef6950dbccff03e6a450a059f853802d4e7f9d4e4c8c4e2" },
    blockNumber: { type: "string", example: "12984756" },
    depositData: { type: "string", example: "0x1234567890abcdef" },
    handlerResponse: { type: "string", nullable: true, example: "0x1234567890abcdef" },
  },
}

const executionSchema = {
  type: "object",
  properties: {
    id: { type: "string", format: "ObjectId", example: "60f7da143ce83aef2d325dd4" },
    transferId: { type: "string", format: "ObjectId", uniqueItems: true, example: "60f7da143ce83aef2d325dcd" },
    type: { type: "string", example: "ERC20" },
    txHash: { type: "string", example: "0x6b0c56d1ad5144a4bdaa7a067f8c002a7d2ad4e9f8cc00e4b4d7e6cfe1b7a8a8" },
    blockNumber: { type: "string", example: "12984799" },
    handlerResponse: { type: "string", nullable: true, example: "0x1234567890abcdef" },
    dataHash: { type: "string", nullable: true, example: "0x9876543210abcdef" },
  },
}

const transferStatusSchema = {
  status: {
    type: "string",
    enum: ["pending", "executed", "failed"],
  },
}

const transferSchema = {
  type: "object",
  properties: {
    id: { type: "string", format: "ObjectId", example: "60f7da143ce83aef2d325dcd" },
    depositNonce: { type: "integer", uniqueItems: true, example: 1 },
    resource: { ...resourceSchema },
    fromDomain: { ...domainSchema },
    fromDomainId: { type: "string", example: "0" },
    toDomain: { ...domainSchema },
    toDomainId: { type: "string", example: "1" },
    sender: { type: "string", example: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e" },
    amount: { type: "string", example: "1000000000000000000" },
    status: { ...transferStatusSchema },
    fee: { ...feeSchema },
    timestamp: { type: "integer", nullable: true, example: 1626799380 },
    destination: { type: "string", example: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e" },
  },
}

const expandedTransferSchema = {
  type: "object",
  properties: {
    id: { type: "string", format: "ObjectId", example: "60f7da143ce83aef2d325dcd" },
    depositNonce: { type: "integer", uniqueItems: true, example: 1 },
    resource: { resourceSchema },
    fromDomain: { domainSchema },
    toDomain: { domainSchema },
    sender: { type: "string", example: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e" },
    amount: { type: "string", example: "1000000000000000000" },
    status: { ...transferStatusSchema },
    fee: { feeSchema },
    deposit: { depositSchema },
    execution: { executionSchema },
    timestamp: { type: "integer", nullable: true, example: 1626799380 },
    destination: { type: "string", example: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e" },
  },
}

const routeSchema = {
  type: "object",
  properties: {
    fromDomainId: { type: "string", example: "0" },
    toDomainId: { type: "string", example: "1" },
    resourceId: { type: "string", format: "ObjectId", example: "0x0000000000000000000000000000000000000000000000000000000000000000" },
    type: { type: "string" },
  },
}

const paginationSchema = {
  page: {
    type: "number",
    default: 1,
  },
  limit: {
    type: "number",
    default: 10,
  },
}

export const transfersSchema = {
  summary: "Get all transfers (ordered by time)",
  querystring: {
    type: "object",
    properties: {
      ...paginationSchema,
      ...transferStatusSchema,
    },
  },
  response: {
    200: {
      description: "A list of transfers",
      content: {
        "application/json": {
          schema: {
            type: "array",
            items: {
              ...transferSchema,
            },
          },
        },
      },
      example: [
        {
          id: "60f7da143ce83aef2d325dcd",
          depositNonce: 1,
          resource: {
            resourceId: "0x0000000000000000000000000000000000000000000000000000000000000000",
            type: "ERC20",
          },
          fromDomain: {
            id: "60f7da143ce83aef2d325dd0",
            name: "Ethereum",
            lastIndexedBlock: 12984723,
          },
          fromDomainId: "0",
          toDomainId: "1",
          toDomain: {
            id: "60f7da143ce83aef2d325dd0",
            name: "Polygon",
            lastIndexedBlock: 12984723,
          },
          sender: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
          amount: "1000000000000000000",
          status: "pending",
          fee: {
            id: "60f7da143ce83aef2d325dd2",
            amount: "1000000000000000000",
            tokenAddress: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
            tokenSymbol: "DAI",
            transferId: "60f7da143ce83aef2d325dcd",
          },
          timestamp: 1626854400,
        },
        {
          id: "60f7da143ce83aef2d325dce",
          depositNonce: 2,
          resource: {
            resourceId: "0x0000000000000000000000000000000000000000000000000000000000000001",
            type: "ERC20",
          },
          fromDomain: {
            id: "60f7da143ce83aef2d325dd1",
            name: "Polygon",
            lastIndexedBlock: 15000000,
          },
          fromDomainId: "1",
          toDomainId: "0",
          toDomain: {
            id: "60f7da143ce83aef2d325dd1",
            name: "Ethereum",
            lastIndexedBlock: 15000000,
          },
          sender: "0x742d35Cc6634C0532925a3b844Bc454e4438f44f",
          amount: "500000000000000000",
          status: "completed",
          deposit: {
            id: "60f7da143ce83aef2d325dcf",
            transfer: {
              resource: "0x0000000000000000000000000000000000000000000000000000000000000000",
              fromDomain: {
                id: "60f7da143ce83aef2d325dd1",
                name: "Polygon",
                lastIndexedBlock: 12345678,
              },
              toDomain: {
                id: "60f7da143ce83aef2d325dd3",
                name: "Ethereum",
                lastIndexedBlock: 23456789,
              },
              sender: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
              receiver: "0x742d35Cc6634C0532925a3b844Bc454e4438f450",
              amount: "1000000000000000000",
              timestamp: 1626854400,
            },
            transferId: "60f7da143ce83aef2d325dcf",
            txHash: "0x0a457e0c76dc5945466c0f0f2bb6c39f5e5be5f48323fa29ec02295b5df4de4d",
            blockNumber: "12984723",
            depositData: "0x0000000000000000000000000000000000000000000000000000000000000001",
            handlerResponse: "0x436f6e76657274696e6720726573706f6e73652066726f6d2068616e646c6572",
          },
          fee: {
            id: "60f7da143ce83aef2d325dd3",
            amount: "500000000000000000",
            tokenAddress: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
            tokenSymbol: "WETH",
            transferId: "60f7da143ce83aef2d325dce",
          },
          timestamp: 1651459200,
        },
        {
          id: "61a4f4c2ab4d8145c6db5f07",
          depositNonce: 2,
          resource: {
            resourceId: "0x0000000000000000000000000000000000000000000000000000000000000002",
            type: "ERC20",
          },
          fromDomain: {
            id: "60f7da143ce83aef2d325dd0",
            name: "Ethereum",
            lastIndexedBlock: 9876543,
          },
          fromDomainId: "0",
          toDomainId: "3",
          toDomain: {
            id: "61a4f4c2ab4d8145c6db5f08",
            name: "Sepolia",
            lastIndexedBlock: 1234567,
          },
          sender: "0x27cEf3AB50E1cC84d4377dDB1c579b67D707E030",
          amount: "5000000000000000000",
          status: "reverted",
          deposit: {
            id: "60f7da143ce83aef2d325dce",
            transfer: {
              id: "60f7da143ce83aef2d325dcf",
              resource: "0x0000000000000000000000000000000000000000000000000000000000000000",
              fromDomain: {
                id: "60f7da143ce83aef2d325dd1",
                name: "Ethereum",
                lastIndexedBlock: 12345678,
              },
              toDomain: {
                id: "60f7da143ce83aef2d325dd3",
                name: "Sepolia",
                lastIndexedBlock: 23456789,
              },
              sender: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
              receiver: "0x742d35Cc6634C0532925a3b844Bc454e4438f450",
              amount: "1000000000000000000",
              timestamp: 1626854400,
            },
            transferId: "60f7da143ce83aef2d325dcf",
            txHash: "0x0a457e0c76dc5945466c0f0f2bb6c39f5e5be5f48323fa29ec02295b5df4de4d",
            blockNumber: "12984723",
            depositData: "0x0000000000000000000000000000000000000000000000000000000000000001",
            handlerResponse: "0x8f7a67e5b31c7a259098b8c760f5a3f1e8102aa615fe5db5d86de18d52c5a5a5",
          },
          fee: {
            id: "61a4f4c2ab4d8145c6db5f09",
            amount: "1000000000000000000",
            tokenAddress: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
            tokenSymbol: "WETH",
            transferId: "61a4f4c2ab4d8145c6db5f07",
          },
          timestamp: 1644576000,
        },
      ],
    },
  },
}

export const transfersBySenderSchema = {
  summary: "Get all transfers initiated by a specific sender",
  querystring: {
    type: "object",
    properties: {
      ...paginationSchema,
      ...transferStatusSchema,
    },
  },
  params: {
    type: "object",
    properties: {
      senderAddress: { type: "string" },
    },
  },
  response: {
    200: {
      description: "List of transfers",
      content: {
        "application/json": {
          schema: {
            type: "array",
            items: {
              ...transferSchema,
            },
          },
        },
      },
    },
  },
}

export const transfersByResourceSchema = {
  summary: "Get all transfers for a specific resource",
  querystring: {
    type: "object",
    properties: {
      ...paginationSchema,
      ...transferStatusSchema,
    },
  },
  params: {
    type: "object",
    properties: {
      resourceID: { type: "string" },
    },
  },
  response: {
    200: {
      description: "List of transfers",
      content: {
        "application/json": {
          schema: {
            type: "array",
            items: {
              ...transferSchema,
            },
          },
        },
      },
    },
  },
}

export const transfersBySourceDomainToDestinationDomainSchema = {
  summary: "Get all transfers from a specific source domain to a specific destination domain",
  querystring: {
    type: "object",
    properties: {
      ...paginationSchema,
    },
  },
  params: {
    type: "object",
    properties: {
      sourceDomainID: { type: "number" },
      destinationDomainID: { type: "number" },
    },
  },
  response: {
    200: {
      description: "List of transfers",
      content: {
        "application/json": {
          schema: {
            type: "array",
            items: {
              ...transferSchema,
            },
          },
        },
      },
    },
  },
}

export const transfersByResourceBetweenDomainsSchema = {
  summary: "Get all transfers for a resource from a specific source domain to a specific destination domain",
  querystring: {
    type: "object",
    properties: {
      ...paginationSchema,
    },
  },
  params: {
    type: "object",
    properties: {
      resourceID: { type: "string" },
      sourceDomainID: { type: "number" },
      destinationDomainID: { type: "number" },
    },
  },
  response: {
    200: {
      description: "List of transfers",
      content: {
        "application/json": {
          schema: {
            type: "array",
            items: {
              ...transferSchema,
            },
          },
        },
      },
    },
  },
}

export const transfersByDomainSchema = {
  summary: "Get all transfers with a specific domain as source or destination",
  querystring: {
    type: "object",
    properties: {
      ...paginationSchema,
      domain: {
        type: "string",
        default: "source",
        enum: ["source", "destination"],
      },
    },
  },
  params: {
    type: "object",
    properties: {
      domainID: { type: "number" },
    },
  },
  response: {
    200: {
      description: "List of transfers",
      content: {
        "application/json": {
          schema: {
            type: "array",
            items: {
              ...transferSchema,
            },
          },
        },
      },
    },
  },
}
export const transferByTxHashAndDomainSchema = {
  summary: "Get a specific transfer by transaction hash",
  querystring: {
    type: "object",
    properties: {
      domainID: { type: "number" },
    },
  },
  params: {
    type: "object",
    properties: {
      txHash: { type: "string" },
    },
  },
  response: {
    200: {
      description: "List of transfers",
      content: {
        "application/json": {
          schema: {
            type: "array",
            items: {
              ...transferSchema,
            },
          },
        },
      },
    },
  },
}

export const transferByIdSchema = {
  summary: "Get a specific transfer by id",
  params: {
    type: "object",
    properties: {
      id: { type: "string" },
    },
  },
  response: {
    200: {
      description: "List of transfers",
      content: {
        "application/json": {
          schema: {
            type: "array",
            items: {
              ...expandedTransferSchema,
            },
          },
        },
      },
    },
  },
}

export const routesByDomainSchema = {
  summary: "Get routes for a specific domain",
  querystring: {
    type: "object",
    properties: {
      resourceType: { type: "string", default: "any", enum: ["fungible", "gmp", "any"] },
    },
  },
  params: {
    type: "object",
    properties: {
      domainID: { type: "number" },
    },
  },
  response: {
    200: {
      description: "List of transfers",
      content: {
        "application/json": {
          schema: {
            type: "array",
            items: {
              ...routeSchema,
            },
          },
        },
      },
    },
  },
}

export const domainsMetadataSchema = {
  summary: "Get domains metadata",
}
