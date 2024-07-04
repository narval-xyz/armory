import { AuthClient, EntityStoreClient, Permission, PolicyStoreClient, VaultClient, credential, resourceId } from "@narval/armory-sdk";
import { AccountEntity, AccountType, Action, Criterion, Entities, EntityData, Policy, Then, UserEntity, UserRole } from "@narval/policy-engine-shared";
import { Hex, getPublicKey, privateKeyToJwk } from "@narval/signature";
import { v4 } from "uuid";
import { privateKeyToAccount, generatePrivateKey } from "viem/accounts";
import { InputType, Intents, SUPPORTED_METHODS, SupportedMethodId, safeDecode } from '@narval/transaction-request-intent'


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
      description: 'cant native transfer when doing userOps',
      when: [
        {
          criterion: Criterion.CHECK_ACTION,
          args: [Action.SIGN_USER_OPERATION]
        },
        {
          criterion: Criterion.CHECK_INTENT_TYPE,
          args: [Intents.TRANSFER_NATIVE]
        }
      ],
      then: Then.FORBID
    }
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
    credentials: [credential(user, userPublicKey)],
  }

  await entityStoreClient.signAndPush(entities)
}

export const setInitialState = async ({
  entityStoreClient,
  policyStoreClient,
  authClient,
  vaultClient,
}: {
  entityStoreClient: EntityStoreClient,
  policyStoreClient: PolicyStoreClient,
  authClient: AuthClient,
  vaultClient: VaultClient,
}, ROOT_USER_CRED: Hex) => {
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