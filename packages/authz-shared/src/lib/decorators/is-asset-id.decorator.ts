import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, Matches, ValidationOptions } from 'class-validator'

export function IsAssetId(validationOptions?: ValidationOptions) {
  const regex =
    /^(eip155:\d+\/(erc1155|erc20|erc721):\w+)$|^(eip155:\d+\/(erc1155|erc20|erc721):\w+\/\w+)$|^(eip155:\d+\/slip44:\d+)$/

  return applyDecorators(
    IsDefined(),
    Matches(regex, validationOptions),
    ApiProperty({ type: String, description: 'EIP-155 Asset ID' })
  )
}
