import { stringify } from '@app/orchestration/shared/lib/json'
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator'
import { hashMessage } from 'viem'

@ValidatorConstraint({ async: false })
export class RequestHash implements ValidatorConstraintInterface {
  validate(givenHash: string, args: ValidationArguments) {
    if ('request' in args.object) {
      const hash = RequestHash.hash(args.object.request)

      return givenHash === hash
    }

    return false
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} is not a valid EIP-191 hash format`
  }

  static hash(request: unknown): string {
    return hashMessage(stringify(request))
  }
}
