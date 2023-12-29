/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'

import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AppModule } from './app/app.module'

const APPLICATION_NAME = 'orchestration'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.setGlobalPrefix(APPLICATION_NAME)
  const port = process.env.PORT || 3000

  const config = new DocumentBuilder().setTitle('Orchestration').setVersion('1.0').addTag(APPLICATION_NAME).build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      // Temporary disable the "Try it out" button while the API is just a
      // placeholder.
      supportedSubmitMethods: []
    }
  })

  await app.listen(port)
  Logger.log(`🚀 Application is running on: http://localhost:${port}/${APPLICATION_NAME}`)
}

bootstrap()
