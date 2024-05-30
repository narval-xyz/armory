import { Action, EvaluationMetadata } from '@narval/policy-engine-shared'
import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsArray, IsDefined, IsOptional, IsString, ValidateNested } from 'class-validator'
import { createZodDto } from 'nestjs-zod'
import { SignMessageRequestDto } from '../../../http/rest/dto/sign-message-request.dto'
import { SignTransactionRequestDto } from '../../../http/rest/dto/sign-transaction-request.dto'
import { GrantPermissionRequestDto } from './grant-permission-request.dto'

const EvaluationMetadataDto = createZodDto(EvaluationMetadata.optional())

@ApiExtraModels(SignTransactionRequestDto, SignMessageRequestDto, GrantPermissionRequestDto)
export class AuthorizationRequestDto {
  @IsDefined()
  @IsString()
  @ApiProperty()
  authentication: string

  // TODO (@wcalderipe, 22/01/24): Test the discrimination type option from
  // class-transformer instead of a custom function map.
  //
  // See https://github.com/typestack/class-transformer?tab=readme-ov-file#working-with-nested-objects
  @IsDefined()
  @ValidateNested()
  @Type((opts) => {
    switch (opts?.object.request.action) {
      case Action.SIGN_TRANSACTION:
        return SignTransactionRequestDto
      case Action.SIGN_MESSAGE:
        return SignMessageRequestDto
      case Action.GRANT_PERMISSION:
        return GrantPermissionRequestDto
      default:
        return SignTransactionRequestDto
    }
  })
  @ApiProperty({
    oneOf: [
      { $ref: getSchemaPath(SignTransactionRequestDto) },
      { $ref: getSchemaPath(SignMessageRequestDto) },
      { $ref: getSchemaPath(GrantPermissionRequestDto) }
    ]
  })
  request: SignTransactionRequestDto | SignMessageRequestDto | GrantPermissionRequestDto

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiProperty({
    isArray: true,
    default: []
  })
  approvals: string[]

  @IsOptional()
  @ValidateNested()
  @Type(() => EvaluationMetadataDto)
  @ApiProperty()
  metadata?: EvaluationMetadata | undefined
}
