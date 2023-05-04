export interface ITransfer {
  before?: string;
  first?: string;
  after?: string;
  last?: string;
}

export interface ITransferOffSet {
  page?: string;
  limit?: string;
}

export interface ITransferById {
  id: string;
}

export interface ITransferByTransactionHash {
  hash: string;
}