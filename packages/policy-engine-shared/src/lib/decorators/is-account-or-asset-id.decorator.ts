import { ValidationOptions, registerDecorator } from 'class-validator'
import { isAccountId, isAssetId } from '../util/caip.util'

export function IsAccountOrAssetId(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isAccountOrAssetId',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          return typeof value === 'string' && (isAccountId(value) || isAssetId(value))
        }
      }
    })
  }
}
