import { RequestHash } from '@app/orchestration/policy-engine/http/rest/dto/validator/request-hash.validator'
import { ValidationArguments } from 'class-validator'

describe(RequestHash.name, () => {
  let validator: RequestHash

  beforeEach(() => {
    validator = new RequestHash()
  })

  describe('validate', () => {
    it('returns true if the given hash matches the hash of the request object', () => {
      const request = { foo: 'bar' }
      const hash = RequestHash.hash(request)
      const args: ValidationArguments = {
        targetName: 'AuthorizationRequestDto',
        object: { request },
        property: 'hash',
        constraints: [],
        value: hash
      }

      const result = validator.validate(hash, args)

      expect(result).toEqual(true)
    })

    it('returns false if the given hash does not match the hash of the request object', () => {
      const hash = '123456'
      const request = { foo: 'baz' }
      const args: ValidationArguments = {
        targetName: 'AuthorizationRequestDto',
        object: { request },
        property: 'hash',
        constraints: [],
        value: hash
      }

      const result = validator.validate(hash, args)

      expect(result).toEqual(false)
    })

    it('returns false if the request object is not present in the arguments', () => {
      const hash = '123456'
      const args: ValidationArguments = {
        targetName: 'AuthorizationRequestDto',
        object: {},
        property: 'hash',
        constraints: [],
        value: hash
      }

      const result = validator.validate(hash, args)

      expect(result).toEqual(false)
    })
  })

  describe('defaultMessage', () => {
    it('returns error message for the given property', () => {
      const property = 'hash'
      const args: ValidationArguments = {
        targetName: 'AuthorizationRequestDto',
        object: {},
        property,
        constraints: [],
        value: ''
      }

      const message = validator.defaultMessage(args)

      expect(message).toEqual(`${property} is not a valid EIP-191 hash format`)
    })
  })
})
