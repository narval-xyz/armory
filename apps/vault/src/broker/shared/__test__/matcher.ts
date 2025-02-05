/* eslint-disable @typescript-eslint/no-namespace */

import { expect } from '@jest/globals'
import type { MatcherContext } from 'expect'
import { ZodSchema } from 'zod'

declare global {
  namespace jest {
    interface Matchers<R> {
      /**
       * Custom Jest matcher to validate if a given value matches a Zod schema.
       *
       * @param {unknown} received - The value to be validated against the
       * schema.
       * @param {ZodSchema} schema - The Zod schema to validate the value
       * against.
       * @returns {object} - An object containing the result of the validation
       * and a message.
       *
       * @example
       * expect({ name: "John", age: 30 }).toMatchZodSchema(userSchema);
       */
      toMatchZodSchema(schema: ZodSchema): R
    }
  }
}

const toMatchZodSchema = function (this: MatcherContext, received: unknown, schema: ZodSchema) {
  const parse = schema.safeParse(received)

  return {
    pass: parse.success,
    message: () => {
      if (parse.success) {
        return 'Matched value to schema'
      }

      const errors = parse.error.errors.map((error) => {
        if (error.path.length) {
          return {
            message: error.message,
            path: error.path
          }
        }

        return {
          message: error.message
        }
      })

      return [
        'Expected value to match schema:',
        `Received: ${JSON.stringify(received, null, 2)}`,
        `Errors: ${JSON.stringify(errors, null, 2)}`
      ].join('\n')
    }
  }
}

expect.extend({ toMatchZodSchema })
