import { AuthClient, EntityStoreClient, PolicyStoreClient, VaultClient } from '@narval-xyz/armory-sdk'
import {
  CredentialEntity,
  EntityType,
  Policy,
  hexSchema,
  policySchema
} from '@narval-xyz/armory-sdk/policy-engine-shared'
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

export const addPolicy = async ({ policyStoreClient }: { policyStoreClient: PolicyStoreClient }) => {
  const newPolicy: Policy = {
    id: '2-outgoing-transfer-requires-2-of-2-approvals',
    description:
      'Both P1 and P2 must approve an outgoing transaction. Transaction must be to a whitelisted counterparty address.',
    when: [
      {
        criterion: 'checkAction',
        args: ['signTransaction']
      },
      {
        criterion: 'checkDestinationClassification',
        args: ['counterparty']
      },
      {
        criterion: 'checkApprovals',
        args: [
          {
            approvalCount: 2,
            countPrincipal: true,
            approvalEntityType: 'Narval::User' as EntityType,
            entityIds: ['player-one-user-id', 'player-two-user-id']
          }
        ]
      }
    ],
    then: 'permit'
  }

  const { data: currentPolicies } = await policyStoreClient.fetch()
  const newPolicies = [...currentPolicies, newPolicy]

  await policyStoreClient.signAndPush(newPolicies)
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
    const dataStoreSignerPrivateKey = hexSchema.parse(process.env.DATA_STORE_SIGNER_PRIVATE_KEY)
    const vaultHost = process.env.VAULT_HOST
    const authHost = process.env.AUTH_HOST
    const clientId = process.env.CLIENT_ID
    const clientSecret = process.env.CLIENT_SECRET

    if (!authHost || !vaultHost || !clientId || !clientSecret) {
      throw new Error('Missing configuration')
    }
    const keyId = privateKeyToAddress(dataStoreSignerPrivateKey)
    const systemManagerArmory = await getArmoryClients(
      dataStoreSignerPrivateKey,
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

  async whiteList({ address, chainId }: { address: string; chainId: number }) {
    await whiteList({ entityStoreClient: this.systemManagerArmory.entityStoreClient, address, chainId })
  }

  async addPolicy() {
    await addPolicy({ policyStoreClient: this.systemManagerArmory.policyStoreClient })
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
