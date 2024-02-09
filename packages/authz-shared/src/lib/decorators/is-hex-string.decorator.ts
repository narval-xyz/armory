import { isHexString } from '@narval/transaction-request-intent'
import { ValidationOptions, registerDecorator } from 'class-validator'

export function IsHexString(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isHexString',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          return typeof value === 'string' && isHexString(value)
        }
      }
    })
  }
}
