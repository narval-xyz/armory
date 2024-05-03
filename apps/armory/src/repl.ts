import { repl } from '@nestjs/core'
import { ArmoryModule } from './armory.module'

async function bootstrap() {
  try {
    await repl(ArmoryModule)
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('REPL error', error)
    throw error
  }
}

bootstrap()
