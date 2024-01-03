import { INestApplication, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { OrchestrationModule } from './orchestration.module'

const APPLICATION_NAME = 'orchestration'

const setupSwagger = (app: INestApplication): void => {
  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder().setTitle('Orchestration').setVersion('1.0').addTag(APPLICATION_NAME).build()
  )
  SwaggerModule.setup(`${APPLICATION_NAME}/docs`, app, document, {
    swaggerOptions: {
      // Temporary disable the "Try it out" button while the API is just a
      // placeholder.
      supportedSubmitMethods: []
    }
  })
}

async function bootstrap() {
  const logger = new Logger('OrchestrationBootstrap')
  const app = await NestFactory.create(OrchestrationModule)
  const configService = app.get(ConfigService)
  const port = configService.get('PORT')

  if (!port) {
    throw new Error('Missing PORT environment variable')
  }

  app.setGlobalPrefix(APPLICATION_NAME)

  setupSwagger(app)

  await app.listen(port)

  logger.log(`🚀 Orchestration is running on port ${port}`)
}

bootstrap()
