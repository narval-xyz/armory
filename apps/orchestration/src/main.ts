import { OrchestrationModule } from '@app/orchestration/orchestration.module'
import { ClassSerializerInterceptor, INestApplication, Logger, ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory, Reflector } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { lastValueFrom, map, of, switchMap, tap } from 'rxjs'
import { Config } from './orchestration.config'

/**
 * Sets up Swagger documentation to the application.
 *
 * @param app - The INestApplication instance.
 * @returns The modified INestApplication instance.
 */
const withSwagger = (app: INestApplication): INestApplication => {
  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('Orchestration')
      .setDescription('Orchestration is the most secure infrastructure to run authorization for web3.')
      .setVersion('1.0')
      .build()
  )
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      // Temporary disable the "Try it out" button while the API is just a
      // placeholder.
      supportedSubmitMethods: []
    }
  })

  return app
}

/**
 * Sets up global pipes to the application.
 *
 * @param app - The INestApplication instance.
 * @returns The modified INestApplication instance.
 */
const withGlobalPipes = (app: INestApplication): INestApplication => {
  app.useGlobalPipes(new ValidationPipe())

  return app
}

/**
 * Sets up global interceptors to application.
 *
 * @param app - The Nest application instance.
 * @returns The modified Nest application instance.
 */
const withGlobalInterceptors = (app: INestApplication): INestApplication => {
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)))

  return app
}

/**
 * Boots up the orchestration application.
 *
 * @returns {Promise<void>} A promise that resolves when the application is
 * successfully bootstrapped.
 */
async function bootstrap(): Promise<void> {
  const logger = new Logger('OrchestrationBootstrap')
  const application = await NestFactory.create(OrchestrationModule)
  const configService = application.get<ConfigService<Config, true>>(ConfigService)
  const port = configService.get('port', { infer: true })

  await lastValueFrom(
    of(application).pipe(
      map(withSwagger),
      tap(() => logger.log('Added Swagger')),
      map(withGlobalPipes),
      tap(() => logger.log('Added global validation pipe')),
      map(withGlobalInterceptors),
      tap(() => logger.log('Added global interceptors')),
      switchMap((app) => app.listen(port))
    )
  )

  logger.log(`Orchestration is running on port ${port}`)
}

bootstrap()
