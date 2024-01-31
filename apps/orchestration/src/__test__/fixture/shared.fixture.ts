import { CHAINS } from '@app/orchestration/orchestration.constant'
import { addressSchema } from '@app/orchestration/shared/schema/address.schema'
import { chainIdSchema } from '@app/orchestration/shared/schema/chain-id.schema'
import { hexSchema } from '@app/orchestration/shared/schema/hex.schema'
import { faker } from '@faker-js/faker'
import { sample } from 'lodash/fp'
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
  schema: chainIdSchema,
  filter: ({ context }) => context.path.at(-1) === 'chainId',
  output: () => sample(Array.from(CHAINS.keys()))
})
