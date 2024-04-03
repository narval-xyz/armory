import { ConfigService } from '@narval/config-module'
import { withSwagger } from '@narval/nestjs-shared'
import { INestApplication, Logger, ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { lastValueFrom, map, of, switchMap } from 'rxjs'
import { Config } from './policy-engine.config'
import { PolicyEngineModule, ProvisionModule } from './policy-engine.module'
import { ApplicationExceptionFilter } from './shared/filter/application-exception.filter'
import { HttpExceptionFilter } from './shared/filter/http-exception.filter'

/**
 * Adds global pipes to the application.
 *
 * @param app - The INestApplication instance.
 * @returns The modified INestApplication instance.
 */
const withGlobalPipes = (app: INestApplication): INestApplication => {
  app.useGlobalPipes(new ValidationPipe({ transform: true }))

  return app
}

/**
 * Adds a global exception filter to the application.
 *
 * @param app - The Nest application instance.
 * @param configService - The configuration service instance.
 * @returns The modified Nest application instance.
 */
const withGlobalFilters =
  (configService: ConfigService<Config>) =>
  (app: INestApplication): INestApplication => {
    app.useGlobalFilters(new HttpExceptionFilter(configService), new ApplicationExceptionFilter(configService))

    return app
  }

const withCors =
  (configService: ConfigService<Config>) =>
  (app: INestApplication): INestApplication => {
    const origin = configService.get('cors')

    if (origin.length > 0) {
      app.enableCors({ origin })
    }

    return app
  }

const provision = async () => {
  const application = await NestFactory.createApplicationContext(ProvisionModule)

  await application.close()
}

async function bootstrap() {
  // NOTE: Refer to the comment in the ProvisionModule to understand why we use
  // a temporary application for the provision step.
  await provision()

  const logger = new Logger('PolicyEngineBootstrap')
  const application = await NestFactory.create(PolicyEngineModule, { bodyParser: true })
  const configService = application.get(ConfigService<Config>)
  const port = configService.get('port')

  if (!port) {
    throw new Error('Missing PORT environment variable')
  }

  await lastValueFrom(
    of(application).pipe(
      map(
        withSwagger({
          title: 'Policy Engine',
          description: 'The next generation of authorization for web3',
          version: '1.0'
        })
      ),
      map(withGlobalPipes),
      map(withGlobalFilters(configService)),
      map(withCors(configService)),
      switchMap((app) => app.listen(port))
    )
  )

  logger.log(`Policy Engine is running on port ${port}`)
}

bootstrap()
