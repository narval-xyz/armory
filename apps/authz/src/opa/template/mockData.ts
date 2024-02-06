import { Criterion, PolicyCriterionBuilder, Then } from '@app/authz/shared/types/policy-builder.type'
import { Action } from '@narval/authz-shared'
import { Intents } from '@narval/transaction-request-intent'

export const examplePermitPolicy: PolicyCriterionBuilder = {
  then: Then.PERMIT,
  name: 'examplePermitPolicy',
  when: [
    {
      criterion: Criterion.CHECK_TRANSFER_RESOURCE_INTEGRITY,
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
      args: ['matt@narval.xyz']
    },
    {
      criterion: Criterion.CHECK_WALLET_ID,
      args: ['eip155:eoa:0x90d03a8971a2faa19a9d7ffdcbca28fe826a289b']
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
      args: { currency: '*', operator: 'lte', value: '1000000000000000000' }
    },
    {
      criterion: Criterion.CHECK_APPROVALS,
      args: [
        {
          approvalCount: 2,
          countPrincipal: false,
          approvalEntityType: 'Narval::User',
          entityIds: ['aa@narval.xyz', 'bb@narval.xyz']
        },
        {
          approvalCount: 1,
          countPrincipal: false,
          approvalEntityType: 'Narval::UserRole',
          entityIds: ['admin']
        }
      ]
    }
  ]
}

export const exampleForbidPolicy: PolicyCriterionBuilder = {
  then: Then.FORBID,
  name: 'exampleForbidPolicy',
  when: [
    {
      criterion: Criterion.CHECK_TRANSFER_RESOURCE_INTEGRITY,
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
      args: ['matt@narval.xyz']
    },
    {
      criterion: Criterion.CHECK_WALLET_ID,
      args: ['eip155:eoa:0x90d03a8971a2faa19a9d7ffdcbca28fe826a289b']
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
