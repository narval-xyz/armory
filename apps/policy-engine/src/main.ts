import { ConfigService } from '@narval/config-module'
import { INestApplication, Logger, ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { patchNestJsSwagger } from 'nestjs-zod'
import { lastValueFrom, map, of, switchMap } from 'rxjs'
import { Config } from './policy-engine.config'
import { PolicyEngineModule } from './policy-engine.module'
import { ApplicationExceptionFilter } from './shared/filter/application-exception.filter'
import { HttpExceptionFilter } from './shared/filter/http-exception.filter'

/**
 * Adds Swagger documentation to the application.
 *
 * @param app - The INestApplication instance.
 * @returns The modified INestApplication instance.
 */
const withSwagger = (app: INestApplication): INestApplication => {
  // IMPORTANT: This modifies the Nest Swagger module to be compatible with
  // DTOs created by Zod schemas. The patch MUST be done before the
  // configuration process.
  patchNestJsSwagger()

  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('Policy Engine')
      .setDescription('The next generation of authorization for web3')
      .setVersion('1.0')
      .build()
  )

  SwaggerModule.setup('docs', app, document)

  return app
}

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

async function bootstrap() {
  const logger = new Logger('PolicyEngineBootstrap')
  const application = await NestFactory.create(PolicyEngineModule, { bodyParser: true })
  const configService = application.get(ConfigService<Config>)
  const port = configService.get('port')

  if (!port) {
    throw new Error('Missing PORT environment variable')
  }

  await lastValueFrom(
    of(application).pipe(
      map(withSwagger),
      map(withGlobalPipes),
      map(withGlobalFilters(configService)),
      switchMap((app) => app.listen(port))
    )
  )

  logger.log(`Policy Engine is running on port ${port}`)
}

bootstrap()
