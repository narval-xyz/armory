import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, Matches, ValidationOptions } from 'class-validator'

export function IsHexString(validationOptions?: ValidationOptions) {
  const regex = new RegExp('^0x[a-fA-F0-9]+$')
  return applyDecorators(
    IsDefined(),
    Matches(regex, validationOptions),
    ApiProperty({ type: String, description: 'Hexadecimal string' })
  )
}
