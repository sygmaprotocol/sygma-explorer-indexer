
import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

async function resetDB() {
  await prisma.$connect()

  console.log("You're DB will be cleaned")

  const deleteVotes = prisma.voteEvent.deleteMany()
  const deleteProposals = prisma.proposalEvent.deleteMany()
  const deleteTransfers = prisma.transfer.deleteMany()

  await prisma.$transaction([deleteVotes, deleteProposals, deleteTransfers])

  await prisma.$disconnect()
}
resetDB().catch((e) => {
  throw e
})
