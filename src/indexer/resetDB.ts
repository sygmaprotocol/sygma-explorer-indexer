/*
The Licensed Work is (c) 2022 Sygma
SPDX-License-Identifier: LGPL-3.0-only
*/

import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

async function resetDB() {
  await prisma.$connect()

  console.log("You're DB will be cleaned")

  const deleteTransfers = prisma.transfer.deleteMany()

  await prisma.$transaction([deleteTransfers])

  await prisma.$disconnect()
}
resetDB().catch((e) => {
  throw e
})
