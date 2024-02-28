import { faker } from '@faker-js/faker'
import { Address, addressSchema, getAddress, hexSchema } from '@narval/policy-engine-shared'
import { sample } from 'lodash/fp'
import { Generator } from 'zod-fixture'
import { CHAINS } from '../../armory.constant'
import { ChainId } from '../../shared/core/lib/chains.lib'
import { chainIdSchema } from '../../shared/schema/chain-id.schema'

export const hexGenerator = Generator({
  schema: hexSchema,
  output: () => faker.string.hexadecimal().toLowerCase()
})

export const generateAddress = (): Address => getAddress(faker.finance.ethereumAddress().toLowerCase())

export const addressGenerator = Generator({
  schema: addressSchema,
  output: () => generateAddress()
})

export const generateSupportedChainId = (): number => sample(Array.from(CHAINS.keys())) || ChainId.ETHEREUM

export const chainIdGenerator = Generator({
  schema: chainIdSchema,
  filter: ({ context }) => context.path.at(-1) === 'chainId',
  output: () => generateSupportedChainId()
})
