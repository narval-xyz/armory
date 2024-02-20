import { ValidationOptions, registerDecorator } from 'class-validator'
import { isAccountId } from '../util/caip.util'

export function IsAccountId(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isAccountId',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          return typeof value === 'string' && isAccountId(value)
        }
      }
    })
  }
}
