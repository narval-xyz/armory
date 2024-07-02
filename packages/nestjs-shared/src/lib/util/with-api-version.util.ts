import { INestApplication, VersioningType } from '@nestjs/common'
import { VersionValue } from '@nestjs/common/interfaces'

/**
 * Adds NestJS URI versionning to the application.
 * IMPORTANT: In order to work with Swagger, this function needs to be called
 * before withSwagger at app boostrap.
 * https://github.com/nestjs/swagger/issues/1495
 *
 * @param app - The INestApplication instance.
 * @returns The modified INestApplication instance.
 *
 */
export const withApiVersion =
  (params: { defaultVersion: VersionValue }) =>
  (app: INestApplication): INestApplication => {
    app.enableVersioning({
      type: VersioningType.URI
    })

    return app
  }
