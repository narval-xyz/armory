import { hashRequest } from '@narval/authz-shared'
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator'

@ValidatorConstraint({ async: false })
export class RequestHash implements ValidatorConstraintInterface {
  validate(givenHash: string, args: ValidationArguments) {
    if ('request' in args.object) {
      const hash = hashRequest(args.object.request)

      return givenHash === hash
    }

    return false
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} is not a valid hexadecimal SHA256 hash`
  }
}
