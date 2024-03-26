import { isAssetId } from '@narval/policy-engine-shared'
import { ValidationOptions, registerDecorator } from 'class-validator'

export function IsAssetId(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isAssetId',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          return typeof value === 'string' && isAssetId(value)
        }
      }
    })
  }
}
