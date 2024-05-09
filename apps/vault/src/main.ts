import { withCors, withSwagger } from '@narval/nestjs-shared'
import { INestApplication, Logger, ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { lastValueFrom, map, of, switchMap } from 'rxjs'
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
  const configService = application.get(ConfigService)
  const port = configService.get('PORT')

  if (!port) {
    throw new Error('Missing PORT environment variable')
  }

  await lastValueFrom(
    of(application).pipe(
      map(
        withSwagger({
          title: 'Vault',
          description: 'The next generation of authorization for web3',
          version: '1.0'
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
