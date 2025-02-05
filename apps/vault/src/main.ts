import { instrumentTelemetry } from '@narval/open-telemetry'

// IMPORTANT: OpenTelemetry SDK must be registered before any other imports to
// ensure proper instrumentation. The instrumentation packages patches Node.js
// runtime - if NestFactory or other dependencies load first, they'll use the
// unpatched runtime and won't be instrumented correctly.
instrumentTelemetry({ serviceName: 'vault' })

import { ConfigService } from '@narval/config-module'
import {
  LoggerService,
  securityOptions,
  withApiVersion,
  withCors,
  withLogger,
  withSwagger
} from '@narval/nestjs-shared'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
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
            'Secure Enclave-backed authorization proxy for web3 secrets. Holds encrypted credentials and proxies API requests to custodians and wallet tech providers. Can also generate evm wallet private keys & sign transactions.',
          version: '1.0',
          security: [securityOptions.gnap, securityOptions.adminApiKey, securityOptions.detachedJws],
          server: {
            url: configService.get('baseUrl'),
            description: 'Narval Vault Base Url'
          }
        })
      ),
      switchMap((app) => app.listen(port))
    )
  )

  logger.log(`Vault is running on port ${port}`)
}

bootstrap()
