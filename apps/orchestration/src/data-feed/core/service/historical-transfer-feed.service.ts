import { DataFeed } from '@app/orchestration/data-feed/core/type/data-feed.type'
import { AuthorizationRequest } from '@app/orchestration/policy-engine/core/type/domain.type'
import { Transfer } from '@app/orchestration/shared/core/type/transfer-tracking.type'
import { TransferTrackingService } from '@app/orchestration/transfer-tracking/core/service/transfer-tracking.service'
import { Alg, Feed, HistoricalTransfer, Signature, hashRequest } from '@narval/authz-shared'
import { Injectable } from '@nestjs/common'
import { mapValues, omit } from 'lodash/fp'
import { privateKeyToAccount } from 'viem/accounts'

// IMPORTANT: Move to an encrypted data store.
const UNSAFE_FEED_PRIVATE_KEY = '0xf5c8f17cc09215c5038f6b8d5e557c0d98d341236307fe831efdcdd7faeef134'

@Injectable()
export class HistoricalTransferFeedService implements DataFeed<HistoricalTransfer[]> {
  static SOURCE_ID = 'armory/historical-transfer-feed'

  constructor(private transferTrackingService: TransferTrackingService) {}

  getId(): string {
    return HistoricalTransferFeedService.SOURCE_ID
  }

  getPubKey(): string {
    return privateKeyToAccount(UNSAFE_FEED_PRIVATE_KEY).publicKey
  }

  async sign(data: HistoricalTransfer[]): Promise<Signature> {
    const account = privateKeyToAccount(UNSAFE_FEED_PRIVATE_KEY)
    const sig = await account.signMessage({
      message: hashRequest(data)
    })

    return {
      alg: Alg.ES256K,
      pubKey: account.publicKey,
      sig
    }
  }

  async getFeed(input: AuthorizationRequest): Promise<Feed<HistoricalTransfer[]>> {
    const transfers = await this.transferTrackingService.findByOrgId(input.orgId)
    const historicalTransfers = HistoricalTransferFeedService.build(transfers)
    const sig = await this.sign(historicalTransfers)

    return {
      source: this.getId(),
      sig,
      data: historicalTransfers
    }
  }

  static build(transfers: Transfer[]): HistoricalTransfer[] {
    return transfers.map((transfer) => ({
      ...omit('orgId', transfer),
      amount: transfer.amount.toString(),
      timestamp: transfer.createdAt.getTime(),
      rates: mapValues((value) => value.toString(), transfer.rates)
    }))
  }
}
