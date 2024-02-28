import { Injectable } from '@nestjs/common'
import { PrismaClient } from '@prisma/client/policy-engine'
import { PrismaService } from './prisma.service'

@Injectable()
export class TestPrismaService {
  constructor(private prisma: PrismaService) {}

  getClient(): PrismaClient {
    return this.prisma
  }

  async truncateAll(): Promise<void> {
    const tablenames = await this.prisma.$queryRaw<
      Array<{ tablename: string }>
    >`SELECT tablename FROM pg_tables WHERE schemaname='public'`

    for (const { tablename } of tablenames) {
      if (tablename !== '_prisma_migrations') {
        try {
          await this.prisma.$executeRawUnsafe(`TRUNCATE TABLE "public"."${tablename}" CASCADE;`)
        } catch (error) {
          // The logger may be intentionally silented during tests. Thus, we use
          // console.log to ensure engineers will see the error in the stdout.
          //
          // eslint-disable-next-line no-console
          console.error('TestPrismaService truncateAll error', error)
        }
      }
    }
  }
}
