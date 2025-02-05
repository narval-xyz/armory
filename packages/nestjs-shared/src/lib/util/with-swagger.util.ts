import { INestApplication } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { SecuritySchemeObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface'
import { patchNestJsSwagger } from 'nestjs-zod'
import {
  REQUEST_HEADER_ADMIN_API_KEY,
  REQUEST_HEADER_CLIENT_ID,
  REQUEST_HEADER_CLIENT_SECRET,
  REQUEST_HEADER_DETACHED_JWS
} from '../constant'

// NOTE: See https://swagger.io/docs/specification/authentication to understand
// Swagger auth schema.

const gnapSecurity: SecuritySchemeObject = {
  type: 'http',
  // A scheme is what sits in front of the token `Authorization: <scheme>
  // <token>`.
  // See https://swagger.io/docs/specification/authentication/
  scheme: 'GNAP'
}

const detachedJwsSecurity: SecuritySchemeObject = {
  name: REQUEST_HEADER_DETACHED_JWS,
  type: 'apiKey',
  in: 'header'
}

const adminApiKeySecurity: SecuritySchemeObject = {
  name: REQUEST_HEADER_ADMIN_API_KEY,
  type: 'apiKey',
  in: 'header'
}

const clientIdSecurity: SecuritySchemeObject = {
  name: REQUEST_HEADER_CLIENT_ID,
  type: 'apiKey',
  in: 'header'
}

const clientSecretSecurity: SecuritySchemeObject = {
  name: REQUEST_HEADER_CLIENT_SECRET,
  type: 'apiKey',
  in: 'header'
}

export const securityOptions = {
  gnap: {
    name: 'GNAP',
    securityScheme: gnapSecurity
  },
  detachedJws: {
    name: 'Detached-JWS-Signature',
    securityScheme: detachedJwsSecurity
  },
  adminApiKey: {
    name: 'Admin-API-Key',
    securityScheme: adminApiKeySecurity
  },
  clientId: {
    name: 'Client-ID',
    securityScheme: clientIdSecurity
  },
  clientSecret: {
    name: 'Client-Secret',
    securityScheme: clientSecretSecurity
  }
}

/**
 * Adds Swagger documentation to the application.
 *
 * @param app - The INestApplication instance.
 * @returns The modified INestApplication instance.
 */
export const withSwagger =
  (params: {
    title: string
    description: string
    version: string
    security?: { name: string; securityScheme: SecuritySchemeObject }[]
    server?: { url: string; description: string }
  }) =>
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
      .addServer(params.server?.url || 'http://localhost:3005', params.server?.description || 'Armory Server')
    for (const s of security) {
      documentBuilder.addSecurity(s.name, s.securityScheme)
    }

    const document = SwaggerModule.createDocument(app, documentBuilder.build())

    SwaggerModule.setup('docs', app, document, {
      customSiteTitle: `${params.title} API`
    })

    return app
  }
