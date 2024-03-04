import { Inject, Injectable, Logger, OnApplicationShutdown, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaClient } from '@prisma/client/policy-engine'
import { Config } from '../../../../policy-engine.config'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy, OnApplicationShutdown {
  private logger = new Logger(PrismaService.name)

  constructor(@Inject(ConfigService) configService: ConfigService<Config, true>) {
    const url = configService.get('database.url', { infer: true })

    super({
      datasources: {
        db: { url }
      }
    })
  }

  async onModuleInit() {
    this.logger.log({
      message: 'Connecting to Prisma on database module initialization'
    })

    await this.$connect()
  }

  async onModuleDestroy() {
    this.logger.log({
      message: 'Disconnecting from Prisma on module destroy'
    })

    await this.$disconnect()
  }

  // In Prisma v5, the `beforeExit` is no longer available. Instead, we use
  // NestJS' application shutdown to disconnect from the database. The shutdown
  // hooks are called when the process receives a termination event lig SIGhooks
  // are called when the process receives a termination event lig SIGTERM.
  //
  // See also https://www.prisma.io/docs/guides/upgrade-guides/upgrading-versions/upgrading-to-prisma-5#removal-of-the-beforeexit-hook-from-the-library-engine
  onApplicationShutdown(signal: string) {
    this.logger.log({
      message: 'Disconnecting from Prisma on application shutdown',
      signal
    })

    // The $disconnect method returns a promise, so idealy we should wait for it
    // to finish. However, the onApplicationShutdown, returns `void` making it
    // impossible to ensure the database will be properly disconnected before
    // the shutdown.
    this.$disconnect()
  }
}
