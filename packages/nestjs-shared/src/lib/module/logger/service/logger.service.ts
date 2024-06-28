import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common'
import { logger } from './winston.config'

@Injectable()
export class LoggerService implements NestLoggerService {
  private context: string

  setContext(context: string) {
    this.context = context
  }

  log(message: string, ...optionalParams: any[]) {
    console.log(optionalParams[0])
    logger.info(message, optionalParams)
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
    return {
      ...(this.context ? { context: this.context } : {}),
      ...(optionalParams.length && optionalParams[0] ? { context: optionalParams[0] } : {})
    }
  }
}
