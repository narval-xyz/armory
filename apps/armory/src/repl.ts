import { repl } from '@nestjs/core'
import { ArmoryModule } from './armory.module'

async function bootstrap() {
  try {
    await repl(ArmoryModule)
  } catch (error) {
    console.log('### ERROR', error)
    throw error
  }
}

bootstrap()
