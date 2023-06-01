import { PrismaClient } from "@prisma/client"

class ResourceRepository {
  public resource = new PrismaClient().resource

  public async insertResource(resource: { id: string; type: string }): Promise<void> {
    await this.resource.upsert({
      where: { id: resource.id },
      update: { type: resource.type },
      create: resource,
    })
  }
}
export default ResourceRepository
