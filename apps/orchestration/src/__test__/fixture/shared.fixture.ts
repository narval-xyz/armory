import {
  addressSchema,
  hexSchema
} from '@app/orchestration/policy-engine/persistence/schema/transaction-request.schema'
import { faker } from '@faker-js/faker'
import { sample } from 'lodash/fp'
import { z } from 'zod'
import { Generator } from 'zod-fixture'

export const hexGenerator = Generator({
  schema: hexSchema,
  output: () => faker.string.hexadecimal().toLowerCase()
})

export const addressGenerator = Generator({
  schema: addressSchema,
  output: () => faker.finance.ethereumAddress().toLowerCase()
})

export const chainIdGenerator = Generator({
  schema: z.number().min(1),
  filter: ({ transform, def }) => transform.utils.checks(def.checks).has('chainId'),
  output: () => sample([1, 137])
})
