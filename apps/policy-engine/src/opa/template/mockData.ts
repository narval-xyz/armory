import {
  Action,
  Criterion,
  EntityType,
  FIXTURE,
  Policy,
  Then,
  UserRole,
  ValueOperators
} from '@narval/policy-engine-shared'
import { Intents } from '@narval/transaction-request-intent'

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
      args: [FIXTURE.WALLET.Engineering.address]
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
          entityIds: [FIXTURE.USER.Bob.id, FIXTURE.USER.Carol.id]
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
      args: [FIXTURE.USER.Alice.id]
    },
    {
      criterion: Criterion.CHECK_WALLET_ID,
      args: [FIXTURE.WALLET.Engineering.address]
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
        operator: ValueOperators.GREATER_THAN,
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
