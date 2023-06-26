import { DepositEvent, ProposalExecutionEvent, SubstrateEvent, SygmaPalleteEvents } from "./substrateTypes";

export function getSubstrateEvents(event: SygmaPalleteEvents, records: Array<SubstrateEvent>): Array<ProposalExecutionEvent | DepositEvent> {
  switch (event) {
    case SygmaPalleteEvents.ProposalExecution:
      return records.filter(({ event: { method, section } }: SubstrateEvent) => method === event && section === "sygmaBridge") as unknown as Array<ProposalExecutionEvent>
    case SygmaPalleteEvents.Deposit:
      return records.filter(({ event: { method, section } }: SubstrateEvent) => method === event && section === "sygmaBridge") as unknown as Array<DepositEvent>
  }
}