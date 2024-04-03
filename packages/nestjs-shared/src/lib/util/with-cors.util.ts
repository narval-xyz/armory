import { INestApplication } from '@nestjs/common'

export const withCors =
  (origin: string[] | undefined) =>
  (app: INestApplication): INestApplication => {
    if (origin && origin.length > 0) {
      app.enableCors({ origin })
    }

    return app
  }
