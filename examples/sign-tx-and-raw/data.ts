import { AuthClient, EntityStoreClient, PolicyStoreClient, VaultClient } from '@narval-xyz/armory-sdk'
import { CredentialEntity, hexSchema, policySchema } from '@narval-xyz/armory-sdk/policy-engine-shared'
import { PublicKey, privateKeyToJwk, publicKeySchema } from '@narval-xyz/armory-sdk/signature'
import { WalletDtoAccount } from '@narval-xyz/armory-sdk/src/lib/http/client/vault'
import { Hex } from 'viem'
import { privateKeyToAddress } from 'viem/accounts'
import { z } from 'zod'
import { getArmoryClients } from './armory.sdk'

const policies = [
  {
    id: '1-admin-create-wallets',
    description: 'Admins can create new wallets in vault',
    when: [
      {
        criterion: 'checkPrincipalRole',
        args: ['admin']
      },
      {
        criterion: 'checkPermission',
        args: ['wallet:read', 'wallet:create', 'wallet:import']
      }
    ],
    then: 'permit'
  },
  {
    id: '2-admin-full-access',
    description: 'Allow all for Admins',
    when: [
      {
        criterion: 'checkPrincipalRole',
        args: ['admin']
      }
    ],
    then: 'permit'
  }
]

export const basePolicies = z.array(policySchema).parse(policies)

export const addUser = async ({
  entityStoreClient,
  userPublicKey,
  userId,
  role = 'member'
}: {
  entityStoreClient: EntityStoreClient
  userPublicKey: PublicKey
  userId: string
  role?: 'admin' | 'member'
}) => {
  const credential: CredentialEntity = {
    id: userPublicKey.kid,
    key: userPublicKey,
    userId
  }

  const { data } = await entityStoreClient.fetch()

  const newEntities = {
    ...data,
    users: [...(data.users || []), { id: userId, role }],
    credentials: [...(data.credentials || []), credential]
  }

  await entityStoreClient.signAndPush(newEntities)
}

export const addAccount = async ({
  entityStoreClient,
  account
}: {
  entityStoreClient: EntityStoreClient
  account: WalletDtoAccount
}) => {
  const { data: entity } = await entityStoreClient.fetch()

  const newEntities = {
    ...entity,
    accounts: [
      ...(entity.accounts || []),
      {
        id: account.id,
        address: account.address as Hex,
        accountType: 'eoa' as const
      }
    ]
  }

  await entityStoreClient.signAndPush(newEntities)
}

export const whiteList = async ({
  entityStoreClient,
  address,
  chainId
}: {
  entityStoreClient: EntityStoreClient
  address: string
  chainId: number
}) => {
  const { data: entity } = await entityStoreClient.fetch()

  const newEntities = {
    ...entity,
    addressBook: [
      ...(entity.addressBook || []),
      {
        id: `eip155:${chainId}:${address}` as const,
        address: address as Hex,
        classification: 'counterparty' as const,
        chainId
      }
    ]
  }

  await entityStoreClient.signAndPush(newEntities)
}

type ArmoryStack = {
  authClient: AuthClient
  vaultClient: VaultClient
  entityStoreClient: EntityStoreClient
  policyStoreClient: PolicyStoreClient
}

export class SystemManager {
  private systemManagerArmory: ArmoryStack

  private constructor(armoryStack: ArmoryStack) {
    this.systemManagerArmory = armoryStack
  }

  public static async create(): Promise<SystemManager> {
    const systemManagerPrivateKey = hexSchema.parse(process.env.SYSTEM_MANAGER_PRIVATE_KEY)
    const vaultHost = process.env.VAULT_HOST
    const authHost = process.env.AUTH_HOST
    const clientId = process.env.CLIENT_ID
    const clientSecret = process.env.CLIENT_SECRET

    if (!authHost || !vaultHost || !clientId || !clientSecret) {
      throw new Error('Missing configuration')
    }
    const keyId = privateKeyToAddress(systemManagerPrivateKey)
    const systemManagerArmory = await getArmoryClients(
      systemManagerPrivateKey,
      {
        clientId,
        clientSecret,
        vaultHost,
        authHost
      },
      keyId
    )
    return new SystemManager(systemManagerArmory)
  }

  async addUser({
    userPublicKey,
    userId,
    role
  }: {
    userPublicKey: PublicKey
    userId: string
    role?: 'admin' | 'member'
  }) {
    await addUser({ entityStoreClient: this.systemManagerArmory.entityStoreClient, userPublicKey, userId, role })
  }

  async addAccount(account: WalletDtoAccount) {
    await addAccount({ entityStoreClient: this.systemManagerArmory.entityStoreClient, account })
  }

  async initializeEntities() {
    const playerOnePrivateKey = hexSchema.parse(process.env.PLAYER_ONE_PRIVATE_KEY)
    const playerOnePublicKey = publicKeySchema.parse(privateKeyToJwk(playerOnePrivateKey))
    await this.addUser({
      userId: 'player-one-user-id',
      userPublicKey: playerOnePublicKey,
      role: 'admin'
    })
  }

  async initializePolicies() {
    await this.systemManagerArmory.policyStoreClient.signAndPush(basePolicies)
  }
}
