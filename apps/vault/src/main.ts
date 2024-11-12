import { instrumentTelemetry } from '@narval/open-telemetry'

// IMPORTANT: OpenTelemetry SDK must be registered before any other imports to
// ensure proper instrumentation. The instrumentation packages patches Node.js
// runtime - if NestFactory or other dependencies load first, they'll use the
// unpatched runtime and won't be instrumented correctly.
instrumentTelemetry({ serviceName: 'vault' })

import { ConfigService } from '@narval/config-module'
import { LoggerService, withApiVersion, withCors, withLogger, withSwagger } from '@narval/nestjs-shared'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { lastValueFrom, map, of, switchMap } from 'rxjs'
import { Config } from './main.config'
import { ADMIN_API_KEY_SECURITY, GNAP_SECURITY } from './main.constant'
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
  const application = await NestFactory.createApplicationContext(ProvisionModule, { bufferLogs: true })

  await application.close()
}

async function bootstrap() {
  // NOTE: Refer to the comment in the ProvisionModule to understand why we use
  // a temporary application for the provision step.
  await provision()

  const application = await NestFactory.create(MainModule, { bufferLogs: true, bodyParser: true })
  const configService = application.get<ConfigService<Config>>(ConfigService)
  const logger = application.get<LoggerService>(LoggerService)
  const port = configService.get('port')

  // NOTE: Enable application shutdown lifecyle hooks to ensure connections are
  // close on exit.
  application.enableShutdownHooks()

  await lastValueFrom(
    of(application).pipe(
      map(withLogger),
      map(withApiVersion({ defaultVersion: '1' })),
      map(withGlobalPipes),
      map(withCors(configService.get('cors'))),
      map(
        withSwagger({
          title: 'Vault',
          description:
            'Secure storage for private keys and sensitive data, designed to protect your most critical assets in web3.0',
          version: '1.0',
          security: [GNAP_SECURITY, ADMIN_API_KEY_SECURITY]
        })
      ),
      switchMap((app) => app.listen(port))
    )
  )

  logger.log(`Vault is running on port ${port}`)
}

bootstrap()
