import { FIXTURE_V1 } from '@narval/policy-engine-shared';
import { toData } from '../../data-preparation.v1';
describe('toData', () => {
  describe('entities', () => {
    const lowerCaseId = <T extends { id: string }>(value: T) => ({ ...value, id: value.id.toLowerCase() })

    it('indexes address book accounts by lower case id', () => {
      const { entities } = toData(FIXTURE_V1.ENTITIES)
      const firstAccount = FIXTURE_V1.ADDRESS_BOOK[0]

      expect(entities.addressBook[firstAccount.id.toLowerCase()]).toEqual(lowerCaseId(firstAccount))
    })

    it('indexes tokens by lower case id', () => {
      const { entities } = toData(FIXTURE_V1.ENTITIES)
      const usdc = FIXTURE_V1.TOKEN.usdc1

      expect(entities.tokens[usdc.id.toLowerCase()]).toEqual(usdc)
    })

    it('indexes users by lower case id', () => {
      const { entities } = toData(FIXTURE_V1.ENTITIES)
      const alice = FIXTURE_V1.USER.Alice

      expect(entities.users[alice.id.toLowerCase()]).toEqual(alice)
    })

    it('indexes accounts by lower case id', () => {
      const { entities } = toData(FIXTURE_V1.ENTITIES)
      const account = FIXTURE_V1.ACCOUNT.Testing

      expect(entities.accounts[account.id.toLowerCase()]).toEqual({
        ...lowerCaseId(account),
        assignees: ['test-alice-user-uid']
      })
    })

    it('indexes user groups with members by lower case id', () => {
      const { entities } = toData(FIXTURE_V1.ENTITIES)
      const group = FIXTURE_V1.USER_GROUP.Engineering

      expect(entities.userGroups[group.id.toLowerCase()]).toEqual({
        id: group.id.toLowerCase(),
        users: FIXTURE_V1.USER_GROUP_MEMBER.filter(({ groupId }) => groupId === group.id).map(({ userId }) =>
          userId.toLowerCase()
        )
      })
    })

    it('indexes account groups with members by lower case id', () => {
      const { entities } = toData(FIXTURE_V1.ENTITIES)
      const group = FIXTURE_V1.ACCOUNT_GROUP.Treasury

      expect(entities.accountGroups[group.id.toLowerCase()]).toEqual({
        id: group.id.toLowerCase(),
        accounts: FIXTURE_V1.ACCOUNT_GROUP_MEMBER.filter(({ groupId }) => groupId === group.id).map(({ accountId }) =>
          accountId.toLowerCase()
        )
      })
    })
  })
})