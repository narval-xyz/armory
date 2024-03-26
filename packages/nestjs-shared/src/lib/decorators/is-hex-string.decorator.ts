import { isHexString } from '@narval/policy-engine-shared'
import { ValidationOptions, registerDecorator } from 'class-validator'

export function IsHexString(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isHexString',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          return typeof value === 'string' && isHexString(value)
        }
      }
    })
  }
}
