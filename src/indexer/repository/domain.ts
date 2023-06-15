import { Domain, PrismaClient } from "@prisma/client"

class DomainRepository {
  public domain = new PrismaClient().domain

  public async insertDomain(domainID: number, latestBlock: string, domainName: string): Promise<void> {
    const domain = await this.getLastIndexedBlock(domainID.toString())
    if (!domain) {
      await this.domain.create({
        data: {
          id: domainID.toString(),
          name: domainName,
          lastIndexedBlock: latestBlock,
        },
      })
    }
  }
  public async updateBlock(blockNumber: string, domainID: number): Promise<void> {
    await this.domain.update({
      where: {
        id: domainID.toString(),
      },
      data: {
        lastIndexedBlock: blockNumber,
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
