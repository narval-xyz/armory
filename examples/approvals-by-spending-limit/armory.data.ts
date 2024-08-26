import {
  AuthClient,
  EntityStoreClient,
  Permission,
  PolicyStoreClient,
  PublicKey,
  VaultClient
} from '@narval-xyz/armory-sdk'
import { AccountEntity, CredentialEntity } from '@narval-xyz/armory-sdk/policy-engine-shared'
import { addressToKid, publicKeySchema } from '@narval-xyz/armory-sdk/signature'
import { Action, Criterion, EntityType, Policy, Then, UserEntity, UserRole, ValueOperators } from '@narval/policy-engine-shared'
import { Curves, KeyTypes, SigningAlg, jwkEoaSchema, privateKeyToJwk } from '@narval/signature'
import { v4 } from 'uuid'
import { Hex } from 'viem'

const setPolicies = async (policyStoreClient: PolicyStoreClient) => {
  const policies: Policy[] = [
    {
      id: v4(),
      description: 'Allows admin to do anything',
      when: [
        {
          criterion: Criterion.CHECK_PRINCIPAL_ROLE,
          args: [UserRole.ADMIN]
        }
      ],
      then: Then.PERMIT
    },
    {
      id: v4(),
      description: 'Allows managers to read, create and import wallets',
      when: [
        {
          criterion: Criterion.CHECK_PRINCIPAL_ROLE,
          args: [UserRole.MANAGER]
        },
        {
          criterion: Criterion.CHECK_PERMISSION,
          args: ['wallet:read', 'wallet:create', 'wallet:import']
        }
      ],
      then: Then.PERMIT
    },
    {
      id: v4(),
      description: 'Allows members to read wallets',
      when: [
        {
          criterion: Criterion.CHECK_PRINCIPAL_ROLE,
          args: [UserRole.MEMBER]
        },
        {
          criterion: Criterion.CHECK_PERMISSION,
          args: ['wallet:read']
        }
      ],
      then: Then.PERMIT
    },
    {
      id: 'members-can-transfer-1-eth-per-minute',
      description: 'members can transfer 1 ETH',
      when: [
        {
          criterion: 'checkAction',
          args: ['signTransaction']
        },
        {
          criterion: 'checkPrincipalRole',
          args: ['member']
        },
        {
          criterion: 'checkIntentType',
          args: ['transferNative']
        },
        {
          criterion: 'checkIntentToken',
          args: ['eip155:1/slip44:60']
        },
        {
          criterion: 'checkSpendingLimit',
          args: {
            limit: '1000000000000000000',
            operator: 'lt' as ValueOperators,
            timeWindow: {
              type: 'rolling',
              value: 30
            },
            filters: {
              perPrincipal: true,
              tokens: ['eip155:1/slip44:60']
            }
          }
        }
      ],
      then: 'permit'
    },
    {
      id: 'members-can-transfer-gt-1-eth-per-minute-with-approval',
      description: 'members transfers for more than 1 ETH per day requires an admin approval',
      when: [
        {
          criterion: 'checkAction',
          args: ['signTransaction']
        },
        {
          criterion: 'checkPrincipalRole',
          args: ['member']
        },
        {
          criterion: 'checkIntentType',
          args: ['transferNative']
        },
        {
          criterion: 'checkIntentToken',
          args: ['eip155:1/slip44:60']
        },
        {
          criterion: 'checkSpendingLimit',
          args: {
            limit: '1000000000000000000',
            operator: 'gte' as ValueOperators,
            timeWindow: {
              type: 'rolling',
              value: 30
            },
            filters: {
              perPrincipal: true,
              tokens: ['eip155:1/slip44:60']
            }
          }
        },
        {
          criterion: 'checkApprovals',
          args: [
            {
              approvalCount: 1,
              countPrincipal: false,
              approvalEntityType: 'Narval::UserRole' as EntityType,
              entityIds: ['admin']
            }
          ]
        }
      ],
      then: 'permit'
    }
  ]
  await policyStoreClient.signAndPush(policies)
}

export const createPublicKey = (credInput: Hex): PublicKey => {
  return credInput.length === 42
    ? jwkEoaSchema.parse({
      kty: KeyTypes.EC,
      crv: Curves.SECP256K1,
      alg: SigningAlg.ES256K,
      kid: addressToKid(credInput),
      addr: credInput
    })
    : publicKeySchema.parse(privateKeyToJwk(credInput, 'ES256K'))
}

const setEntities = async (
  entityStoreClient: EntityStoreClient,
  userAndCredentials: { credential: Hex; role: UserRole; id?: string }[],
  accounts: AccountEntity[]
) => {
  const entitiesInput = userAndCredentials.reduce(
    (acc, { credential: credInput, role, id }) => {
      const user: UserEntity = {
        id: id || v4(),
        role
      }

      const publicKey = createPublicKey(credInput)

      const cred: CredentialEntity = {
        id: publicKey.kid,
        key: publicKey,
        userId: user.id
      }

      acc.users.push(user)
      acc.credentials.push(cred)

      return acc
    },
    {
      users: [] as UserEntity[],
      credentials: [] as CredentialEntity[],
      accounts
    }
  )

  await entityStoreClient.signAndPush(entitiesInput)
}

export const setInitialState = async ({
  armory,
  userAndCredentials
}: {
  armory: {
    vaultClient: VaultClient
    authClient: AuthClient
    entityStoreClient: EntityStoreClient
    policyStoreClient: PolicyStoreClient
  }
  userAndCredentials: { credential: Hex; role: UserRole; id?: string }[]
}) => {
  const { vaultClient, authClient, entityStoreClient, policyStoreClient } = armory

  await setPolicies(policyStoreClient)
  await setEntities(entityStoreClient, userAndCredentials, [])

  const accessToken = await authClient.requestAccessToken({
    action: Action.GRANT_PERMISSION,
    resourceId: 'vault',
    nonce: v4(),
    permissions: [Permission.WALLET_IMPORT, Permission.WALLET_CREATE, Permission.WALLET_READ]
  })

  const { account } = await vaultClient.generateWallet({ accessToken })

  await setEntities(entityStoreClient, userAndCredentials, [
    {
      id: account.id,
      accountType: 'eoa',
      address: account.address as Hex
    }
  ])
  return account
}
