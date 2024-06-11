import { ConfigService } from '@narval/config-module'
import { adminApiKeySecurity, gnapSecurity, withCors, withSwagger } from '@narval/nestjs-shared'
import { INestApplication, Logger, ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { HEADER_ADMIN_API_KEY } from 'packages/armory-sdk/src/lib/constants'
import { lastValueFrom, map, of, switchMap } from 'rxjs'
import { Config } from './main.config'
import { MainModule, ProvisionModule } from './main.module'

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

const provision = async () => {
  const application = await NestFactory.createApplicationContext(ProvisionModule)

  await application.close()
}

async function bootstrap() {
  // NOTE: Refer to the comment in the ProvisionModule to understand why we use
  // a temporary application for the provision step.
  await provision()

  const logger = new Logger('AppBootstrap')
  const application = await NestFactory.create(MainModule, { bodyParser: true })
  const configService = application.get<ConfigService<Config>>(ConfigService)
  const port = configService.get('port')

  // NOTE: Enable application shutdown lifecyle hooks to ensure connections are
  // close on exit.
  application.enableShutdownHooks()

  await lastValueFrom(
    of(application).pipe(
      map(
        withSwagger({
          title: 'Vault',
          description: 'The next generation of authorization for web3',
          version: '1.0',
          security: [gnapSecurity(), adminApiKeySecurity(HEADER_ADMIN_API_KEY)]
        })
      ),
      map(withGlobalPipes),
      map(withCors(configService.get('cors'))),
      switchMap((app) => app.listen(port))
    )
  )

  logger.log(`App is running on port ${port}`)
}

bootstrap()
