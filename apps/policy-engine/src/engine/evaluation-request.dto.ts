import {
  AccountId,
  Action,
  FiatCurrency,
  SignMessageRequestDataDto,
  SignTransactionRequestDataDto
} from '@narval/policy-engine-shared'
import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsDefined, IsOptional, ValidateNested } from 'class-validator'

export class HistoricalTransferDto {
  amount: string
  from: AccountId
  to: string
  chainId: number
  token: string
  rates: { [keyof in FiatCurrency]: string }
  initiatedBy: string
  timestamp: number
}

@ApiExtraModels(SignTransactionRequestDataDto, SignMessageRequestDataDto)
export class EvaluationRequestDto {
  @IsDefined()
  @ApiProperty()
  authentication: string

  @IsOptional()
  @ApiProperty({
    isArray: true
  })
  approvals?: string[]

  @ValidateNested()
  @Type((opts) => {
    return opts?.object.request.action === Action.SIGN_TRANSACTION
      ? SignTransactionRequestDataDto
      : SignMessageRequestDataDto
  })
  @IsDefined()
  @ApiProperty({
    oneOf: [{ $ref: getSchemaPath(SignTransactionRequestDataDto) }, { $ref: getSchemaPath(SignMessageRequestDataDto) }]
  })
  request: SignTransactionRequestDataDto | SignMessageRequestDataDto

  @IsOptional()
  @ValidateNested()
  @ApiProperty()
  transfers?: HistoricalTransferDto[]
}
