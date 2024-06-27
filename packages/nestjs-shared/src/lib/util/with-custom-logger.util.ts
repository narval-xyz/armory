import { INestApplication } from '@nestjs/common'
import { LoggerService } from '../module/logger/service/logger.service'

/**
 * Adds custom logger.
 *
 * @param app - The INestApplication instance.
 * @returns The modified INestApplication instance.
 */
export const withCustomLogger = (app: INestApplication): INestApplication => {
  app.useLogger(app.get(LoggerService))

  return app
}
