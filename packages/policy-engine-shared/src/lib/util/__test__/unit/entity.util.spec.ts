import { ACCOUNT, ADDRESS_BOOK, CREDENTIAL, GROUP, TOKEN, USER } from '../../../dev.fixture'
import { Entities, UserEntity, UserRole } from '../../../type/entity.type'
import { empty, updateUserAccounts, validate } from '../../entity.util'

describe('validate', () => {
  const emptyEntities: Entities = {
    addressBook: [],
    credentials: [],
    tokens: [],
    userGroupMembers: [],
    userAccounts: [],
    users: [],
    accountGroupMembers: [],
    groups: [],
    userGroups: [],
    accountGroups: [],
    accounts: []
  }

  describe('association integrity', () => {
    it('fails when group from user group member does not exist', () => {
      const result = validate({
        ...emptyEntities,
        userGroupMembers: [
          {
            groupId: GROUP.Engineering.id,
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
            message: "couldn't create the user group member because the group test-engineering-group-uid is undefined",
            severity: 'error'
          },
          {
            code: 'DEPRECATED_ENTITY',
            message:
              "user group member is deprecated. Please move user group member 'test-alice-user-uid' to group member entity",
            severity: 'warning'
          }
        ]
      })
    })

    it('fails when user from user group member does not exist', () => {
      const result = validate({
        ...emptyEntities,
        userGroups: [GROUP.Engineering],
        userGroupMembers: [
          {
            groupId: GROUP.Engineering.id,
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
              "couldn't create the user group member for group test-engineering-group-uid because the user test-alice-user-uid is undefined",
            severity: 'error'
          },
          {
            code: 'DEPRECATED_ENTITY',
            message: "user group is deprecated. Please move user group 'test-engineering-group-uid' to group entity",
            severity: 'warning'
          },
          {
            code: 'DEPRECATED_ENTITY',
            message:
              "user group member is deprecated. Please move user group member 'test-alice-user-uid' to group member entity",
            severity: 'warning'
          }
        ]
      })
    })

    it('fails when group from account group member does not exist', () => {
      const result = validate({
        ...emptyEntities,
        accounts: [ACCOUNT.Engineering],
        accountGroupMembers: [
          {
            accountId: ACCOUNT.Engineering.id,
            groupId: GROUP.Engineering.id
          }
        ]
      })

      expect(result).toEqual({
        success: false,
        issues: [
          {
            code: 'ENTITY_NOT_FOUND',
            message:
              "couldn't create the account group member because the group test-engineering-group-uid is undefined",
            severity: 'error'
          },
          {
            code: 'DEPRECATED_ENTITY',
            message:
              "account group member is deprecated. Please move account group member 'eip155:eoa:0x9f38879167acCf7401351027EE3f9247A71cd0c5' to group member entity",
            severity: 'warning'
          }
        ]
      })
    })

    it('fails when account from account group member does not exist', () => {
      const result = validate({
        ...emptyEntities,
        accountGroups: [GROUP.Engineering],
        accountGroupMembers: [
          {
            accountId: ACCOUNT.Engineering.id,
            groupId: GROUP.Engineering.id
          }
        ]
      })

      expect(result).toEqual({
        success: false,
        issues: [
          {
            code: 'ENTITY_NOT_FOUND',
            message:
              "couldn't create the account group member for group test-engineering-group-uid because the account eip155:eoa:0x9f38879167acCf7401351027EE3f9247A71cd0c5 is undefined",
            severity: 'error'
          },
          {
            code: 'DEPRECATED_ENTITY',
            message:
              "account group is deprecated. Please move account group 'test-engineering-group-uid' to group entity",
            severity: 'warning'
          },
          {
            code: 'DEPRECATED_ENTITY',
            message:
              "account group member is deprecated. Please move account group member 'eip155:eoa:0x9f38879167acCf7401351027EE3f9247A71cd0c5' to group member entity",
            severity: 'warning'
          }
        ]
      })
    })

    it('fails when user from group does not exist', () => {
      const result = validate({
        ...emptyEntities,
        groups: [GROUP.Engineering],
        groupMembers: [
          {
            groupId: GROUP.Engineering.id,
            userId: USER.Alice.id,
            type: 'user'
          }
        ]
      })

      expect(result).toEqual({
        success: false,
        issues: [
          {
            code: 'ENTITY_NOT_FOUND',
            message:
              "couldn't create the user group member for group test-engineering-group-uid because the user test-alice-user-uid is undefined",
            severity: 'error'
          }
        ]
      })
    })

    it('fails when account from group does not exist', () => {
      const result = validate({
        ...emptyEntities,
        groups: [GROUP.Engineering],
        groupMembers: [
          {
            groupId: GROUP.Engineering.id,
            accountId: ACCOUNT.Engineering.id,
            type: 'account'
          }
        ]
      })

      expect(result).toEqual({
        success: false,
        issues: [
          {
            code: 'ENTITY_NOT_FOUND',
            message:
              "couldn't create the account group member for group test-engineering-group-uid because the account eip155:eoa:0x9f38879167acCf7401351027EE3f9247A71cd0c5 is undefined",
            severity: 'error'
          }
        ]
      })
    })

    it('fails when group from user group membership does not exist', () => {
      const result = validate({
        ...emptyEntities,
        userGroups: [GROUP.Engineering],
        userGroupMembers: [
          {
            groupId: GROUP.Engineering.id,
            userId: USER.Alice.id
          }
        ]
      })

      expect(result).toEqual({
        success: false,
        issues: [
          {
            code: 'ENTITY_NOT_FOUND',
            message: `couldn't create the user group member for group test-engineering-group-uid because the user test-alice-user-uid is undefined`,
            severity: 'error'
          },
          {
            code: 'DEPRECATED_ENTITY',
            message: "user group is deprecated. Please move user group 'test-engineering-group-uid' to group entity",
            severity: 'warning'
          },
          {
            code: 'DEPRECATED_ENTITY',
            message:
              "user group member is deprecated. Please move user group member 'test-alice-user-uid' to group member entity",
            severity: 'warning'
          }
        ]
      })
    })

    it('fails when group from account group membership does not exist', () => {
      const result = validate({
        ...emptyEntities,
        accountGroups: [GROUP.Engineering],
        accountGroupMembers: [
          {
            groupId: GROUP.Engineering.id,
            accountId: ACCOUNT.Engineering.id
          }
        ]
      })

      expect(result).toEqual({
        success: false,
        issues: [
          {
            code: 'ENTITY_NOT_FOUND',
            message: `couldn't create the account group member for group test-engineering-group-uid because the account eip155:eoa:0x9f38879167acCf7401351027EE3f9247A71cd0c5 is undefined`,
            severity: 'error'
          },
          {
            code: 'DEPRECATED_ENTITY',
            message:
              "account group is deprecated. Please move account group 'test-engineering-group-uid' to group entity",
            severity: 'warning'
          },
          {
            code: 'DEPRECATED_ENTITY',
            message:
              "account group member is deprecated. Please move account group member 'eip155:eoa:0x9f38879167acCf7401351027EE3f9247A71cd0c5' to group member entity",
            severity: 'warning'
          }
        ]
      })
    })

    it('fails when user from user account does not exist', () => {
      const result = validate({
        ...emptyEntities,
        accounts: [ACCOUNT.Engineering],
        userAccounts: [
          {
            userId: USER.Alice.id,
            accountId: ACCOUNT.Engineering.id
          }
        ]
      })

      expect(result).toEqual({
        success: false,
        issues: [
          {
            code: 'ENTITY_NOT_FOUND',
            message: `couldn't assign the account ${ACCOUNT.Engineering.id} because the user ${USER.Alice.id} is undefined`,
            severity: 'error'
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
            accountId: ACCOUNT.Engineering.id
          }
        ]
      })

      expect(result).toEqual({
        success: false,
        issues: [
          {
            code: 'ENTITY_NOT_FOUND',
            message: `couldn't assign the account ${ACCOUNT.Engineering.id} because it's undefined`,
            severity: 'error'
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
            message: `the address book account ${ADDRESS_BOOK[0].id} is duplicated`,
            severity: 'error'
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
            message: `the credential ${CREDENTIAL.Alice.id} is duplicated`,
            severity: 'error'
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
            message: `the token ${TOKEN.usdc1.id} is duplicated`,
            severity: 'error'
          }
        ]
      })
    })

    it('fails when user group uids are not unique', () => {
      const result = validate({
        ...emptyEntities,
        groups: [GROUP.Engineering, GROUP.Engineering, GROUP.Treasury]
      })

      expect(result).toEqual({
        success: false,
        issues: [
          {
            code: 'UNIQUE_IDENTIFIER_DUPLICATION',
            message: `the group ${GROUP.Engineering.id} is duplicated`,
            severity: 'error'
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
            message: `the user ${USER.Alice.id} is duplicated`,
            severity: 'error'
          }
        ]
      })
    })

    it('fails when group uids are not unique', () => {
      const result = validate({
        ...emptyEntities,
        groups: [GROUP.Engineering, GROUP.Engineering, GROUP.Treasury]
      })

      expect(result).toEqual({
        success: false,
        issues: [
          {
            code: 'UNIQUE_IDENTIFIER_DUPLICATION',
            message: `the group ${GROUP.Engineering.id} is duplicated`,
            severity: 'error'
          }
        ]
      })
    })

    it('fails when accounts uids are not unique', () => {
      const result = validate({
        ...emptyEntities,
        accounts: [ACCOUNT.Engineering, ACCOUNT.Engineering, ACCOUNT.Treasury]
      })

      expect(result).toEqual({
        success: false,
        issues: [
          {
            code: 'UNIQUE_IDENTIFIER_DUPLICATION',
            message: `the account ${ACCOUNT.Engineering.id} is duplicated`,
            severity: 'error'
          }
        ]
      })
    })

    it('warns when using deprecated groups', () => {
      const result = validate({
        ...emptyEntities,
        accountGroups: [{ id: 'old-data' }],
        userGroups: [{ id: 'deprecated-data' }]
      })

      expect(result).toEqual({
        success: true,
        issues: [
          {
            code: 'DEPRECATED_ENTITY',
            message: `user group is deprecated. Please move user group 'deprecated-data' to group entity`,
            severity: 'warning'
          },
          {
            code: 'DEPRECATED_ENTITY',
            message: `account group is deprecated. Please move account group 'old-data' to group entity`,
            severity: 'warning'
          }
        ]
      })
    })
  })
})

