import { Action, EntityType, FIXTURE, UserRole, ValueOperators } from '@narval/authz-shared'
import { Intents } from '@narval/transaction-request-intent'
import { Criterion, Policy, Then } from '../../shared/types/policy.type'

export const examplePermitPolicy: Policy = {
  then: Then.PERMIT,
  name: 'examplePermitPolicy',
  when: [
    {
      criterion: Criterion.CHECK_RESOURCE_INTEGRITY,
      args: null
    },
    {
      criterion: Criterion.CHECK_NONCE_EXISTS,
      args: null
    },
    {
      criterion: Criterion.CHECK_ACTION,
      args: [Action.SIGN_TRANSACTION]
    },
    {
      criterion: Criterion.CHECK_PRINCIPAL_ID,
      args: [FIXTURE.USER.Alice.role]
    },
    {
      criterion: Criterion.CHECK_WALLET_ID,
      args: [FIXTURE.WALLET.engineering1.address]
    },
    {
      criterion: Criterion.CHECK_INTENT_TYPE,
      args: [Intents.TRANSFER_NATIVE]
    },
    {
      criterion: Criterion.CHECK_INTENT_TOKEN,
      args: ['eip155:137/slip44:966']
    },
    {
      criterion: Criterion.CHECK_INTENT_AMOUNT,
      args: {
        currency: '*',
        operator: ValueOperators.LESS_THAN_OR_EQUAL,
        value: '1000000000000000000'
      }
    },
    {
      criterion: Criterion.CHECK_APPROVALS,
      args: [
        {
          approvalCount: 2,
          countPrincipal: false,
          approvalEntityType: EntityType.User,
          entityIds: [FIXTURE.USER.Bob.uid, FIXTURE.USER.Carol.uid]
        },
        {
          approvalCount: 1,
          countPrincipal: false,
          approvalEntityType: EntityType.UserRole,
          entityIds: [UserRole.ADMIN]
        }
      ]
    }
  ]
}

export const exampleForbidPolicy: Policy = {
  then: Then.FORBID,
  name: 'exampleForbidPolicy',
  when: [
    {
      criterion: Criterion.CHECK_RESOURCE_INTEGRITY,
      args: null
    },
    {
      criterion: Criterion.CHECK_NONCE_EXISTS,
      args: null
    },
    {
      criterion: Criterion.CHECK_ACTION,
      args: [Action.SIGN_TRANSACTION]
    },
    {
      criterion: Criterion.CHECK_PRINCIPAL_ID,
      args: [FIXTURE.USER.Alice.uid]
    },
    {
      criterion: Criterion.CHECK_WALLET_ID,
      args: [FIXTURE.WALLET.engineering1.address]
    },
    {
      criterion: Criterion.CHECK_INTENT_TYPE,
      args: [Intents.TRANSFER_NATIVE]
    },
    {
      criterion: Criterion.CHECK_INTENT_TOKEN,
      args: ['eip155:137/slip44:966']
    },
    {
      criterion: Criterion.CHECK_SPENDING_LIMIT,
      args: {
        limit: '1000000000000000000',
        timeWindow: {
          type: 'rolling',
          value: 12 * 60 * 60
        },
        filters: {
          tokens: ['eip155:137/slip44:966'],
          users: ['matt@narval.xyz']
        }
      }
    }
  ]
}

export const policies = {
  policies: [examplePermitPolicy, exampleForbidPolicy]
}

const metaPermissions = [
  Action.CREATE_ORGANIZATION,
  Action.CREATE_USER,
  Action.UPDATE_USER,
  Action.CREATE_CREDENTIAL,
  Action.ASSIGN_USER_GROUP,
  Action.ASSIGN_WALLET_GROUP,
  Action.ASSIGN_USER_WALLET,
  Action.DELETE_USER,
  Action.REGISTER_WALLET,
  Action.CREATE_ADDRESS_BOOK_ACCOUNT,
  Action.EDIT_WALLET,
  Action.UNASSIGN_WALLET,
  Action.REGISTER_TOKENS,
  Action.EDIT_USER_GROUP,
  Action.DELETE_USER_GROUP,
  Action.CREATE_WALLET_GROUP,
  Action.DELETE_WALLET_GROUP
]

export const permitMetaPermission: Policy = {
  name: 'permitMetaPermission',
  when: [
    {
      criterion: Criterion.CHECK_ACTION,
      args: metaPermissions
    },
    {
      criterion: Criterion.CHECK_PRINCIPAL_ROLE,
      args: [UserRole.ADMIN]
    },
    {
      criterion: Criterion.CHECK_APPROVALS,
      args: [
        {
          approvalCount: 2,
          countPrincipal: false,
          approvalEntityType: EntityType.UserRole,
          entityIds: [UserRole.ADMIN, UserRole.ROOT]
        }
      ]
    }
  ],
  then: Then.PERMIT
}

export const forbidMetaPermission: Policy = {
  name: 'forbidMetaPermission',
  when: [
    {
      criterion: Criterion.CHECK_ACTION,
      args: metaPermissions
    },
    {
      criterion: Criterion.CHECK_PRINCIPAL_ROLE,
      args: [UserRole.ADMIN]
    }
  ],
  then: Then.FORBID
}
