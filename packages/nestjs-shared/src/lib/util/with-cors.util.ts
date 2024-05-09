import { INestApplication } from '@nestjs/common'

export const withCors =
  (origin: string[] | undefined) =>
  (app: INestApplication): INestApplication => {
    app.enableCors({
      origin: origin && !!origin.length ? origin : '*', // Default to open, but allow closing it up if desired.
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      preflightContinue: false,
      optionsSuccessStatus: 204,
      credentials: false,
      allowedHeaders: '*'
    })

    return app
  }
