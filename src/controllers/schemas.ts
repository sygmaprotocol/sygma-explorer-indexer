export const paginationSchema = {
  querystring: {
    type: "object",
    properties: {
      page: {
        type: "number",
        default: 1,
      },
      limit: {
        type: "number",
        default: 100,
      },
      status: {
        type: "string",
        enum: ["pending", "executed", "failed"],
      },
    },
  },
}

export const senderSchema = {
  querystring: {
    type: "object",
    properties: {
      page: {
        type: "number",
        default: 1,
      },
      limit: {
        type: "number",
        default: 100,
      },
      status: {
        type: "string",
        enum: ["pending", "executed", "failed"],
      },
    },
  },
  params: {
    type: "object",
    properties: {
      senderAddress: { type: "string" },
    },
  },
}

export const resourceSchema = {
  querystring: {
    type: "object",
    properties: {
      page: {
        type: "number",
        default: 1,
      },
      limit: {
        type: "number",
        default: 100,
      },
      status: {
        type: "string",
        enum: ["pending", "executed", "failed"],
      },
    },
  },
  params: {
    type: "object",
    properties: {
      resourceID: { type: "string" },
    },
  },
}

export const sourceAndDestinationDomainSchema = {
  querystring: {
    type: "object",
    properties: {
      page: {
        type: "number",
        default: 1,
      },
      limit: {
        type: "number",
        default: 100,
      },
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

export const resourceBetweenDomainsSchema = {
  querystring: {
    type: "object",
    properties: {
      page: {
        type: "number",
        default: 1,
      },
      limit: {
        type: "number",
        default: 100,
      },
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

export const domainSchema = {
  querystring: {
    type: "object",
    properties: {
      page: {
        type: "number",
        default: 1,
      },
      limit: {
        type: "number",
        default: 100,
      },
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
