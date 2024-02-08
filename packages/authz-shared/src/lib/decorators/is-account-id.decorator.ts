import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, Matches, ValidationOptions } from 'class-validator'

export function IsAccountId(validationOptions?: ValidationOptions) {
  const regex = /^(eip155:(\d+|eoa):\w+)$/

  return applyDecorators(
    IsDefined(),
    Matches(regex, validationOptions),
    ApiProperty({ type: String, description: 'EIP-155 Account ID' })
  )
}
