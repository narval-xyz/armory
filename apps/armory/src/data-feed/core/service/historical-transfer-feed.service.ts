import { ConfigService } from '@narval/config-module'
import { AuthorizationRequest, Feed, HistoricalTransfer, JwtString } from '@narval/policy-engine-shared'
import { Alg, Payload, SigningAlg, hash, hexToBase64Url, privateKeyToJwk, signJwt } from '@narval/signature'
import { Injectable } from '@nestjs/common'
import { omit } from 'lodash/fp'
import { privateKeyToAccount } from 'viem/accounts'
import { Config } from '../../../armory.config'
import { DataFeed } from '../../../data-feed/core/type/data-feed.type'
import { FiatId, Price } from '../../../shared/core/type/price.type'
import { Transfer } from '../../../shared/core/type/transfer-tracking.type'
import { TransferTrackingService } from '../../../transfer-tracking/core/service/transfer-tracking.service'

const buildHistoricalTranferRates = (rates: Price): Record<string, string> => {
  return Object.keys(rates).reduce(
    (acc, currency) => {
      const price = rates[currency as FiatId]

      if (price) {
        acc[currency] = price.toString()
      }

      return acc
    },
    {} as Record<string, string>
  )
}

@Injectable()
export class HistoricalTransferFeedService implements DataFeed<HistoricalTransfer[]> {
  static SOURCE_ID = 'armory/historical-transfer-feed'

  constructor(
    private transferTrackingService: TransferTrackingService,
    private configService: ConfigService<Config>
  ) {}

  getId(): string {
    return HistoricalTransferFeedService.SOURCE_ID
  }

  getPubKey(): string {
    return privateKeyToAccount(this.getPrivateKey()).publicKey
  }

  async sign(data: HistoricalTransfer[]): Promise<JwtString> {
    const account = privateKeyToAccount(this.getPrivateKey())

    const jwtSigner = async (msg: string) => {
      const jwtSig = await account.signMessage({ message: msg })

      return hexToBase64Url(jwtSig)
    }

    const now = Math.floor(Date.now() / 1000)
    const jwk = privateKeyToJwk(this.getPrivateKey(), Alg.ES256K)
    // TODO: the alg or kty of an hex encoded private key should be accessible
    const payload: Payload = {
      data: hash(data),
      sub: account.address,
      iss: 'https://armory.narval.xyz',
      iat: now
    }
    const jwt = await signJwt(payload, jwk, { alg: SigningAlg.EIP191 }, jwtSigner)

    return jwt
  }

  private getPrivateKey(): `0x${string}` {
    // TODO (@wcalderipe, 02/02/24): Storing the private key in environment
    // variables is a suitable approach for initial project setup. However, for
    // production environments, it's crucial to secure them in a vault.
    return this.configService.get('dataFeed.historicalTransferFeedPrivateKey')
  }

  async getFeed(input: AuthorizationRequest): Promise<Feed<HistoricalTransfer[]>> {
    const transfers = await this.transferTrackingService.findByClientId(input.clientId)
    const historicalTransfers = HistoricalTransferFeedService.build(transfers)
    const sig = await this.sign(historicalTransfers)

    return {
      source: this.getId(),
      sig,
      data: historicalTransfers
    }
  }

  static build(transfers: Transfer[]): HistoricalTransfer[] {
    return transfers.map((transfer) => {
      return {
        ...omit('clientId', transfer),
        amount: transfer.amount.toString(),
        timestamp: transfer.createdAt.getTime(),
        rates: buildHistoricalTranferRates(transfer.rates)
      }
    })
  }
}
