import { addressGenerator, chainIdGenerator } from '@app/orchestration/__test__/fixture/shared.fixture'
import { addressSchema } from '@app/orchestration/policy-engine/persistence/schema/transaction-request.schema'
import { Transfer } from '@app/orchestration/shared/core/type/transfer-feed.type'
import { z } from 'zod'
import { Fixture } from 'zod-fixture'

const transferFeedSchema = z.object({
  id: z.string().uuid(),
  orgId: z.string().uuid(),
  amount: z.bigint(),
  from: z.string(),
  to: z.string(),
  chainId: z.number(),
  token: z.string(),
  rates: z.record(z.string(), z.number()),
  initiatedBy: addressSchema,
  createdAt: z.date()
})

export const generateTransferFeed = (partial?: Partial<Transfer>): Transfer => {
  const fixture = new Fixture().extend([addressGenerator, chainIdGenerator]).fromSchema(transferFeedSchema)

  return {
    ...fixture,
    ...partial
  }
}
