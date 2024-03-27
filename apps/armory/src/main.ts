import { withSwagger } from '@narval/nestjs-shared'
import { ClassSerializerInterceptor, INestApplication, Logger, ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory, Reflector } from '@nestjs/core'
import { lastValueFrom, map, of, switchMap } from 'rxjs'
import { Config } from './armory.config'
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
  (configService: ConfigService<Config, true>) =>
  (app: INestApplication): INestApplication => {
    app.useGlobalFilters(
      new ApplicationExceptionFilter(configService),
      new ZodExceptionFilter(configService),
      new HttpExceptionFilter(configService)
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
  const logger = new Logger('ArmoryBootstrap')
  const application = await NestFactory.create(ArmoryModule)
  const configService = application.get<ConfigService<Config, true>>(ConfigService)
  const port = configService.get('port', { infer: true })

  await lastValueFrom(
    of(application).pipe(
      map(
        withSwagger({
          title: 'Armory',
          description: 'Armory is the most secure access management for web3',
          version: '1.0'
        })
      ),
      map(withGlobalPipes),
      map(withGlobalInterceptors),
      map(withGlobalFilters(configService)),
      switchMap((app) => app.listen(port))
    )
  )

  logger.log(`Armory is running on port ${port}`)
}

bootstrap()
