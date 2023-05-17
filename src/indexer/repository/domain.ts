import { Domain, PrismaClient } from "@prisma/client"

class DomainRepository {
  public domain = new PrismaClient().domain

  public async upserDomain(domainID: number, latestBlock: string, domainName: string): Promise<void> {
    await this.domain.upsert({
      where: {
        id: domainID.toString(),
      },
      create: {
        id: domainID.toString(),
        name: domainName,
        lastIndexedBlock: latestBlock,
      },
      update: {
        lastIndexedBlock: latestBlock,
      },
    })
  }
  public async getLastIndexedBlock(domainID: string): Promise<Domain | null> {
    return await this.domain.findFirst({
      where: {
        id: domainID,
      },
    })
  }
}
export default DomainRepository
