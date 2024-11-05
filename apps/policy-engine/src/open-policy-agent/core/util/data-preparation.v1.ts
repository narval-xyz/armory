import { indexBy } from 'lodash/fp'
import { Account, AccountGroup, DataV1, UserGroup,  } from '../type/open-policy-agent.type.v1'
import { Entities } from 'packages/policy-engine-shared/src/lib/schema/entity.schema.shared'

export const toDataV1 = (entities: Entities): DataV1 => {
  const userGroups = entities.userGroupMembers.reduce((groups, { userId, groupId }) => {
    const id = groupId.toLowerCase()
    const group = groups.get(id)

    if (group) {
      return groups.set(id, {
        id: groupId,
        users: group.users.concat(userId)
      })
    } else {
      return groups.set(groupId, { id: groupId, users: [userId] })
    }
  }, new Map<string, UserGroup>())

  const accountAssignees = entities.userAccounts.reduce((assignees, { userId, accountId }) => {
    const account = assignees.get(accountId)

    if (account) {
      return assignees.set(accountId, account.concat(userId))
    } else {
      return assignees.set(accountId, [userId])
    }
  }, new Map<string, string[]>())

  const accounts: Account[] = entities.accounts.map((account) => ({
    ...account,
    assignees: accountAssignees.get(account.id) || []
  }))

  const accountGroups = entities.accountGroupMembers.reduce((groups, { accountId, groupId }) => {
    const group = groups.get(groupId)

    if (group) {
      return groups.set(groupId, {
        id: groupId,
        accounts: group.accounts.concat(accountId)
      })
    } else {
      return groups.set(groupId, { id: groupId, accounts: [accountId] })
    }
  }, new Map<string, AccountGroup>())

  const data: DataV1 = {
    entities: {
      addressBook: indexBy('id', entities.addressBook),
      tokens: indexBy('id', entities.tokens),
      users: indexBy('id', entities.users),
      userGroups: Object.fromEntries(userGroups),
      accounts: indexBy('id', accounts),
      accountGroups: Object.fromEntries(accountGroups)
    }
  }

  // IMPORTANT: The Data schema converts IDs to lower case because we don't
  // want to be doing defensive programming in Rego.
  return DataV1.parse(data)
}