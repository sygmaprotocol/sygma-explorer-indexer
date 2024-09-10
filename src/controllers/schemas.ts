/*
The Licensed Work is (c) 2023 Sygma
SPDX-License-Identifier: LGPL-3.0-only
*/

const resourceSchema = {
  type: "object",
  nullable: true,
  properties: {
    id: { type: "string", format: "ObjectId", example: "0x0000000000000000000000000000000000000000000000000000000000000001" },
    type: { type: "string", example: "ERC20" },
  },
}

const domainSchema = {
  type: "object",
  properties: {
    id: { type: "integer", format: "ObjectId", example: "1" },
    name: { type: "string", example: "Ethereum" },
    lastIndexedBlock: { type: "string", example: "12984723" },
  },
}

const feeSchema = {
  type: "object",
  nullable: true,
  properties: {
    id: { type: "string", format: "ObjectId", example: "60f7da143ce83aef2d325dd2" },
    amount: { type: "string", example: "10000000000000000" },
    tokenAddress: { type: "string", example: "0x6B175474E89094C44Da98b954EedeAC495271d0F" },
    tokenSymbol: { type: "string", example: "DAI" },
    resourceID: { type: "string", format: "ObjectId", example: "0x0000000000000000000000000000000000000000000000000000000000000001" },
    decimals: { type: "integer", nullable: true, example: 18 },
    transferId: { type: "string", format: "ObjectId", uniqueItems: true, example: "60f7da143ce83aef2d325dcd" },
  },
}

const transferStatusSchema = {
  status: {
    type: "string",
    enum: ["pending", "executed", "failed"],
  },
}

const accountSchema = {
  type: "object",
  nullable: true,
  properties: {
    id: { type: "string", format: "ObjectId", example: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e" },
    addressStatus: { type: "string" },
  },
}

const depositSchema = {
  type: "object",
  nullable: true,
  properties: {
    id: { type: "string", format: "ObjectId", example: "60f7da143ce83aef2d325dd3" },
    transferId: { type: "string", format: "ObjectId", uniqueItems: true, example: "60f7da143ce83aef2d325dcd" },
    type: { type: "string", example: "ERC20" },
    txHash: { type: "string", example: "0x9f464d3b3c85b007aef6950dbccff03e6a450a059f853802d4e7f9d4e4c8c4e2" },
    blockNumber: { type: "string", example: "12984756" },
    depositData: { type: "string", example: "0x1234567890abcdef" },
    handlerResponse: { type: "string", nullable: true, example: "0x1234567890abcdef" },
    timestamp: { type: "string", format: "date-time", nullable: true, example: "2024-04-02T12:00:00Z" },
  },
}

const executionSchema = {
  type: "object",
  nullable: true,
  properties: {
    id: { type: "string", format: "ObjectId", example: "60f7da143ce83aef2d325dd4" },
    transferId: { type: "string", format: "ObjectId", uniqueItems: true, example: "60f7da143ce83aef2d325dcd" },
    type: { type: "string", example: "ERC20" },
    txHash: { type: "string", example: "0x6b0c56d1ad5144a4bdaa7a067f8c002a7d2ad4e9f8cc00e4b4d7e6cfe1b7a8a8" },
    blockNumber: { type: "string", example: "12984799" },
    timestamp: { type: "string", format: "date-time", nullable: true, example: "2024-04-02T12:00:00Z" },
  },
}

const transferSchema = {
  type: "object",
  properties: {
    id: { type: "string", format: "ObjectId", example: "60f7da143ce83aef2d325dcd" },
    depositNonce: { type: "integer", uniqueItems: true, example: 1 },
    resourceID: { type: "string", format: "ObjectId", nullable: true, example: "0x0000000000000000000000000000000000000000000000000000000000000001" },
    resource: { ...resourceSchema },
    fromDomainId: { type: "integer", format: "ObjectId", example: "1" },
    fromDomain: { ...domainSchema },
    toDomainId: { type: "integer", format: "ObjectId", nullable: true, example: "2" },
    toDomain: { type: "object", nullable: true, properties: { ...domainSchema.properties } },
    accountId: { type: "string", format: "ObjectId", nullable: true, example: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e" },
    account: { ...accountSchema },
    destination: { type: "string", nullable: true, example: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e" },
    amount: { type: "string", nullable: true, example: "1000000000000000000" },
    message: { type: "string", nullable: true, example: "" },
    usdValue: { type: "number", nullable: true, example: 0 },
    status: { ...transferStatusSchema },
    fee: { ...feeSchema },
    deposit: { ...depositSchema },
    execution: { ...executionSchema },
  },
}

const routeSchema = {
  type: "object",
  properties: {
    fromDomainId: { type: "integer", format: "ObjectId", example: "0" },
    toDomainId: { type: "integer", format: "ObjectId", example: "1" },
    resourceId: { type: "string", format: "ObjectId", example: "0x0000000000000000000000000000000000000000000000000000000000000001" },
    type: { type: "string", example: "fungible" },
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
  summary:
    "Get all transfers with a specific domain as source or destination. Possible to get transfers by domain only as source and only as destination.",
  querystring: {
    type: "object",
    properties: {
      ...paginationSchema,
      domain: {
        type: "string",
        default: undefined,
        nullable: true,
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
      description: "Transfer",
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
      description: "Transfer",
      content: {
        "application/json": {
          schema: {
            ...transferSchema,
          },
        },
      },
    },
  },
}

export const routesByDomainSchema = {
  summary: "Get routes from a specific domain",
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
      description: "List of routes",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              routes: {
                type: "array",
                items: { ...routeSchema },
              },
            },
          },
        },
      },
    },
  },
}

export const domainsMetadataSchema = {
  summary: "Get metadata from domains",
  response: {
    200: {
      description: "Metadata",
      content: {
        "application/json": {
          schema: {
            type: "object",
            additionalProperties: {
              type: "object",
              properties: {
                url: { type: "string" },
                name: { type: "string" },
                caipId: { type: "string" },
                nativeTokenSymbol: { type: "string" },
                nativeTokenDecimals: { type: "integer" },
                nativeTokenFullName: { type: "string" },
                type: { type: "string" },
                blockExplorerUrl: { type: "string" },
                renderName: { type: "string" },
              },
            },
            example: {
              domainId1: {
                url: "https://scan.buildwithsygma.com",
                name: "Sepolia",
                caipId: "eip155:11155111",
                nativeTokenSymbol: "eth",
                nativeTokenDecimals: 18,
                nativeTokenFullName: "eth",
                type: "evm",
                blockExplorerUrl: "https://sepolia.etherscan.io",
                renderName: "Sepolia",
              },
            },
          },
        },
      },
    },
  },
}

export const resourcesByDomainSchema = {
  summary: "Get resources from a specific domain",
  response: {
    200: {
      description: "Resources",
      content: {
        "application/json": {
          schema: {
            type: "array",
            items: {
              type: "object",
              properties: {
                caipId: { type: "string" },
                symbol: { type: "string" },
                decimals: { type: "integer" },
                resourceId: { type: "string" },
              },
            },
          },
          example: {
            domainId1: [
              {
                caipId: "eip155:11155111/erc721:0x285207Cbed7AF3Bc80E05421D17AE1181d63aBd0",
                symbol: "ERC721TST",
                decimals: 0,
                resourceId: "0x",
              },
            ],
          },
        },
      },
    },
  },
}
