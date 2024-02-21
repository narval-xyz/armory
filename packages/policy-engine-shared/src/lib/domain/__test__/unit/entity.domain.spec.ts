import { ADDRESS_BOOK, CREDENTIAL, TOKEN, USER, USER_GROUP, WALLET, WALLET_GROUP } from '../../../dev.fixture'
import { AccountClassification, Entities } from '../../../type/entity.type'
import { validate } from '../../entity.domain'

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
            groupId: USER_GROUP.Engineering.uid,
            userId: USER.Alice.uid
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
              "Couldn't create the user group member because the group test-engineering-user-group-uid is undefined"
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
            groupId: USER_GROUP.Engineering.uid,
            userId: USER.Alice.uid
          }
        ]
      })

      expect(result).toEqual({
        success: false,
        issues: [
          {
            code: 'ENTITY_NOT_FOUND',
            message:
              "Couldn't create the user group member for group test-engineering-user-group-uid because the user test-alice-user-uid is undefined"
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
            walletId: WALLET.Engineering.uid,
            groupId: WALLET_GROUP.Engineering.uid
          }
        ]
      })

      expect(result).toEqual({
        success: false,
        issues: [
          {
            code: 'ENTITY_NOT_FOUND',
            message:
              "Couldn't create the wallet group member because the group test-engineering-wallet-group-uid is undefined"
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
            walletId: WALLET.Engineering.uid,
            groupId: WALLET_GROUP.Engineering.uid
          }
        ]
      })

      expect(result).toEqual({
        success: false,
        issues: [
          {
            code: 'ENTITY_NOT_FOUND',
            message:
              "Couldn't create the wallet group member for group test-engineering-wallet-group-uid because the wallet eip155:eoa:0x22228d0504d4f3363a5b7fda1f5fff1c7bca8ad4 is undefined"
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
            userId: USER.Alice.uid,
            walletId: WALLET.Engineering.uid
          }
        ]
      })

      expect(result).toEqual({
        success: false,
        issues: [
          {
            code: 'ENTITY_NOT_FOUND',
            message: `Couldn't assign the wallet ${WALLET.Engineering.uid} because the user ${USER.Alice.uid} is undefined`
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
            userId: USER.Alice.uid,
            walletId: WALLET.Engineering.uid
          }
        ]
      })

      expect(result).toEqual({
        success: false,
        issues: [
          {
            code: 'ENTITY_NOT_FOUND',
            message: `Couldn't assign the wallet ${WALLET.Engineering.uid} because it's undefined`
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
            message: `The address book account ${ADDRESS_BOOK[0].uid} is duplicated`
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
            message: `The credential ${CREDENTIAL.Alice.uid} is duplicated`
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
            message: `The token ${TOKEN.usdc1.uid} is duplicated`
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
            message: `The user group ${USER_GROUP.Engineering.uid} is duplicated`
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
            message: `The user ${USER.Alice.uid} is duplicated`
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
            message: `The wallet group ${WALLET_GROUP.Engineering.uid} is duplicated`
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
            message: `The wallet ${WALLET.Engineering.uid} is duplicated`
          }
        ]
      })
    })
  })

  describe('uid format', () => {
    it('fails when address book account uid is not an account id', () => {
      const invalidAccountId = '16aba381-c54a-4f72-89bd-bd1e7c46ed29'
      const result = validate({
        ...emptyEntities,
        addressBook: [
          {
            uid: invalidAccountId,
            address: WALLET.Engineering.address,
            chainId: 137,
            classification: AccountClassification.WALLET
          },
          ADDRESS_BOOK[0]
        ]
      })

      expect(result).toEqual({
        success: false,
        issues: [
          {
            code: 'INVALID_UID_FORMAT',
            message: `address book account uid ${invalidAccountId} is not a valid account id`
          }
        ]
      })
    })

    it('fails when token uid is not an asset id', () => {
      const invalidAccountId = '16aba381-c54a-4f72-89bd-bd1e7c46ed29'
      const result = validate({
        ...emptyEntities,
        tokens: [
          {
            ...TOKEN.usdc1,
            uid: invalidAccountId
          },
          TOKEN.usdc137
        ]
      })

      expect(result).toEqual({
        success: false,
        issues: [
          {
            code: 'INVALID_UID_FORMAT',
            message: `token uid ${invalidAccountId} is not a valid asset id`
          }
        ]
      })
    })
  })
})
