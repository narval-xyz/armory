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
    userWallets: [],
    users: [],
    walletGroupMembers: [],
    walletGroups: [],
    wallets: []
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

    it('fails when group from wallet group member does not exist', () => {
      const result = validate({
        ...emptyEntities,
        wallets: [WALLET.Engineering],
        walletGroupMembers: [
          {
            walletId: WALLET.Engineering.id,
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
              "couldn't create the wallet group member because the group test-engineering-wallet-group-uid is undefined"
          }
        ]
      })
    })

    it('fails when wallet from wallet group member does not exist', () => {
      const result = validate({
        ...emptyEntities,
        walletGroups: [WALLET_GROUP.Engineering],
        walletGroupMembers: [
          {
            walletId: WALLET.Engineering.id,
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
              "couldn't create the wallet group member for group test-engineering-wallet-group-uid because the wallet eip155:eoa:0x22228d0504d4f3363a5b7fda1f5fff1c7bca8ad4 is undefined"
          }
        ]
      })
    })

    it('fails when user from user wallet does not exist', () => {
      const result = validate({
        ...emptyEntities,
        wallets: [WALLET.Engineering],
        userWallets: [
          {
            userId: USER.Alice.id,
            walletId: WALLET.Engineering.id
          }
        ]
      })

      expect(result).toEqual({
        success: false,
        issues: [
          {
            code: 'ENTITY_NOT_FOUND',
            message: `couldn't assign the wallet ${WALLET.Engineering.id} because the user ${USER.Alice.id} is undefined`
          }
        ]
      })
    })

    it('fails when wallet from user wallet does not exist', () => {
      const result = validate({
        ...emptyEntities,
        users: [USER.Alice],
        userWallets: [
          {
            userId: USER.Alice.id,
            walletId: WALLET.Engineering.id
          }
        ]
      })

      expect(result).toEqual({
        success: false,
        issues: [
          {
            code: 'ENTITY_NOT_FOUND',
            message: `couldn't assign the wallet ${WALLET.Engineering.id} because it's undefined`
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

    it('fails when wallet group uids are not unique', () => {
      const result = validate({
        ...emptyEntities,
        walletGroups: [WALLET_GROUP.Engineering, WALLET_GROUP.Engineering, WALLET_GROUP.Treasury]
      })

      expect(result).toEqual({
        success: false,
        issues: [
          {
            code: 'UNIQUE_IDENTIFIER_DUPLICATION',
            message: `the wallet group ${WALLET_GROUP.Engineering.id} is duplicated`
          }
        ]
      })
    })

    it('fails when wallets uids are not unique', () => {
      const result = validate({
        ...emptyEntities,
        wallets: [WALLET.Engineering, WALLET.Engineering, WALLET.Treasury]
      })

      expect(result).toEqual({
        success: false,
        issues: [
          {
            code: 'UNIQUE_IDENTIFIER_DUPLICATION',
            message: `the wallet ${WALLET.Engineering.id} is duplicated`
          }
        ]
      })
    })
  })
})
