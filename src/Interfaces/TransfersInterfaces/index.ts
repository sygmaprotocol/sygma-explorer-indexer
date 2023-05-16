export interface ITransfer {
  before?: string;
  first?: string;
  after?: string;
  last?: string;
}

export interface ITransferById {
  id: string;
}

export interface ITransferBySender {
  sender: string;
}