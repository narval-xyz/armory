import { Feed, HistoricalTransfer } from '@narval/authz-shared'
import { times } from 'lodash/fp'
import { z } from 'zod'
import { Fixture } from 'zod-fixture'
import { HistoricalTransferFeedService } from '../../data-feed/core/service/historical-transfer-feed.service'
import { signatureSchema } from '../../orchestration/persistence/schema/signature.schema'
import { hexGenerator } from './shared.fixture'
import { generateTransfer } from './transfer-tracking.fixture'

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
