import { OrchestrationModule } from '@app/orchestration/orchestration.module'
import { repl } from '@nestjs/core'

async function bootstrap() {
  try {
    await repl(OrchestrationModule)
  } catch (error) {
    console.log('### ERROR', error)
    throw error
  }
}

bootstrap()
