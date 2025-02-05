import { HttpStatus } from '@nestjs/common'
import { z } from 'zod'

export const HttpException = z.object({
  statusCode: z.nativeEnum(HttpStatus),
  message: z.string(),
  context: z.unknown().optional(),
  stack: z.string().optional().describe('In development mode, contains the exception stack trace'),
  origin: z.instanceof(Error).optional().describe('In development mode, it may contain the error origin')
})
export type HttpException = z.infer<typeof HttpException>
