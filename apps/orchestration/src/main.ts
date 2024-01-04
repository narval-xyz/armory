import { OrchestrationModule } from '@app/orchestration/orchestration.module'
import { INestApplication, Logger, ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { lastValueFrom, map, of, switchMap } from 'rxjs'
import { Config } from './orchestration.config'

/**
 * Sets up Swagger documentation for the application.
 *
 * @param app - The INestApplication instance.
 * @param logger - The logger instance.
 * @returns The modified INestApplication instance.
 */
const setupSwagger = (app: INestApplication, logger: Logger): INestApplication => {
  logger.log('Setting up Swagger')

  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder().setTitle('Orchestration').setVersion('1.0').addTag('Orchestration').build()
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
 * Sets up REST global validation for the application.
 *
 * @param app - The INestApplication instance.
 * @param logger - The logger instance.
 * @returns The modified INestApplication instance.
 */
const setupRestValidation = (app: INestApplication, logger: Logger): INestApplication => {
  logger.log('Setting up REST global validation')

  app.useGlobalPipes(new ValidationPipe())

  return app
}

/**
 * Boots up the orchestration application.
 *
 * @returns {Promise<void>} A promise that resolves when the application is
 * successfully bootstrapped.
 */
async function bootstrap() {
  const logger = new Logger('OrchestrationBootstrap')
  const application = await NestFactory.create(OrchestrationModule)
  const configService = application.get<ConfigService<Config, true>>(ConfigService)
  const port = configService.get('port', { infer: true })

  await lastValueFrom(
    of(application).pipe(
      map((app) => setupSwagger(app, logger)),
      map((app) => setupRestValidation(app, logger)),
      switchMap((app) => app.listen(port))
    )
  )

  logger.log(`Orchestration is running on port ${port}`)
}

bootstrap()
