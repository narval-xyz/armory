import { DataFeed } from '@app/orchestration/data-feed/core/type/data-feed.type'
import { FIAT_ID_USD } from '@app/orchestration/orchestration.constant'
import { AuthorizationRequest } from '@app/orchestration/policy-engine/core/type/domain.type'
import { PriceService } from '@app/orchestration/price/core/service/price.service'
import { getChain } from '@app/orchestration/shared/core/lib/chains.lib'
import { Prices } from '@app/orchestration/shared/core/type/price.type'
import { Action, Alg, AssetId, Feed, Signature, hashRequest } from '@narval/authz-shared'
import { Decoder, InputType, Intents } from '@narval/transaction-request-intent'
import { Injectable } from '@nestjs/common'
import { uniq } from 'lodash/fp'
import { privateKeyToAccount } from 'viem/accounts'

// IMPORTANT: Move to an encrypted data store.
const UNSAFE_FEED_PRIVATE_KEY = '0xc7a1b8ba040a238e36058fc5693f801d129aca9f10ed30d0133878f1b9147c01'

@Injectable()
export class PriceFeedService implements DataFeed<Prices> {
  static SOURCE_ID = 'armory/price-feed'

  constructor(private priceService: PriceService) {}

  getId(): string {
    return PriceFeedService.SOURCE_ID
  }

  async sign(data: Prices): Promise<Signature> {
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

  getPubKey(): string {
    return privateKeyToAccount(UNSAFE_FEED_PRIVATE_KEY).publicKey
  }

  async getFeed(input: AuthorizationRequest): Promise<Feed<Prices>> {
    // TODO (@wcalderipe, 01/02/2024): De-risk the price values by taking a
    // median of multiple sources.
    const prices = await this.priceService.getPrices({
      from: this.getAssetIds(input),
      to: [FIAT_ID_USD]
    })
    const sig = await this.sign(prices)

    return {
      source: this.getId(),
      sig,
      data: prices
    }
  }

  private getAssetIds(authzRequest: AuthorizationRequest): AssetId[] {
    if (authzRequest.request.action === Action.SIGN_TRANSACTION) {
      const result = new Decoder().safeDecode({
        type: InputType.TRANSACTION_REQUEST,
        txRequest: authzRequest.request.transactionRequest
      })

      const chain = getChain(authzRequest.request.transactionRequest.chainId)

      if (result.success) {
        const { intent } = result

        if (intent.type === Intents.TRANSFER_NATIVE) {
          return uniq([chain.coin.id, intent.token])
        }
      }

      return [chain.coin.id]
    }

    return []
  }
}
