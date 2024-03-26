import {
  Action,
  Criterion,
  EntityData,
  EntitySignature,
  FIXTURE,
  PolicyData,
  PolicySignature,
  Then
} from '@narval/policy-engine-shared'
import { HttpModule } from '@nestjs/axios'
import { HttpStatus } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import nock from 'nock'
import { withTempJsonFile } from '../../../../../shared/testing/with-temp-json-file.testing'
import { FileSystemDataStoreRepository } from '../../../../persistence/repository/file-system-data-store.repository'
import { HttpDataStoreRepository } from '../../../../persistence/repository/http-data-store.repository'
import { DataStoreException } from '../../../exception/data-store.exception'
import { DataStoreRepositoryFactory } from '../../../factory/data-store-repository.factory'
import { DataStoreService } from '../../data-store.service'

describe(DataStoreService.name, () => {
  let service: DataStoreService

  const remoteDataStoreUrl = 'http://9.9.9.9:9000'

  const entityData: EntityData = {
    entity: {
      data: FIXTURE.ENTITIES
    }
  }

  const policyData: PolicyData = {
    policy: {
      data: [
        {
          then: Then.PERMIT,
          name: 'test-policy',
          when: [
            {
              criterion: Criterion.CHECK_ACTION,
              args: [Action.SIGN_TRANSACTION]
            }
          ]
        }
      ]
    }
  }

  const signatureStore: EntitySignature & PolicySignature = {
    entity: {
      signature: 'test-entity-signature'
    },
    policy: {
      signature: 'test-policy-signature'
    }
  }

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [DataStoreService, DataStoreRepositoryFactory, HttpDataStoreRepository, FileSystemDataStoreRepository]
    }).compile()

    service = module.get<DataStoreService>(DataStoreService)
  })

  describe('fetch', () => {
    it('fetches data and signature from distinct stores', async () => {
      nock(remoteDataStoreUrl).get('/entity').reply(HttpStatus.OK, entityData)
      nock(remoteDataStoreUrl).get('/policy').reply(HttpStatus.OK, policyData)

      await withTempJsonFile(JSON.stringify(signatureStore), async (path) => {
        const url = `file://${path}`
        const store = {
          entity: {
            dataUrl: `${remoteDataStoreUrl}/entity`,
            signatureUrl: url,
            keys: []
          },
          policy: {
            dataUrl: `${remoteDataStoreUrl}/policy`,
            signatureUrl: url,
            keys: []
          }
        }

        const { entity, policy } = await service.fetch(store)

        expect(entity).toEqual({
          data: entityData.entity.data,
          signature: signatureStore.entity.signature
        })
        expect(policy).toEqual({
          data: policyData.policy.data,
          signature: signatureStore.policy.signature
        })
      })
    })

    const testThrowDataStoreException = async (params: {
      store: unknown
      expect: { message: string; status: HttpStatus }
    }): Promise<void> => {
      await withTempJsonFile(JSON.stringify(params.store), async (path) => {
        const url = `file://${path}`

        expect.assertions(3)

        try {
          await service.fetch({
            entity: {
              dataUrl: url,
              signatureUrl: url,
              keys: []
            },
            policy: {
              dataUrl: url,
              signatureUrl: url,
              keys: []
            }
          })
        } catch (error) {
          expect(error).toBeInstanceOf(DataStoreException)
          expect(error.message).toEqual(params.expect.message)
          expect(error.status).toEqual(params.expect.status)
        }
      })
    }

    it('throws DataStoreException when entity schema is invalid', async () => {
      await testThrowDataStoreException({
        store: {
          entity: {
            data: ['invalid', 'schema'],
            signature: 'test-signature'
          },
          policy: {
            data: policyData.policy.data,
            signature: 'test-signature'
          }
        },
        expect: {
          message: 'Invalid store schema',
          status: HttpStatus.UNPROCESSABLE_ENTITY
        }
      })
    })

    it('throws DataStoreException when entity domain is invalid', async () => {
      const duplicateUserGroups = [
        {
          id: '1'
        },
        {
          id: '1'
        }
      ]

      await testThrowDataStoreException({
        store: {
          entity: {
            data: {
              userGroups: duplicateUserGroups,
              addressBook: [],
              credentials: [],
              tokens: [],
              userGroupMembers: [],
              userWallets: [],
              users: [],
              walletGroupMembers: [],
              walletGroups: [],
              wallets: []
            },
            signature: 'test-signature'
          },
          policy: {
            data: policyData.policy.data,
            signature: 'test-signature'
          }
        },
        expect: {
          message: 'Invalid entity domain invariant',
          status: HttpStatus.UNPROCESSABLE_ENTITY
        }
      })
    })

    it('throws DataStoreException when policy schema is invalid', async () => {
      await testThrowDataStoreException({
        store: {
          policy: {
            data: { invalid: 'schema' },
            signature: 'test-signature'
          },
          entity: {
            data: FIXTURE.ENTITIES,
            signature: 'test-signature'
          }
        },
        expect: {
          message: 'Invalid store schema',
          status: HttpStatus.UNPROCESSABLE_ENTITY
        }
      })
    })
  })
})
