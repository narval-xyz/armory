import { Injectable } from '@nestjs/common'
import { PrismaClient } from '@prisma/client/vault'
import {
  TEST_ACCOUNTS,
  TEST_ADDRESSES,
  TEST_CONNECTIONS,
  TEST_WALLET_CONNECTIONS,
  TEST_WALLETS
} from '../../../../broker/__test__/util/mock-data'
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

  async seedBrokerTestData(): Promise<void> {
    const client = this.getClient()

    await client.providerConnection.createMany({
      data: TEST_CONNECTIONS.map((connection) => ({
        ...connection,
        credentials: JSON.stringify(connection.credentials)
      }))
    })

    await client.providerWallet.createMany({
      data: TEST_WALLETS
    })

    await client.providerWalletConnection.createMany({
      data: TEST_WALLET_CONNECTIONS
    })

    await client.providerAccount.createMany({
      data: TEST_ACCOUNTS
    })

    await client.providerAddress.createMany({
      data: TEST_ADDRESSES
    })
  }
}
