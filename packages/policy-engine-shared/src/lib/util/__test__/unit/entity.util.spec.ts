import { ADDRESS_BOOK, CREDENTIAL, TOKEN, USER, USER_GROUP, WALLET, WALLET_GROUP } from '../../../dev.fixture'
import { Entities } from '../../../type/entity.type'
import { validate } from '../../entity.util'

describe('validate', () => {
  const emptyEntities: Entities = {
    addressBook: [],
    credentials: [],
    tokens: [],
    userGroupMembers: [],
    userGroups: [],
    userAccounts: [],
    users: [],
    accountGroupMembers: [],
    accountGroups: [],
    accounts: []
  }

  describe('association integrity', () => {
    it('fails when group from user group member does not exist', () => {
      const result = validate({
        ...emptyEntities,
        userGroupMembers: [
          {
            groupId: USER_GROUP.Engineering.id,
            userId: USER.Alice.id
          }
        ],
        users: [USER.Alice]
      })

      expect(result).toEqual({
        success: false,
        issues: [
          {
            code: 'ENTITY_NOT_FOUND',
            message:
              "couldn't create the user group member because the group test-engineering-user-group-uid is undefined"
          }
        ]
      })
    })

    it('fails when user from user group member does not exist', () => {
      const result = validate({
        ...emptyEntities,
        userGroups: [USER_GROUP.Engineering],
        userGroupMembers: [
          {
            groupId: USER_GROUP.Engineering.id,
            userId: USER.Alice.id
          }
        ]
      })

      expect(result).toEqual({
        success: false,
        issues: [
          {
            code: 'ENTITY_NOT_FOUND',
            message:
              "couldn't create the user group member for group test-engineering-user-group-uid because the user test-alice-user-uid is undefined"
          }
        ]
      })
    })

    it('fails when group from account group member does not exist', () => {
      const result = validate({
        ...emptyEntities,
        accounts: [WALLET.Engineering],
        accountGroupMembers: [
          {
            accountId: WALLET.Engineering.id,
            groupId: WALLET_GROUP.Engineering.id
          }
        ]
      })

      expect(result).toEqual({
        success: false,
        issues: [
          {
            code: 'ENTITY_NOT_FOUND',
            message:
              "couldn't create the account group member because the group test-engineering-account-group-uid is undefined"
          }
        ]
      })
    })

    it('fails when account from account group member does not exist', () => {
      const result = validate({
        ...emptyEntities,
        accountGroups: [WALLET_GROUP.Engineering],
        accountGroupMembers: [
          {
            accountId: WALLET.Engineering.id,
            groupId: WALLET_GROUP.Engineering.id
          }
        ]
      })

      expect(result).toEqual({
        success: false,
        issues: [
          {
            code: 'ENTITY_NOT_FOUND',
            message:
              "couldn't create the account group member for group test-engineering-account-group-uid because the account eip155:eoa:0x9f38879167acCf7401351027EE3f9247A71cd0c5 is undefined"
          }
        ]
      })
    })

    it('fails when user from user account does not exist', () => {
      const result = validate({
        ...emptyEntities,
        accounts: [WALLET.Engineering],
        userAccounts: [
          {
            userId: USER.Alice.id,
            accountId: WALLET.Engineering.id
          }
        ]
      })

      expect(result).toEqual({
        success: false,
        issues: [
          {
            code: 'ENTITY_NOT_FOUND',
            message: `couldn't assign the account ${WALLET.Engineering.id} because the user ${USER.Alice.id} is undefined`
          }
        ]
      })
    })

    it('fails when account from user account does not exist', () => {
      const result = validate({
        ...emptyEntities,
        users: [USER.Alice],
        userAccounts: [
          {
            userId: USER.Alice.id,
            accountId: WALLET.Engineering.id
          }
        ]
      })

      expect(result).toEqual({
        success: false,
        issues: [
          {
            code: 'ENTITY_NOT_FOUND',
            message: `couldn't assign the account ${WALLET.Engineering.id} because it's undefined`
          }
        ]
      })
    })
  })

  describe('uids duplication', () => {
    it('fails when address book uids are not unique', () => {
      const result = validate({
        ...emptyEntities,
        addressBook: [ADDRESS_BOOK[0], ADDRESS_BOOK[0], ADDRESS_BOOK[1]]
      })

      expect(result).toEqual({
        success: false,
        issues: [
          {
            code: 'UNIQUE_IDENTIFIER_DUPLICATION',
            message: `the address book account ${ADDRESS_BOOK[0].id} is duplicated`
          }
        ]
      })
    })

    it('fails when credential uids are not unique', () => {
      const result = validate({
        ...emptyEntities,
        credentials: [CREDENTIAL.Alice, CREDENTIAL.Alice, CREDENTIAL.Bob]
      })

      expect(result).toEqual({
        success: false,
        issues: [
          {
            code: 'UNIQUE_IDENTIFIER_DUPLICATION',
            message: `the credential ${CREDENTIAL.Alice.id} is duplicated`
          }
        ]
      })
    })

    it('fails when token uids are not unique', () => {
      const result = validate({
        ...emptyEntities,
        tokens: [TOKEN.usdc1, TOKEN.usdc1, TOKEN.usdc137]
      })

      expect(result).toEqual({
        success: false,
        issues: [
          {
            code: 'UNIQUE_IDENTIFIER_DUPLICATION',
            message: `the token ${TOKEN.usdc1.id} is duplicated`
          }
        ]
      })
    })

    it('fails when user group uids are not unique', () => {
      const result = validate({
        ...emptyEntities,
        userGroups: [USER_GROUP.Engineering, USER_GROUP.Engineering, USER_GROUP.Treasury]
      })

      expect(result).toEqual({
        success: false,
        issues: [
          {
            code: 'UNIQUE_IDENTIFIER_DUPLICATION',
            message: `the user group ${USER_GROUP.Engineering.id} is duplicated`
          }
        ]
      })
    })

    it('fails when users uids are not unique', () => {
      const result = validate({
        ...emptyEntities,
        users: [USER.Alice, USER.Alice, USER.Bob]
      })

      expect(result).toEqual({
        success: false,
        issues: [
          {
            code: 'UNIQUE_IDENTIFIER_DUPLICATION',
            message: `the user ${USER.Alice.id} is duplicated`
          }
        ]
      })
    })

    it('fails when account group uids are not unique', () => {
      const result = validate({
        ...emptyEntities,
        accountGroups: [WALLET_GROUP.Engineering, WALLET_GROUP.Engineering, WALLET_GROUP.Treasury]
      })

      expect(result).toEqual({
        success: false,
        issues: [
          {
            code: 'UNIQUE_IDENTIFIER_DUPLICATION',
            message: `the account group ${WALLET_GROUP.Engineering.id} is duplicated`
          }
        ]
      })
    })

    it('fails when accounts uids are not unique', () => {
      const result = validate({
        ...emptyEntities,
        accounts: [WALLET.Engineering, WALLET.Engineering, WALLET.Treasury]
      })

      expect(result).toEqual({
        success: false,
        issues: [
          {
            code: 'UNIQUE_IDENTIFIER_DUPLICATION',
            message: `the account ${WALLET.Engineering.id} is duplicated`
          }
        ]
      })
    })
  })
})
