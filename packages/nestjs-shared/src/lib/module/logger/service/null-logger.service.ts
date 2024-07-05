/* eslint-disable no-restricted-imports */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { LoggerService } from '@nestjs/common'

export class NullLoggerService implements LoggerService {
  log(_message: string): any {}
  error(_message: string, _trace: string): any {}
  warn(_message: string): any {}
  debug(_message: string): any {}
  verbose(_message: string): any {}
}
