import {
  FIXTURE_V2,
} from '@narval/policy-engine-shared'
import { EntitiesV } from 'packages/policy-engine-shared/src/lib/schema/entity.schema.shared'
import { toData } from '../../data-preparation.v2';

describe('toData', () => {
  describe('entities', () => {
    const lowerCaseId = <T extends { id: string }>(value: T) => ({ ...value, id: value.id.toLowerCase() })

    it('indexes address book accounts by lower case id', () => {
      const { entities } = toData(FIXTURE_V2.ENTITIES)
      const firstAccount = FIXTURE_V2.ADDRESS_BOOK[0]

      expect(entities.addressBook[firstAccount.id.toLowerCase()]).toEqual(lowerCaseId(firstAccount))
    })

    it('indexes tokens by lower case id', () => {
      const { entities } = toData(FIXTURE_V2.ENTITIES)
      const usdc = FIXTURE_V2.TOKEN.usdc1

      expect(entities.tokens[usdc.id.toLowerCase()]).toEqual(usdc)
    })

    it('indexes users by lower case id', () => {
      const { entities } = toData(FIXTURE_V2.ENTITIES)
      const alice = FIXTURE_V2.USER.Alice

      expect(entities.users[alice.id.toLowerCase()]).toEqual(alice)
    })

    it('indexes accounts by lower case id', () => {
      const { entities } = toData(FIXTURE_V2.ENTITIES)
      const account = FIXTURE_V2.ACCOUNT.Testing

      expect(entities.accounts[account.id.toLowerCase()]).toEqual({
        ...lowerCaseId(account),
        assignees: ['test-alice-user-uid']
      })
    })

    it('indexes groups with members by lower case id', () => {
      const { entities } = toData(FIXTURE_V2.ENTITIES)
      const group = FIXTURE_V2.GROUP.Engineering

      expect(entities.groups[group.id.toLowerCase()]).toEqual({
        id: group.id.toLowerCase(),
        users: FIXTURE_V2.USER_GROUP_MEMBER.filter(({ groupId }) => groupId === group.id).map(({ userId }) =>
          userId.toLowerCase()
        ),
        accounts: FIXTURE_V2.ACCOUNT_GROUP_MEMBER.filter(({ groupId }) => groupId === group.id).map(({ accountId }) =>
          accountId.toLowerCase()
        )
      })
    })
  })
})