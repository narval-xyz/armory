import { Action, isHexString } from '@narval/policy-engine-shared'
import { Hex } from '@narval/signature'
import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsIn, IsString, ValidationOptions, registerDecorator } from 'class-validator'
import { BaseActionDto } from './'

// This is needed because class-validator cannot handle `string | RawMessage` when using @ValidateNested()
function IsStringOrHasRawProperty(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isStringOrHasRawProperty',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate: (value: unknown) => {
          if (value === null || value === undefined) return false
          if (typeof value === 'string') return true
          if (typeof value === 'object' && 'raw' in value) {
            return isHexString(value.raw)
          }
          return false
        },
        defaultMessage: () => 'The message must be a string or an object with a raw property as a hex string'
      }
    })
  }
}

class RawMessage {
  raw: Hex
}
export class SignMessageRequestDataDto extends BaseActionDto {
  @IsIn(Object.values(Action))
  @IsDefined()
  @ApiProperty({
    enum: Object.values(Action),
    default: Action.SIGN_MESSAGE
  })
  action: typeof Action.SIGN_MESSAGE

  @IsString()
  @IsDefined()
  @ApiProperty()
  resourceId: string

  @ApiProperty()
  @IsStringOrHasRawProperty()
  message: string | RawMessage
}
