import { repl } from '@nestjs/core'
import { OrchestrationModule } from './armory.module'

async function bootstrap() {
  try {
    await repl(OrchestrationModule)
  } catch (error) {
    console.log('### ERROR', error)
    throw error
  }
}

bootstrap()
