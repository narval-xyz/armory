import { ConfigService } from '@narval/config-module'
import { LoggerService } from '@narval/nestjs-shared'
import { Injectable, OnApplicationShutdown, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { PrismaClient } from '@prisma/client/armory'
import { Config } from '../../../../armory.config'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy, OnApplicationShutdown {
  constructor(
    configService: ConfigService<Config>,
    private logger: LoggerService
  ) {
    super({
      datasources: {
        db: { url: configService.get('database.url') }
      }
    })
  }

  async onModuleInit() {
    this.logger.log('Connecting to Prisma on database module initialization')

    await this.$connect()
  }

  async onModuleDestroy() {
    this.logger.log('Disconnecting from Prisma on module destroy')

    await this.$disconnect()
  }

  // In Prisma v5, the `beforeExit` is no longer available. Instead, we use
  // NestJS' application shutdown to disconnect from the database. The shutdown
  // hooks are called when the process receives a termination event lig SIGhooks
  // are called when the process receives a termination event lig SIGTERM.
  //
  // See also https://www.prisma.io/docs/guides/upgrade-guides/upgrading-versions/upgrading-to-prisma-5#removal-of-the-beforeexit-hook-from-the-library-engine
  onApplicationShutdown(signal: string) {
    this.logger.log('Disconnecting from Prisma on application shutdown', {
      signal
    })

    // The $disconnect method returns a promise, so idealy we should wait for it
    // to finish. However, the onApplicationShutdown, returns `void` making it
    // impossible to ensure the database will be properly disconnected before
    // the shutdown.
    this.$disconnect()
  }
}
