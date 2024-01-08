import { Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app/app.module'

async function bootstrap() {
  const logger = new Logger('AuthorizationNodeBootstrap')
  const app = await NestFactory.create(AppModule)
  const configService = app.get(ConfigService)
  const port = configService.get('PORT')

  if (!port) {
    throw new Error('Missing PORT environment variable')
  }

  await app.listen(port)

  logger.log(`AuthZ is running on port ${port}`)
}

bootstrap()
