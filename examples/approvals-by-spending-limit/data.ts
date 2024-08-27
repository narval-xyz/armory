import { CredentialEntity } from '@narval-xyz/armory-sdk/policy-engine-shared'
import { publicKeySchema } from '@narval-xyz/armory-sdk/signature'
import { Entities, policySchema } from '@narval/policy-engine-shared'
import { privateKeyToJwk } from '@narval/signature'
import { Hex } from 'viem'
import { z } from 'zod'

const baseEntities: Partial<Entities> = {
  users: [
    {
      id: '1-admin-user',
      role: 'admin'
    },
    {
      id: '2-member-user-q',
      role: 'member'
    },
    {
      id: 'system-manager',
      role: 'manager'
    }
  ],
  credentials: [],
  accounts: [
    // Treasury in dev.fixture.ts
    {
      id: 'acct-treasury-account-a',
      address: '0x0301e2724a40E934Cce3345928b88956901aA127',
      accountType: 'eoa'
    }
  ],
  userGroups: [
    {
      id: 'ug-treasury-group'
    }
  ],
  userGroupMembers: [
    {
      groupId: 'ug-treasury-group',
      userId: '2-member-user-q'
    }
  ],
  accountGroups: [
    {
      id: 'ag-treasury-group'
    }
  ],
  accountGroupMembers: [
    {
      accountId: 'acct-treasury-account-a',
      groupId: 'ag-treasury-group'
    }
  ],
  addressBook: []
}

const basePolicies = [
  {
    id: '1-admin-full-access',
    description: 'Permit admins to perform any action',
    when: [
      {
        criterion: 'checkPrincipalRole',
        args: ['admin']
      }
    ],
    then: 'permit'
  },
  {
    id: '2-system-manager-wallet-management',
    description: 'Permit the policy & data manager key to import or generate wallets',
    when: [
      {
        criterion: 'checkPrincipalId',
        args: ['system-manager']
      },
      {
        criterion: 'checkAction',
        args: ['grantPermission']
      },
      {
        criterion: 'checkPermission',
        args: ['wallet:read', 'wallet:create', 'wallet:import']
      }
    ],
    then: 'permit'
  },
  {
    id: '3-all-users-read-accounts',
    description: 'Allows all users to read wallets',
    when: [
      {
        criterion: 'checkPrincipalRole',
        args: ['member', 'admin', 'manager']
      },
      {
        criterion: 'checkPermission',
        args: ['wallet:read']
      }
    ],
    then: 'permit'
  },
  {
    id: '4-members-can-transfer-1-eth-per-minute',
    description: 'Users with member role can transfer 1 ETH',
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
          operator: 'lt',
          timeWindow: {
            type: 'rolling',
            value: 60
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
    id: '5-members-can-transfer-gte-1-eth-per-minute-with-approval',
    description: 'Users with member role requires an admin approval over 1 ETH per minute',
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
          operator: 'gte',
          timeWindow: {
            type: 'rolling',
            value: 60
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
            approvalEntityType: 'Narval::UserRole',
            entityIds: ['admin']
          }
        ]
      }
    ],
    then: 'permit'
  }
]

export const policies = z.array(policySchema).parse(basePolicies)

export const buildEntities = ({
  adminUserPrivateKey,
  memberUserPrivateKey,
  dataStoreSignerPrivateKey
}: {
  adminUserPrivateKey: Hex
  memberUserPrivateKey: Hex
  dataStoreSignerPrivateKey: Hex
}) => {
  const adminPublicKey = publicKeySchema.parse(privateKeyToJwk(adminUserPrivateKey, 'ES256K'))
  const adminCredential: CredentialEntity = {
    id: adminPublicKey.kid,
    key: adminPublicKey,
    userId: '1-admin-user'
  }
  const memberPublicKey = publicKeySchema.parse(privateKeyToJwk(memberUserPrivateKey, 'ES256K'))
  const memberCredential: CredentialEntity = {
    id: memberPublicKey.kid,
    key: memberPublicKey,
    userId: '2-member-user-q'
  }
  const systemManagerPublicKey = publicKeySchema.parse(privateKeyToJwk(dataStoreSignerPrivateKey, 'ES256K'))
  const systemManagerCredential: CredentialEntity = {
    id: systemManagerPublicKey.kid,
    key: systemManagerPublicKey,
    userId: 'system-manager'
  }

  // Add the credentials to the base entities; users, groups, etc. are already set up
  return {
    ...baseEntities,
    credentials: [adminCredential, memberCredential, systemManagerCredential]
  }
}
