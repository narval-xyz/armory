import { CommandFactory } from 'nest-commander'
import { CliModule } from './cli/cli.module'

async function bootstrap() {
  await CommandFactory.run(CliModule, ['error'])
}

bootstrap()
