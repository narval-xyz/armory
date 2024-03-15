import { Action, SignMessageRequestDataDto, SignTransactionRequestDataDto } from '@narval/policy-engine-shared'
import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsDefined, ValidateNested } from 'class-validator'

@ApiExtraModels(SignTransactionRequestDataDto, SignMessageRequestDataDto)
export class SignRequestDto {
  @Type((opts) => {
    return opts?.object.request.action === Action.SIGN_TRANSACTION
      ? SignTransactionRequestDataDto
      : SignMessageRequestDataDto
  })
  @IsDefined()
  @ApiProperty({
    oneOf: [{ $ref: getSchemaPath(SignTransactionRequestDataDto) }, { $ref: getSchemaPath(SignMessageRequestDataDto) }]
  })
  @ValidateNested()
  request: SignTransactionRequestDataDto | SignMessageRequestDataDto
}
