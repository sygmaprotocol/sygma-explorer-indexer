/*
The Licensed Work is (c) 2022 Sygma
SPDX-License-Identifier: LGPL-3.0-only
*/
export interface ITransfer {
  before?: string;
  first?: string;
  after?: string;
  last?: string;
}

export interface ITransferById {
  id: string;
}