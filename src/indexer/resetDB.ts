
import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

async function resetDB() {
  await prisma.$connect()

  console.log("You're DB will be cleaned")

  await prisma.voteEvent.deleteMany({})
  await prisma.proposalEvent.deleteMany({})
  await prisma.transfer.deleteMany({})

  await prisma.$disconnect()
}
resetDB().catch((e) => {
  throw e
})
