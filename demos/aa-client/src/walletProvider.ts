// src/index.ts

import {
  Action,
  Criterion,
  Decision,
  Entities,
  EntityStore,
  Policy,
  PolicyStore,
  Request,
  Then
} from '@narval/policy-engine-shared'
import { NarvalSdk } from '@narval/sdk'
import { secp256k1PublicKeySchema } from '@narval/signature'
import { UserWallet } from '@thirdweb-dev/sdk'
import { v4 } from 'uuid'
import { Hex } from 'viem'
import { generatePrivateKey } from 'viem/accounts'
import { User, Wallet } from './models'
import { entities, policies, users, wallets } from './store'
import generateSmartAccount from './thirdweb.client'

export default class WalletProvider {
  narvalSdk: NarvalSdk

  users: Map<string, User> = users

  wallets: Map<string, Wallet> = wallets

  entityStore: { entity: EntityStore } = entities

  policyStore: { policy: PolicyStore } = policies

  constructor(sdk: NarvalSdk) {
    this.narvalSdk = sdk
  }

  async getWallets(): Promise<Wallet[]> {
    return Array.from(this.wallets.values())
  }

  generateWallet(name: string, userId: string): Wallet {
    const user = this.users.get(userId)
    if (!user) {
      throw new Error('User not found')
    }

    const wallet: Wallet = {
      id: v4(),
      name,
      key: generatePrivateKey(),
      userIds: [userId]
    }

    this.wallets.set(wallet.id, wallet)

    return wallet
  }

  async instantiateAccount(walletId: string, userId: string): Promise<UserWallet> {
    const user = this.users.get(userId)
    if (!user) {
      throw new Error('User not found')
    }

    const wallet = this.wallets.get(walletId)
    if (!wallet) {
      throw new Error('Wallet not found')
    }

    const smartWallet = await generateSmartAccount(wallet.key)
    return smartWallet
  }

  async signMessage(userId: string, walletId: string, message: string = 'Hello, world!'): Promise<string> {
    const user = this.users.get(userId)
    const wallet = this.wallets.get(walletId)
    if (!user) {
      throw new Error('User not found')
    }
    if (!wallet) {
      throw new Error('Wallet not found')
    }

    const request: Request = {
      action: 'signMessage',
      nonce: v4(),
      resourceId: wallet.id,
      message
    }

    const result = await this.narvalSdk.evaluate(request, { jwk: user.credential })

    const account = await this.instantiateAccount(wallet.key, user.id)
    if (result.decision === Decision.PERMIT) {
      const signedMessage = await account.sign(message)
      return signedMessage
    }

    return result.decision
  }

  getPolicies(): { policy: PolicyStore } {
    return this.policyStore
  }

  getEntities(): { entity: EntityStore } {
    return this.entityStore
  }

  async updatePolicies(userId: string): Promise<void> {
    const user = this.users.get(userId)
    if (!user) {
      throw new Error('User not found')
    }
    const ids: string[] = []
    this.users.forEach((user) => ids.push(user.id))
    const data: Policy[] = [
      {
        id: 'c13fe2c1-ecbe-43fe-9e0e-fae730fd5f50',
        description: 'Permit users to sign message',
        when: [
          {
            criterion: Criterion.CHECK_PRINCIPAL_ID,
            args: ids
          },
          {
            criterion: Criterion.CHECK_ACTION,
            args: [Action.SIGN_MESSAGE]
          }
        ],
        then: Then.PERMIT
      }
    ]

    await this.narvalSdk.savePolicies(data)
  }

  async updateEntities(userId: string): Promise<void> {
    const user = this.users.get(userId)
    if (!user) {
      throw new Error('User not found')
    }

    const entities: Entities = {
      addressBook: [],
      credentials: [],
      tokens: [],
      userGroups: [],
      userGroupMembers: [],
      userWallets: [],
      users: [],
      walletGroupMembers: [],
      walletGroups: [],
      wallets: []
    }

    this.users.forEach((user) => {
      entities.users.push({ id: user.id, role: 'admin' })
      entities.credentials.push({ id: v4(), userId: user.id, key: secp256k1PublicKeySchema.parse(user.credential) })
    })

    const wallets = this.wallets.values()

    for (const wallet of wallets) {
      const smartWallet = await generateSmartAccount(wallet.key)
      const address = (await smartWallet.getAddress()).toLowerCase() as Hex

      entities.wallets.push({ id: wallet.id, address, accountType: '4337' })
    }

    // const request = {
    //   action: 'saveEntities',
    //   data: entities
    // } as unknown as Request

    // const evaluationResponse = await this.narvalSdk.evaluate(request, { jwk: user.credential })

    // if (evaluationResponse.decision === Decision.PERMIT && evaluationResponse.accessToken) {
    await this.narvalSdk.saveEntities(entities)
    // }
  }
}
