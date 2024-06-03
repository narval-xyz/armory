import { ExpressAdapter } from '@bull-board/express'
import { BullBoardModule } from '@bull-board/nestjs'
import { ConfigService } from '@narval/config-module'
import { BullModule } from '@nestjs/bull'
import { MiddlewareConsumer, Module } from '@nestjs/common'
import { Config, Env } from '../../../armory.config'
import { QUEUE_PREFIX } from '../../../armory.constant'
import { DashboardAuthProxyMiddleware } from './dashboard-auth-proxy.middleware'
import { QueueModuleDefinition, QueueModuleOption } from './queue.module-definition'

const getQueuePrefix = (env: Env) => (env === Env.TEST ? `test:${QUEUE_PREFIX}` : QUEUE_PREFIX)

const DASHBOARD_ROUTE = '/admin/queues'

@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService<Config>) => {
        const env = configService.get('env')

        return {
          prefix: getQueuePrefix(env),
          redis: configService.get('redis')
        }
      }
    }),
    // TODO: (@wcalderipe, 03/06/24) The BullBoard isn't necessary during
    // tests. It's possible to conditionally load it depending on the
    // environment to improve test times.
    BullBoardModule.forRoot({
      route: DASHBOARD_ROUTE,
      adapter: ExpressAdapter
    })
  ],
  providers: [DashboardAuthProxyMiddleware]
})
export class QueueModule extends QueueModuleDefinition {
  private configService: ConfigService<Config>

  private dashboardAuthProxyMiddleware: DashboardAuthProxyMiddleware

  constructor(configService: ConfigService<Config>, dashboardAuthProxyMiddleware: DashboardAuthProxyMiddleware) {
    super()

    this.configService = configService
    this.dashboardAuthProxyMiddleware = dashboardAuthProxyMiddleware
  }

  configure(consumer: MiddlewareConsumer) {
    const env = this.configService.get('env')

    if (env !== Env.DEVELOPMENT && env !== Env.TEST) {
      consumer.apply(this.dashboardAuthProxyMiddleware.use).forRoutes(DASHBOARD_ROUTE)
    }
  }

  // NOTE: Convinent method to call register with no options during tests.
  static register(options?: QueueModuleOption) {
    return super.register(options || {})
  }
}
