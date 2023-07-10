import { Domain, PrismaClient } from "@prisma/client"
import { logger } from "../../utils/logger"

class DomainRepository {
  public domain = new PrismaClient().domain

  public async insertDomain(domainID: number, latestBlock: string, domainName: string): Promise<void> {
    const domain = await this.getLastIndexedBlock(domainID)
    if (!domain) {
      await this.domain.create({
        data: {
          id: domainID,
          name: domainName,
          lastIndexedBlock: latestBlock,
        },
      })
    }
  }
  public async updateBlock(blockNumber: string, domainID: number): Promise<void> {
    try {
      await this.domain.update({
        where: {
          id: domainID,
        },
        data: {
          lastIndexedBlock: blockNumber,
        },
      })
    } catch (error) {
      logger.error(`Error updating block number for domain ${domainID.toString()}`, error)
    }
  }

  public async getLastIndexedBlock(domainID: number): Promise<Domain | null> {
    return await this.domain.findFirst({
      where: {
        id: domainID,
      },
    })
  }
}
export default DomainRepository
