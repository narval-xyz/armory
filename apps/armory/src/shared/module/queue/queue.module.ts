import { ExpressAdapter } from '@bull-board/express'
import { BullBoardModule } from '@bull-board/nestjs'
import { ConfigService } from '@narval/config-module'
import { BullModule } from '@nestjs/bull'
import { DynamicModule } from '@nestjs/common'
import { Config, Env } from '../../../armory.config'
import { QUEUE_PREFIX } from '../../../armory.constant'

export type RegisterQueueOption = {
  name: string
}

const getQueuePrefix = (env: Env) => (env === Env.TEST ? `test:${QUEUE_PREFIX}` : QUEUE_PREFIX)

export class QueueModule {
  static forRoot(): DynamicModule {
    return {
      module: QueueModule,
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
        BullBoardModule.forRoot({
          route: '/admin/queues',
          adapter: ExpressAdapter
        })
      ]
    }
  }
}
