import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common'

@Injectable()
export class LoggerService implements NestLoggerService {
  log(message: any, ...optionalParams: any[]) {}
  fatal(message: any, ...optionalParams: any[]) {}
  error(message: any, ...optionalParams: any[]) {}
  warn(message: any, ...optionalParams: any[]) {}
  debug?(message: any, ...optionalParams: any[]) {}
  verbose?(message: any, ...optionalParams: any[]) {}
}
