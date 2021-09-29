import { PrismaClient, Transfer, ProposalEvent, VoteEvent } from "@prisma/client"

type TransfersWithStatus = (Transfer & {
  status?: number,
  proposalEvents: ProposalEvent[]
  voteEvents: VoteEvent[]
})[]

type AllTransfersOption = {
  limit: number
  skipIndex: number
}

class TransfesService {
  public transfers = new PrismaClient().transfer

  public async findAllTransfes({ limit, skipIndex }: AllTransfersOption) {
    const transfers: TransfersWithStatus = await this.transfers.findMany({
      take: limit,
      skip: skipIndex,
      include: {
        proposalEvents: true,
        voteEvents: true,
      },
    })
    return this.addLatestStatusToTransfer(transfers)
  }

  addLatestStatusToTransfer(transfers: TransfersWithStatus) {
    return transfers.map(transfer => {
      if (transfer.proposalEvents && transfer.proposalEvents.length > 0) {
        const proposalStatus = [...transfer.proposalEvents].sort((a, b) => b.timestamp - a.timestamp)[0].proposalStatus
        transfer.status = proposalStatus
      } else {
        // Active status by default
        transfer.status = 1
      }
      return transfer
    })
  }
}
export default TransfesService
