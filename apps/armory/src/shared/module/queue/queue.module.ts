import { ExpressAdapter } from '@bull-board/express'
import { BullBoardModule } from '@bull-board/nestjs'
import { BullModule } from '@nestjs/bull'
import { DynamicModule } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Config, Env } from '../../../orchestration.config'
import { QUEUE_PREFIX } from '../../../orchestration.constant'

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
          useFactory: async (configService: ConfigService<Config, true>) => {
            const env = configService.get('env', { infer: true })

            return {
              prefix: getQueuePrefix(env),
              redis: configService.get('redis', { infer: true })
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
