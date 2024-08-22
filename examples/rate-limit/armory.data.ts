import {
  Address,
  ArmoryClientConfig,
  AuthClient,
  EntityStoreClient,
  Permission,
  PolicyStoreClient,
  PublicKey,
  VaultClient,
  credential,
  publicKeyToJwk
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
import { CredentialEntity } from '@narval-xyz/armory-sdk/policy-engine-shared'
import { Curves, jwkEoaSchema, KeyTypes, SigningAlg } from '@narval/signature'
import { addressToKid, publicKeySchema } from '@narval-xyz/armory-sdk/signature'

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
      id: v4(),
      description: 'Allows member to transferNative',
      when: [
        {
          criterion: Criterion.CHECK_PRINCIPAL_ROLE,
          args: [UserRole.MEMBER]
        },
        {
          criterion: Criterion.CHECK_INTENT_TYPE,
          args: ['transferNative']
        },
      ],
      then: Then.PERMIT
    },
    {
      id: v4(),
      description: 'Forbid member to transferNative more than 3 times',
      when: [
        {
          criterion: Criterion.CHECK_PRINCIPAL_ROLE,
          args: [UserRole.MEMBER]
        },
        {
          criterion: Criterion.CHECK_INTENT_TYPE,
          args: ['transferNative']
        },
        {
          criterion: Criterion.CHECK_RATE_LIMIT,
          args: { limit: 3 }
        },
      ],
      then: Then.FORBID
    },
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
        addr: credInput,
      })
    : publicKeySchema.parse(privateKeyToJwk(credInput, 'ES256K'));
}

const setEntities = async (
  entityStoreClient: EntityStoreClient,
  userAndCredentials: { credential: Hex; role: UserRole; id?: string }[]
) => {
  const entitiesInput = userAndCredentials.reduce(
    (acc, { credential: credInput, role, id }) => {
      const user: UserEntity = {
        id: id || v4(),
        role,
      };

      const publicKey = createPublicKey(credInput);

      const cred: CredentialEntity = {
        id: publicKey.kid,
        key: publicKey,
        userId: user.id,
      };

      acc.users.push(user);
      acc.credentials.push(cred);

      return acc;
    },
    {
      users: [] as UserEntity[],
      credentials: [] as CredentialEntity[],
    }
  );

  await entityStoreClient.signAndPush(entitiesInput);
};

export const setInitialState = async (
  {
    armory,
    userAndCredentials,
  }: {
    armory: {
      vaultClient: VaultClient,
      authClient: AuthClient,
      entityStoreClient: EntityStoreClient,
      policyStoreClient: PolicyStoreClient
    },
    userAndCredentials: { credential: Hex, role: UserRole, id?: string }[]
  }
) => {
  const { vaultClient, authClient, entityStoreClient, policyStoreClient } = armory
  await setPolicies(policyStoreClient)
  await setEntities(entityStoreClient, userAndCredentials)

  const accessToken = await authClient.requestAccessToken({
    action: Action.GRANT_PERMISSION,
    resourceId: 'vault',
    nonce: v4(),
    permissions: [Permission.WALLET_IMPORT, Permission.WALLET_CREATE, Permission.WALLET_READ]
  })

  const { account } = await vaultClient.generateWallet({ accessToken })

  return { address: account.address as Hex }
}
