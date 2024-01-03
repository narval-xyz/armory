import { INestApplication, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { OrchestrationModule } from './orchestration.module'

const setupSwagger = (app: INestApplication): void => {
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
}

async function bootstrap() {
  const logger = new Logger('OrchestrationBootstrap')
  const app = await NestFactory.create(OrchestrationModule)
  const configService = app.get(ConfigService)
  const port = configService.get('PORT')

  if (!port) {
    throw new Error('Missing PORT environment variable')
  }

  setupSwagger(app)

  await app.listen(port)

  logger.log(`Orchestration is running on port ${port}`)
}

bootstrap()
