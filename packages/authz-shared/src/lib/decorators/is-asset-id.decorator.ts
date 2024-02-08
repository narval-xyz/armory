import { applyDecorators } from '@nestjs/common'
import { Matches, ValidationOptions } from 'class-validator'

export function IsAssetId(validationOptions?: ValidationOptions) {
  const regex = new RegExp('^(eip155:d+/(erc1155|erc20|erc721):w+/w+|eip155:d+/slip44:d+)$')
  return applyDecorators(Matches(regex, validationOptions))
}
