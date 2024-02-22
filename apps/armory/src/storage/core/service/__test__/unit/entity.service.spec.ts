import { Entities, FIXTURE } from '@narval/policy-engine-shared'
import { Test } from '@nestjs/testing'
import { InMemoryEntityRepository } from '../../../../persistence/repository/in-memory-entity.repository'
import { EntityValidationException } from '../../../exception/entity-validation.exception'
import { EntityRepository } from '../../../repository/entity.repository'
import { EntityService } from '../../entity.service'

describe(EntityService.name, () => {
  let service: EntityService

  const orgId = 'test-org-id'

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

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        EntityService,
        {
          provide: EntityRepository,
          useClass: InMemoryEntityRepository
        }
      ]
    }).compile()

    service = module.get<EntityService>(EntityService)
  })

  describe('put', () => {
    it('throws EntityValidationException when validation fails', async () => {
      await expect(
        service.put(orgId, {
          entities: {
            ...emptyEntities,
            userGroupMembers: [
              {
                groupId: FIXTURE.USER_GROUP.Engineering.uid,
                userId: FIXTURE.USER.Alice.uid
              }
            ],
            users: [FIXTURE.USER.Alice]
          }
        })
      ).rejects.toThrow(EntityValidationException)
    })
  })
})
