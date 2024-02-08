import { applyDecorators } from '@nestjs/common'
import { Matches, ValidationOptions } from 'class-validator'

export function IsAccountId(validationOptions?: ValidationOptions) {
  const regex = new RegExp('^eip155:d+/w+$')
  return applyDecorators(Matches(regex, validationOptions))
}
