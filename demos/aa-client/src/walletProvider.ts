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
import { NarvalSdk, buildRequest } from '@narval/sdk'
import { PublicKey } from '@narval/signature'
import { SmartWallet } from '@thirdweb-dev/wallets'
import { v4 } from 'uuid'
import { Hex } from 'viem'
import default_sdk from './NarvalSdk'
import { User, Wallet } from './models'
import { entities, policies, users, wallets } from './store'
import createSmartAccount from './thirdweb.client'

export default class WalletProvider {
  narvalSdk: NarvalSdk

  users: Map<string, User> = users

  wallets: Map<string, Wallet> = wallets

  entityStore: Map<string, EntityStore> = entities

  policyStore: Map<string, PolicyStore> = policies

  constructor(sdk?: NarvalSdk) {
    this.narvalSdk = sdk || default_sdk
  }

  async generate4337Wallet(): Promise<SmartWallet> {
    const newSmartWallet = await createSmartAccount()
    const wallet = new Wallet(newSmartWallet)

    this.wallets.set(Wallet.id, wallet)

    return wallet
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

    const request = buildRequest('wallet').setAction('signMessage').setMessage(message).build()
    const result = await this.narvalSdk.evaluate(request)

    console.log('Evaluation result:', result.decision)

    if (result.decision === Decision.PERMIT) {
      const signedMessage = await wallet.signMessage(message)
      console.log('Signed message: ', signedMessage)
      return signedMessage
    }

    return result.decision
  }

  async getPolicies(): Promise<PolicyStore> {
    const policies = this.policyStore.values()
    return policies.next().value
  }

  async getEntities(): Promise<EntityStore> {
    const entities = this.entityStore.values()
    return entities.next().value
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

    const request = {
      action: 'savePolicies',
      data
    } as unknown as Request

    const evaluationResponse = await this.narvalSdk.evaluate(request)

    if (evaluationResponse.decision === Decision.PERMIT && evaluationResponse.accessToken) {
      const policyStore = await this.narvalSdk.savePolicies(evaluationResponse.accessToken, data)
      const policyStoreId = v4()

      this.policyStore.set(policyStoreId, policyStore)
    }
    throw new Error('Unauthorized')
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
      entities.credentials.push({ id: v4(), userId: user.id, key: user.credential as PublicKey })
    })

    const wallets = this.wallets.values()

    for (const wallet of wallets) {
      const address = (await wallet.getAddress()) as Hex
      entities.wallets.push({ id: Wallet.id, address, accountType: '4337' })
    }
    const request = {
      action: 'saveEntities',
      data: entities
    } as unknown as Request

    const evaluationResponse = await this.narvalSdk.evaluate(request)

    if (evaluationResponse.decision === Decision.PERMIT && evaluationResponse.accessToken) {
      const store = await this.narvalSdk.saveEntities(evaluationResponse.accessToken, entities)
      this.entityStore.set(v4(), store)
    }
  }
}
