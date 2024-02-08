import { z } from 'zod'
import { Fixture } from 'zod-fixture'
import { generatePrice } from '../../__test__/fixture/price.fixture'
import { Transfer } from '../../shared/core/type/transfer-tracking.type'
import { addressSchema } from '../../shared/schema/address.schema'
import { chainIdSchema } from '../../shared/schema/chain-id.schema'
import { addressGenerator, chainIdGenerator } from './shared.fixture'

const transferFeedSchema = z.object({
  id: z.string().uuid(),
  orgId: z.string().uuid(),
  requestId: z.string().uuid(),
  amount: z.bigint(),
  from: z.string(),
  to: z.string(),
  chainId: chainIdSchema,
  token: z.string(),
  initiatedBy: addressSchema,
  createdAt: z.date()
})

export const generateTransfer = (partial?: Partial<Transfer>): Transfer => {
  const fixture = new Fixture().extend([addressGenerator, chainIdGenerator]).fromSchema(transferFeedSchema)

  return {
    ...fixture,
    rates: generatePrice(),
    ...partial
  }
}
