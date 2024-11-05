import { indexBy } from 'lodash/fp'
import { DataV2, Group } from '../type/open-policy-agent.type.v2'
import { Entities } from 'packages/policy-engine-shared/src/lib/schema/entity.schema.shared'
import { Account } from '../type/open-policy-agent.type.v1'

export const toDataV2 = (entities: Entities): DataV2 => {
  const groups = new Map<string, Group>()

  // Process user group members
  entities.userGroupMembers.forEach(({ userId, groupId }) => {
    const id = groupId.toLowerCase()
    const group = groups.get(id) || {
      id: groupId,
      users: [],
      accounts: []
    }

    group.users.push(userId)
    groups.set(id, group)
  })

  // Process account group members
  entities.accountGroupMembers.forEach(({ accountId, groupId }) => {
    const id = groupId.toLowerCase()
    const group = groups.get(id) || {
      id: groupId,
      users: [],
      accounts: []
    }

    group.accounts.push(accountId)
    groups.set(id, group)
  })

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

  const data: DataV2 = {
    entities: {
      addressBook: indexBy('id', entities.addressBook),
      tokens: indexBy('id', entities.tokens),
      users: indexBy('id', entities.users),
      groups: Object.fromEntries(groups),
      accounts: indexBy('id', accounts)
    }
  }

  // IMPORTANT: The Data schema converts IDs to lower case because we don't
  // want to be doing defensive programming in Rego.
  return DataV2.parse(data)
}