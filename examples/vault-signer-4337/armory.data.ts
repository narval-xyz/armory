import {
  AuthClient,
  EntityStoreClient,
  Permission,
  PolicyStoreClient,
  VaultClient,
  credential
} from '@narval-xyz/armory-sdk'
import { v4 } from 'uuid'
import {
  Action,
  Criterion,
  Entities,
  Policy,
  Then,
  UserEntity,
  UserRole
} from '../../packages/policy-engine-shared/src'
import { Hex, getPublicKey, privateKeyToJwk } from '../../packages/signature/src'

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
    }
    // {
    //   id: v4(),
    //   description: 'Forbid native transfer within user operations',
    //   when: [
    //     {
    //       criterion: Criterion.CHECK_ACTION,
    //       args: [Action.SIGN_USER_OPERATION]
    //     },
    //     {
    //       criterion: Criterion.CHECK_USER_OPERATION_INTENTS,
    //       args: [
    //         {
    //           type: [Intents.TRANSFER_NATIVE]
    //         }
    //       ]
    //     }
    //   ],
    //   then: Then.FORBID
    // }
    // Uncomment the above policy to forbid native transfer within user operations. If
  ]
  await policyStoreClient.signAndPush(policies)
}

const setEntities = async (entityStoreClient: EntityStoreClient, ROOT_USER_CRED: Hex) => {
  const user: UserEntity = {
    id: v4(),
    role: UserRole.ADMIN
  }

  const userAccount = privateKeyToJwk(ROOT_USER_CRED)
  const userPublicKey = getPublicKey(userAccount)

  const entities: Partial<Entities> = {
    users: [user],
    credentials: [credential(user, userPublicKey)]
  }

  await entityStoreClient.signAndPush(entities)
}

export const setInitialState = async (
  {
    entityStoreClient,
    policyStoreClient,
    authClient,
    vaultClient
  }: {
    entityStoreClient: EntityStoreClient
    policyStoreClient: PolicyStoreClient
    authClient: AuthClient
    vaultClient: VaultClient
  },
  ROOT_USER_CRED: Hex
) => {
  await setPolicies(policyStoreClient)
  await setEntities(entityStoreClient, ROOT_USER_CRED)

  const accessToken = await authClient.requestAccessToken({
    action: Action.GRANT_PERMISSION,
    resourceId: 'vault',
    nonce: v4(),
    permissions: [Permission.WALLET_IMPORT, Permission.WALLET_CREATE, Permission.WALLET_READ]
  })

  const { account } = await vaultClient.generateWallet({ accessToken })

  return { address: account.address as Hex }
}
