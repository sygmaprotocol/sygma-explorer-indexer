/*
The Licensed Work is (c) 2022 Sygma
SPDX-License-Identifier: LGPL-3.0-only
*/
import { PrismaClient } from "@prisma/client"
import { ResourceTypes } from "../config"

class ResourceRepository {
  public resource = new PrismaClient().resource

  public async insertResource(resource: { id: string; type: ResourceTypes }): Promise<void> {
    await this.resource.upsert({
      where: { id: resource.id },
      update: { type: resource.type },
      create: resource,
    })
  }
}
export default ResourceRepository
