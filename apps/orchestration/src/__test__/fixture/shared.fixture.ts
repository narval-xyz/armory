import { CHAINS } from '@app/orchestration/orchestration.constant'
import { ChainId } from '@app/orchestration/shared/core/lib/chains.lib'
import { addressSchema } from '@app/orchestration/shared/schema/address.schema'
import { chainIdSchema } from '@app/orchestration/shared/schema/chain-id.schema'
import { hexSchema } from '@app/orchestration/shared/schema/hex.schema'
import { faker } from '@faker-js/faker'
import { Address, getAddress } from '@narval/authz-shared'
import { sample } from 'lodash/fp'
import { Generator } from 'zod-fixture'

export const hexGenerator = Generator({
  schema: hexSchema,
  output: () => faker.string.hexadecimal().toLowerCase()
})

export const generateAddress = (): Address => getAddress(faker.finance.ethereumAddress().toLowerCase())

export const addressGenerator = Generator({
  schema: addressSchema,
  output: () => generateAddress()
})

export const generateSupportedChainId = (): ChainId => sample(Array.from(CHAINS.keys())) as ChainId

export const chainIdGenerator = Generator({
  schema: chainIdSchema,
  filter: ({ context }) => context.path.at(-1) === 'chainId',
  output: () => generateSupportedChainId()
})
