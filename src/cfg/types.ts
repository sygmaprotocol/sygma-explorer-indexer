export type Domain = {
  id: number;
  name: string;
  type: string;
  bridge: string;
  nativeTokenSymbol: string;
  nativeTokenFullName: string;
  nativeTokenDecimals: number;
  blockConfirmations: number;
  startBlock: number;
  handlers: Handler[];
  feeHandlers: FeeHandler[];
  resources: Resource[];
};

export type Handler = {
  type: string;
  address: string;
};

export type FeeHandler = {
  address: string;
  type: string;
};

export type Resource = {
  resourceId: string;
  type: string;
  address: string;
  symbol: string;
};

export type SharedConfiguration = {
  domains: Domain[];
};
