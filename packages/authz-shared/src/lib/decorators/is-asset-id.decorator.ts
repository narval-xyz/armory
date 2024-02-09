import { ValidationOptions, registerDecorator } from 'class-validator'
import { isAssetId } from '../util/caip.util'

export function IsAssetId(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isAssetId',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          return typeof value === 'string' && isAssetId(value)
        }
      }
    })
  }
}
