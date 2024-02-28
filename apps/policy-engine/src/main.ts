import { INestApplication, Logger, ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { lastValueFrom, map, of, switchMap } from 'rxjs'
import { AppModule } from './app/app.module'

/**
 * Adds Swagger documentation to the application.
 *
 * @param app - The INestApplication instance.
 * @returns The modified INestApplication instance.
 */
const withSwagger = (app: INestApplication): INestApplication => {
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
  app.useGlobalPipes(new ValidationPipe())

  return app
}

async function bootstrap() {
  const logger = new Logger('AuthorizationNodeBootstrap')
  const application = await NestFactory.create(AppModule, { bodyParser: true })
  const configService = application.get(ConfigService)
  const port = configService.get('PORT')

  if (!port) {
    throw new Error('Missing PORT environment variable')
  }

  await lastValueFrom(
    of(application).pipe(
      map(withSwagger),
      map(withGlobalPipes),
      switchMap((app) => app.listen(port))
    )
  )

  logger.log(`AuthZ is running on port ${port}`)
}

bootstrap()
