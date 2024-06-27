import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common'
import { logger } from './winston.config'

@Injectable()
export class LoggerService implements NestLoggerService {
  log(message: string, context: string) {
    logger.info(message, { context })
  }

  info(message: string, context: string) {
    logger.info(message, { context })
  }

  error(message: string, trace: string, context: string) {
    logger.error(message, { context, trace })
  }

  warn(message: string, context: string) {
    logger.warn(message, { context })
  }

  debug(message: string, context: string) {
    logger.debug(message, { context })
  }

  verbose(message: string, context: string) {
    logger.verbose(message, { context })
  }

  fatal(message: string, context: string) {
    logger.error(message, { context })
  }
}
