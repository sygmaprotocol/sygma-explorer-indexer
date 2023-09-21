export const paginationSchema = {
  page: {
    type: "number",
    default: 1,
  },
  limit: {
    type: "number",
    default: 100,
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
