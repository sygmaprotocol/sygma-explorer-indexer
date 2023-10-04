/*
The Licensed Work is (c) 2022 Sygma
SPDX-License-Identifier: LGPL-3.0-only
*/
import {
  DepositEvent,
  FailedHandlerExecutionEvent,
  FeeCollectedEvent,
  ProposalExecutionEvent,
  SubstrateEvent,
  SygmaPalleteEvents,
} from "./substrateTypes"

export function getSubstrateEvents(
  event: SygmaPalleteEvents,
  records: Array<SubstrateEvent>,
): Array<ProposalExecutionEvent | DepositEvent | FailedHandlerExecutionEvent | FeeCollectedEvent> {
  switch (event) {
    case SygmaPalleteEvents.ProposalExecution:
      return records.filter(
        ({ event: { method, section } }: SubstrateEvent) => method === event && section === "sygmaBridge",
      ) as unknown as Array<ProposalExecutionEvent>
    case SygmaPalleteEvents.Deposit:
      return records.filter(
        ({ event: { method, section } }: SubstrateEvent) => method === event && section === "sygmaBridge",
      ) as unknown as Array<DepositEvent>
    case SygmaPalleteEvents.FailedHandlerExecution:
      return records.filter(
        ({ event: { method, section } }: SubstrateEvent) => method === event && section === "sygmaBridge",
      ) as unknown as Array<FailedHandlerExecutionEvent>
    case SygmaPalleteEvents.FeeCollected:
      return records.filter(
        ({ event: { method, section } }: SubstrateEvent) => method === event && section === "sygmaBridge",
      ) as unknown as Array<FeeCollectedEvent>
  }
}
