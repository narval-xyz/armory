import { INestApplication } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { SecuritySchemeObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface'
import { patchNestJsSwagger } from 'nestjs-zod'
import { SetRequired } from 'type-fest'

type Security = SetRequired<SecuritySchemeObject, 'name'>

// NOTE: See https://swagger.io/docs/specification/authentication to understand
// Swagger auth schema.

export const gnapSecurity = (): Security => ({
  name: 'GNAP',
  type: 'http',
  in: 'header',
  // A scheme is what sits in front of the token `Authorization: <scheme>
  // <token>`.
  // See https://swagger.io/docs/specification/authentication/
  scheme: 'GNAP'
})

export const adminApiKeySecurity = (header: string): Security => ({
  name: 'ADMIN_API_KEY',
  type: 'apiKey',
  in: 'header',
  'x-tokenName': header
})

export const clientIdSecurity = (header: string): Security => ({
  name: 'CLIENT_ID',
  type: 'apiKey',
  in: 'header',
  'x-tokenName': header
})

export const clientSecretSecurity = (header: string): Security => ({
  name: 'CLIENT_SECRET',
  type: 'apiKey',
  in: 'header',
  'x-tokenName': header
})

/**
 * Adds Swagger documentation to the application.
 *
 * @param app - The INestApplication instance.
 * @returns The modified INestApplication instance.
 */
export const withSwagger =
  (params: { title: string; description: string; version: string; security?: Security[] }) =>
  (app: INestApplication): INestApplication => {
    // IMPORTANT: This modifies the Nest Swagger module to be compatible with
    // DTOs created by Zod schemas. The patch MUST be done before the
    // configuration process.
    patchNestJsSwagger()
    const security = params.security || []

    const documentBuilder = new DocumentBuilder()
      .setTitle(params.title)
      .setDescription(params.description)
      .setVersion(params.version)
    for (const s of security) {
      documentBuilder.addSecurity(s.name, s)
    }

    const document = SwaggerModule.createDocument(app, documentBuilder.build())

    SwaggerModule.setup('docs', app, document, {
      customSiteTitle: `${params.title} API`
    })

    return app
  }
