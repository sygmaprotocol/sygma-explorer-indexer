
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function resetDB() {
  await prisma.$connect();

  console.log("You're DB will be cleaned")

  await prisma.vote.deleteMany({});
  await prisma.proposal.deleteMany({});
  await prisma.transfer.deleteMany({});
  
  await prisma.$disconnect();
}
resetDB().catch((e) => {
  throw e;
})