describe('updateUserAccounts', () => {
  const user: UserEntity = {
    id: 'test-user-id-one',
    role: UserRole.MEMBER
  }

  const userAccountOne = {
    userId: user.id,
    accountId: 'test-account-id-one'
  }

  const userAccountTwo = {
    userId: user.id,
    accountId: 'test-account-id-two'
  }

  const anotherUserAccount = {
    userId: 'test-user-id-two',
    accountId: 'test-account-id-one'
  }

  it('adds user accounts', () => {
    const entities = updateUserAccounts(
      {
        ...empty(),
        users: [user],
        userAccounts: [anotherUserAccount]
      },
      user,
      [userAccountOne, userAccountTwo]
    )

    expect(entities.userAccounts).toEqual([anotherUserAccount, userAccountOne, userAccountTwo])
  })

  it('removes user accounts not present in the given array', () => {
    const entities = updateUserAccounts(
      {
        ...empty(),
        users: [user],
        userAccounts: [userAccountOne, userAccountTwo, anotherUserAccount]
      },
      user,
      [userAccountOne]
    )

    expect(entities.userAccounts).toEqual([anotherUserAccount, userAccountOne])
  })

  it('removes user accounts when given an empty array', () => {
    const entities = updateUserAccounts(
      {
        ...empty(),
        users: [user],
        userAccounts: [userAccountOne, userAccountTwo, anotherUserAccount]
      },
      user,
      []
    )

    expect(entities.userAccounts).toEqual([anotherUserAccount])
  })
})
