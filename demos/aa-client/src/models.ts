// src/models.ts

import { Jwk } from '@narval-xyz/signature'
import { Polygon } from '@thirdweb-dev/chains'
import { SmartWallet } from '@thirdweb-dev/wallets'

export type User = {
  id: string
  name: string
  credential: Jwk
  walletIds: string[]
}

export class Wallet extends SmartWallet {
  userIds: string[]

  constructor(smartWallet: SmartWallet, userIds: string[] = []) {
    const options = smartWallet.getOptions() || {
      chain: Polygon,
      factoryAddress: '0x61ffcc675cfbf8e0A35Cd6140bfe40Fe94DF845f',
      secretKey: process.env.THIRDWEB_SECRET as string,
      gasless: true
    }
    super(options)
    this.userIds = userIds
  }

  assign(userId: string) {
    this.userIds.push(userId)
  }
}
