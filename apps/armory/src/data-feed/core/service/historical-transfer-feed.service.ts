import { Feed, HistoricalTransfer, Signature } from '@narval/policy-engine-shared'
import { Alg, hash } from '@narval/signature'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { mapValues, omit } from 'lodash/fp'
import { privateKeyToAccount } from 'viem/accounts'
import { Config } from '../../../armory.config'
import { DataFeed } from '../../../data-feed/core/type/data-feed.type'
import { AuthorizationRequest } from '../../../orchestration/core/type/domain.type'
import { Transfer } from '../../../shared/core/type/transfer-tracking.type'
import { TransferTrackingService } from '../../../transfer-tracking/core/service/transfer-tracking.service'

@Injectable()
export class HistoricalTransferFeedService implements DataFeed<HistoricalTransfer[]> {
  static SOURCE_ID = 'armory/historical-transfer-feed'

  constructor(
    private transferTrackingService: TransferTrackingService,
    private configService: ConfigService<Config, true>
  ) {}

  getId(): string {
    return HistoricalTransferFeedService.SOURCE_ID
  }

  getPubKey(): string {
    return privateKeyToAccount(this.getPrivateKey()).publicKey
  }

  async sign(data: HistoricalTransfer[]): Promise<Signature> {
    const account = privateKeyToAccount(this.getPrivateKey())
    const sig = await account.signMessage({
      message: hash(data)
    })

    return {
      alg: Alg.ES256K,
      pubKey: account.publicKey,
      sig
    }
  }

  private getPrivateKey(): `0x${string}` {
    // TODO (@wcalderipe, 02/02/24): Storing the private key in environment
    // variables is a suitable approach for initial project setup. However, for
    // production environments, it's crucial to secure them in a vault.
    return this.configService.get('dataFeed.historicalTransferFeedPrivateKey', { infer: true })
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
