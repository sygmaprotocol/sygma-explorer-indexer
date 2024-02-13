/*
The Licensed Work is (c) 2023 Sygma
SPDX-License-Identifier: LGPL-3.0-only
*/
export const paginationSchema = {
  page: {
    type: "number",
    default: 1,
  },
  limit: {
    type: "number",
    default: 10,
  },
}

export const transferStatusSchema = {
  status: {
    type: "string",
    enum: ["pending", "executed", "failed"],
  },
}

export const transfersSchema = {
  querystring: {
    type: "object",
    properties: {
      ...paginationSchema,
      ...transferStatusSchema,
    },
  },
}

export const transfersBySenderSchema = {
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
}

export const transfersByResourceSchema = {
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
}

export const transfersBySourceDomainToDestinationDomainSchema = {
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
}

export const transfersByResourceBetweenDomainsSchema = {
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
}

export const transfersByDomainSchema = {
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
}

export const transferByTxHashSchema = {
  params: {
    type: "object",
    properties: {
      txHash: { type: "string" },
    },
  },
}

export const transferByTxHashAndDomainSchema = {
  params: {
    type: "object",
    properties: {
      txHash: { type: "string" },
      domainID: { type: "number" },
    },
  },
}

export const transferByIdSchema = {
  params: {
    type: "object",
    properties: {
      id: { type: "string" },
    },
  },
}

export const routesByDomainSchema = {
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
}

export const domainsMetadataSchema = {}
