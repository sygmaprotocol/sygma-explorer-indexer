import { PrismaClient, Transfer, Proposal, Vote } from "@prisma/client"

type TransfersWithStatus = (Transfer & {
  status?: number,
  proposals: Proposal[]
  votes: Vote[]
})[]

class TransfesService {
  public transfers = new PrismaClient().transfer

  public async findAllTransfes() {
    const transfers: TransfersWithStatus = await this.transfers.findMany({
      include: {
        proposals: true,
        votes: true,
      },
    })
    return this.addLatestStatusToTransfer(transfers)
  }

  addLatestStatusToTransfer(
    transfers: TransfersWithStatus,
  ) {
    return transfers.map(transfer => {
      if (transfer.proposals && transfer.proposals.length > 0) {
        const proposalStatus = [...transfer.proposals].sort((a, b) => b.timestamp - a.timestamp)[0].proposalStatus
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