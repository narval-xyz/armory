import { Action, AssetId, Feed, JwtString } from '@narval/policy-engine-shared'
import { Payload, SigningAlg, hash, hexToBase64Url, privateKeyToJwk, signJwt } from '@narval/signature'
import { InputType, Intents, safeDecode } from '@narval/transaction-request-intent'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { uniq } from 'lodash/fp'
import { privateKeyToAccount } from 'viem/accounts'
import { Config } from '../../../armory.config'
import { FIAT_ID_USD } from '../../../armory.constant'
import { AuthorizationRequest } from '../../../orchestration/core/type/domain.type'
import { PriceService } from '../../../price/core/service/price.service'
import { getChain } from '../../../shared/core/lib/chains.lib'
import { Prices } from '../../../shared/core/type/price.type'
import { DataFeed } from '../type/data-feed.type'

@Injectable()
export class PriceFeedService implements DataFeed<Prices> {
  static SOURCE_ID = 'armory/price-feed'

  constructor(
    private priceService: PriceService,
    private configService: ConfigService<Config, true>
  ) {}

  getId(): string {
    return PriceFeedService.SOURCE_ID
  }

  async sign(data: Prices): Promise<JwtString> {
    const account = privateKeyToAccount(this.getPrivateKey())

    const jwtSigner = async (msg: string) => {
      const jwtSig = await account.signMessage({ message: msg })

      return hexToBase64Url(jwtSig)
    }

    const now = Math.floor(Date.now() / 1000)
    const jwk = privateKeyToJwk(this.getPrivateKey())
    const payload: Payload = {
      data: hash(data),
      sub: account.address,
      iss: 'https://armory.narval.xyz',
      iat: now
    }
    const jwt = await signJwt(payload, jwk, { alg: SigningAlg.EIP191 }, jwtSigner)

    return jwt
  }

  getPubKey(): string {
    return privateKeyToAccount(this.getPrivateKey()).publicKey
  }

  private getPrivateKey(): `0x${string}` {
    // TODO (@wcalderipe, 02/02/24): Storing the private key in environment
    // variables is a suitable approach for initial project setup. However, for
    // production environments, it's crucial to secure them in a vault.
    return this.configService.get('dataFeed.priceFeedPrivateKey', { infer: true })
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
      const result = safeDecode({
        input: {
          type: InputType.TRANSACTION_REQUEST,
          txRequest: authzRequest.request.transactionRequest
        }
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
