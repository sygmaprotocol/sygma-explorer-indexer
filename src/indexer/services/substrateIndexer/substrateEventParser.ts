import { DepositEvent, ProposalExecutionEvent, SubstrateEvent, SygmaPalleteEvents } from "./substrateTypes";

export function getSubstrateEvent(event: SygmaPalleteEvents, records: Array<SubstrateEvent>): ProposalExecutionEvent | DepositEvent {
  switch (event) {
    case SygmaPalleteEvents.ProposalExecution:
      return records.find(({ event: { method, section } }: SubstrateEvent) => method === event && section === "sygmaBridge") as unknown as ProposalExecutionEvent
    case SygmaPalleteEvents.Deposit:
      return records.find(({ event: { method, section } }: SubstrateEvent) => method === event && section === "sygmaBridge") as unknown as DepositEvent
  }
}