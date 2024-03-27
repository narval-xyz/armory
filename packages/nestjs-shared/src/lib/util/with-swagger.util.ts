import { INestApplication } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { patchNestJsSwagger } from 'nestjs-zod'

/**
 * Adds Swagger documentation to the application.
 *
 * @param app - The INestApplication instance.
 * @returns The modified INestApplication instance.
 */
export const withSwagger =
  (params: { title: string; description: string; version: string }) =>
  (app: INestApplication): INestApplication => {
    // IMPORTANT: This modifies the Nest Swagger module to be compatible with
    // DTOs created by Zod schemas. The patch MUST be done before the
    // configuration process.
    patchNestJsSwagger()

    const document = SwaggerModule.createDocument(
      app,
      new DocumentBuilder().setTitle(params.title).setDescription(params.description).setVersion(params.version).build()
    )

    SwaggerModule.setup('docs', app, document, {
      customSiteTitle: `${params.title} API`
    })

    return app
  }
