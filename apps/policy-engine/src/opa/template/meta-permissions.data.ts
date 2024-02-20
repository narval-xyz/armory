import { Action, EntityType, UserRole } from '@narval/policy-engine-shared'
import { Criterion, Policy, Then } from '../../shared/types/policy.type'

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
