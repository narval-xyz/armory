import { INestApplication, Logger, ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app/app.module'
import { lastValueFrom, map, of, switchMap } from 'rxjs'

/**
 * Adds global pipes to the application.
 *
 * @param app - The INestApplication instance.
 * @returns The modified INestApplication instance.
 */
const withGlobalPipes = (app: INestApplication): INestApplication => {
  app.useGlobalPipes(new ValidationPipe())

  return app
}

async function bootstrap() {
  const logger = new Logger('AuthorizationNodeBootstrap')
  const application = await NestFactory.create(AppModule)
  const configService = application.get(ConfigService)
  const port = configService.get('PORT')

  if (!port) {
    throw new Error('Missing PORT environment variable')
  }

    await lastValueFrom(
      of(application).pipe(
        map(withGlobalPipes),
        switchMap((app) => app.listen(port))
      )
    )

  logger.log(`AuthZ is running on port ${port}`)
}

bootstrap()
