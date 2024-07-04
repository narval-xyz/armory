import { ConfigService } from '@narval/config-module'
import { LoggerService, withCors, withLogger, withSwagger } from '@narval/nestjs-shared'
import { ClassSerializerInterceptor, INestApplication, ValidationPipe } from '@nestjs/common'
import { NestFactory, Reflector } from '@nestjs/core'
import { lastValueFrom, map, of, switchMap } from 'rxjs'
import { Config } from './armory.config'
import { ADMIN_SECURITY, CLIENT_ID_SECURITY, CLIENT_SECRET_SECURITY } from './armory.constant'
import { ArmoryModule } from './armory.module'
import { ApplicationExceptionFilter } from './shared/filter/application-exception.filter'
import { HttpExceptionFilter } from './shared/filter/http-exception.filter'
import { ZodExceptionFilter } from './shared/filter/zod-exception.filter'

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
 * Adds global interceptors to application.
 *
 * @param app - The Nest application instance.
 * @returns The modified Nest application instance.
 */
const withGlobalInterceptors = (app: INestApplication): INestApplication => {
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)))

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
  (configService: ConfigService<Config>, logger: LoggerService) =>
  (app: INestApplication): INestApplication => {
    app.useGlobalFilters(
      new ApplicationExceptionFilter(configService, logger),
      new ZodExceptionFilter(configService, logger),
      new HttpExceptionFilter(configService, logger)
    )

    return app
  }

/**
 * Boots up the armory application.
 *
 * @returns {Promise<void>} A promise that resolves when the application is
 * successfully bootstrapped.
 */
async function bootstrap(): Promise<void> {
  const application = await NestFactory.create(ArmoryModule, { bufferLogs: true })
  const configService = application.get<ConfigService<Config>>(ConfigService)
  const logger = application.get<LoggerService>(LoggerService)
  const port = configService.get('port')

  // NOTE: Enable application shutdown lifecyle hooks to ensure connections are
  // close on exit.
  application.enableShutdownHooks()

  await lastValueFrom(
    of(application).pipe(
      map(withLogger),
      map(
        withSwagger({
          title: 'Armory',
          description: 'Authentication and authorization system for web3.0',
          version: '1.0',
          security: [ADMIN_SECURITY, CLIENT_ID_SECURITY, CLIENT_SECRET_SECURITY]
        })
      ),
      map(withGlobalPipes),
      map(withGlobalInterceptors),
      map(withGlobalFilters(configService, logger)),
      map(withCors(configService.get('cors'))),
      switchMap((app) => app.listen(port))
    )
  )

  logger.log(`Armory is running on port ${port}`)
}

bootstrap()
