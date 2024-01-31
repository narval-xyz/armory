import { Injectable } from '@nestjs/common'
import { PrismaClient } from '@prisma/client/authz'
import { PrismaService } from './prisma.service'

@Injectable()
export class TestPrismaService {
  constructor(private prisma: PrismaService) {}

  getClient(): PrismaClient {
    return this.prisma
  }

  async truncateAll(): Promise<void> {
    const tablenames = await this.prisma.$queryRaw<
      Array<{ name: string }>
    >`SELECT name FROM sqlite_master WHERE type='table'`

    for (const { name } of tablenames) {
      if (name !== '_prisma_migrations') {
        try {
          await this.prisma.$executeRawUnsafe(
            `DELETE FROM ${name}; UPDATE SQLITE_SEQUENCE SET seq = 0 WHERE name = '${name}';`
          )
        } catch (error) {
          // The logger may be intentionally silented during tests. Thus, we use
          // console.log to ensure engineers will see the error in the stdout.
          //
          // eslint-disable-next-line no-console
          console.error('TestPrismaService DELETE error', error)
        }
      }
    }
  }
}
