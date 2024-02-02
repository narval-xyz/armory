import { hexGenerator } from '@app/orchestration/__test__/fixture/shared.fixture'
import { generateTransfer } from '@app/orchestration/__test__/fixture/transfer-tracking.fixture'
import { HistoricalTransferFeedService } from '@app/orchestration/data-feed/core/service/historical-transfer-feed.service'
import { signatureSchema } from '@app/orchestration/policy-engine/persistence/schema/signature.schema'
import { Feed, HistoricalTransfer } from '@narval/authz-shared'
import { times } from 'lodash/fp'
import { z } from 'zod'
import { Fixture } from 'zod-fixture'

const feedSchema = z.object({
  source: z.string().min(1).max(42),
  sig: signatureSchema.nullable()
})

export const generateHistoricalTransfers = (): HistoricalTransfer[] =>
  HistoricalTransferFeedService.build(times(() => generateTransfer(), 5))

export const generateFeed = <Data>(data: Data, partial?: Partial<Feed<Data>>): Feed<Data> => {
  const feedFixture = new Fixture().extend([hexGenerator]).fromSchema(feedSchema)

  return {
    ...feedFixture,
    ...partial,
    data
  }
}
