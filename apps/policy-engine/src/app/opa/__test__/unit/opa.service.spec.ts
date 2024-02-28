import { FIXTURE } from '@narval/policy-engine-shared'
import { Test } from '@nestjs/testing'
import { mock } from 'jest-mock-extended'
import { EntityRepository } from '../../../persistence/repository/entity.repository'
import { OpaService } from '../../opa.service'

describe(OpaService.name, () => {
  let service: OpaService

  const addressBookAccountOne = FIXTURE.ADDRESS_BOOK[0]
  const addressBookAccountTwo = FIXTURE.ADDRESS_BOOK[1]

  const tokenOne = FIXTURE.TOKEN.usdc1
  const tokenTwo = FIXTURE.TOKEN.usdc137

  const userGroupOne = FIXTURE.USER_GROUP.Engineering
  const userGroupTwo = FIXTURE.USER_GROUP.Treasury

  const userOne = FIXTURE.USER.Alice
  const userTwo = FIXTURE.USER.Bob

  const walletOne = FIXTURE.WALLET.Engineering
  const walletTwo = FIXTURE.WALLET.Testing

  const walletGroupOne = FIXTURE.WALLET_GROUP.Engineering
  const walletGroupTwo = FIXTURE.WALLET_GROUP.Treasury

  beforeEach(async () => {
    const entityRepositoryMock = mock<EntityRepository>()
    entityRepositoryMock.fetch.mockResolvedValue({
      addressBook: [addressBookAccountOne, addressBookAccountTwo],
      credentials: [],
      tokens: [tokenOne, tokenTwo],
      userGroupMembers: [
        {
          userId: userOne.uid,
          groupId: userGroupOne.uid
        }
      ],
      userGroups: [userGroupOne, userGroupTwo],
      userWallets: [],
      users: [userOne, userTwo],
      walletGroupMembers: [
        {
          walletId: walletOne.uid,
          groupId: walletGroupOne.uid
        }
      ],
      walletGroups: [walletGroupOne, walletGroupTwo],
      wallets: [walletOne, walletTwo]
    })

    const module = await Test.createTestingModule({
      providers: [
        OpaService,
        {
          provide: EntityRepository,
          useValue: entityRepositoryMock
        }
      ]
    }).compile()

    service = module.get<OpaService>(OpaService)
  })

  describe('fetchEntityData', () => {
    it('resolves with data formated for the engine', async () => {
      const data = await service.fetchEntityData()

      expect(data).toEqual({
        entities: {
          addressBook: {
            [addressBookAccountOne.uid]: addressBookAccountOne,
            [addressBookAccountTwo.uid]: addressBookAccountTwo
          },
          tokens: {
            [tokenOne.uid]: tokenOne,
            [tokenTwo.uid]: tokenTwo
          },
          userGroups: {
            [userGroupOne.uid]: {
              uid: userGroupOne.uid,
              users: [userOne.uid]
            }
          },
          users: {
            [userOne.uid]: userOne,
            [userTwo.uid]: userTwo
          },
          walletGroups: {
            [walletGroupOne.uid]: {
              uid: walletGroupOne.uid,
              wallets: [walletOne.uid]
            }
          },
          wallets: {
            [walletOne.uid]: walletOne,
            [walletTwo.uid]: walletTwo
          }
        }
      })
    })
  })
})
