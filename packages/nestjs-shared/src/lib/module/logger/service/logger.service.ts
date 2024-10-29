/* eslint-disable no-restricted-imports */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common'
import { logger } from '../winston.logger'

@Injectable()
export class LoggerService implements NestLoggerService {
  log(message: string, ...optionalParams: any[]) {
    logger.info(message, this.getMeta(optionalParams))
  }

  info(message: string, ...optionalParams: any[]) {
    logger.info(message, this.getMeta(optionalParams))
  }

  error(message: string, ...optionalParams: any[]) {
    logger.error(message, this.getMeta(optionalParams))
  }

  warn(message: string, ...optionalParams: any[]) {
    logger.warn(message, this.getMeta(optionalParams))
  }

  debug(message: string, ...optionalParams: any[]) {
    logger.debug(message, this.getMeta(optionalParams))
  }

  verbose(message: string, ...optionalParams: any[]) {
    logger.verbose(message, this.getMeta(optionalParams))
  }

  fatal(message: string, ...optionalParams: any[]) {
    logger.error(message, this.getMeta(optionalParams))
  }

  private getMeta(...optionalParams: any[]): object {
    if (!optionalParams.length) {
      return {}
    }

    if (typeof optionalParams[0][0] === 'string') {
      return { context: optionalParams[0][0] }
    }

    if (typeof optionalParams[0] === 'object') {
      return { ...optionalParams[0][0] }
    }

    return {}
  }
}
