import { HttpModule, LoggerModule } from '@narval/nestjs-shared'
import {
  EntityData,
  EntitySignature,
  EntityStore,
  EntityUtil,
  FIXTURE,
  PolicyData,
  PolicySignature,
  PolicyStore,
  SourceType
} from '@narval/policy-engine-shared'
import { Jwk, PublicKey, getPublicKey, privateKeyToJwk } from '@narval/signature'

import { HttpStatus } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import nock from 'nock'
import { getEntityStore, getPolicyStore, signData } from '../../../../../shared/testing/data-store.testing'
import { withTempJsonFile } from '../../../../../shared/testing/with-temp-json-file.testing'
import { FileSystemDataStoreRepository } from '../../../../persistence/repository/file-system-data-store.repository'
import { HttpDataStoreRepository } from '../../../../persistence/repository/http-data-store.repository'
import { DataStoreException } from '../../../exception/data-store.exception'
import { DataStoreRepositoryFactory } from '../../../factory/data-store-repository.factory'
import { DataStoreService } from '../../data-store.service'

const UNSAFE_PRIVATE_KEY = '0x7cfef3303797cbc7515d9ce22ffe849c701b0f2812f999b0847229c47951fca5'

describe(DataStoreService.name, () => {
  let service: DataStoreService
  let privateKey: Jwk
  let publicKey: PublicKey
  let entityStore: EntityStore
  let policyStore: PolicyStore
  let entityData: EntityData
  let policyData: PolicyData
  let signatureStore: EntitySignature & PolicySignature

  const remoteDataStoreUrl = 'http://9.9.9.9:9000'

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [HttpModule.forRoot(), LoggerModule.forTest()],
      providers: [DataStoreService, DataStoreRepositoryFactory, HttpDataStoreRepository, FileSystemDataStoreRepository]
    }).compile()

    service = module.get<DataStoreService>(DataStoreService)

    privateKey = privateKeyToJwk(UNSAFE_PRIVATE_KEY)

    publicKey = getPublicKey(privateKey)

    entityStore = await getEntityStore(FIXTURE.ENTITIES, privateKey)
    policyStore = await getPolicyStore(FIXTURE.POLICIES, privateKey)

    entityData = {
      entity: {
        data: entityStore.data
      }
    }

    policyData = {
      policy: {
        data: policyStore.data
      }
    }

    signatureStore = {
      entity: {
        signature: entityStore.signature
      },
      policy: {
        signature: policyStore.signature
      }
    }
  })

  describe('fetch', () => {
    it('fetches data and signature from distinct stores', async () => {
      nock(remoteDataStoreUrl).get('/entity').reply(HttpStatus.OK, entityData)
      nock(remoteDataStoreUrl).get('/policy').reply(HttpStatus.OK, policyData)

      await withTempJsonFile(JSON.stringify(signatureStore), async (path) => {
        const url = `file://${path}`
        const store = {
          entity: {
            data: {
              type: SourceType.HTTP,
              url: `${remoteDataStoreUrl}/entity`
            },
            signature: {
              type: SourceType.FILE,
              url
            },
            keys: [publicKey]
          },
          policy: {
            data: {
              type: SourceType.HTTP,
              url: `${remoteDataStoreUrl}/policy`
            },
            signature: {
              type: SourceType.FILE,
              url
            },
            keys: [publicKey]
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
      stores: unknown
      expect: { message: string; status: HttpStatus }
    }): Promise<void> => {
      await withTempJsonFile(JSON.stringify(params.stores), async (path) => {
        const url = `file://${path}`

        expect.assertions(3)

        try {
          await service.fetch({
            entity: {
              data: {
                type: SourceType.FILE,
                url
              },
              signature: {
                type: SourceType.FILE,
                url
              },
              keys: [publicKey]
            },
            policy: {
              data: {
                type: SourceType.FILE,
                url
              },
              signature: {
                type: SourceType.FILE,
                url
              },
              keys: [publicKey]
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
        stores: {
          entity: {
            data: ['invalid', 'schema'],
            signature: entityStore.signature
          },
          policy: policyStore
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
      const entities = {
        userGroups: duplicateUserGroups,
        addressBook: [],
        credentials: [],
        tokens: [],
        userGroupMembers: [],
        userAccounts: [],
        users: [],
        accountGroupMembers: [],
        accountGroups: [],
        accounts: []
      }

      await testThrowDataStoreException({
        stores: {
          entity: {
            data: entities,
            signature: await signData(entities, privateKey)
          },
          policy: policyStore
        },
        expect: {
          message: 'Invalid entity domain invariant',
          status: HttpStatus.UNPROCESSABLE_ENTITY
        }
      })
    })

    it('throws DataStoreException when policy schema is invalid', async () => {
      await testThrowDataStoreException({
        stores: {
          policy: {
            data: { invalid: 'schema' },
            signature: policyStore.signature
          },
          entity: entityStore
        },
        expect: {
          message: 'Invalid store schema',
          status: HttpStatus.UNPROCESSABLE_ENTITY
        }
      })
    })

    it('throws DataStoreException when entity signature is invalid', async () => {
      const entityStoreOne = await getEntityStore(FIXTURE.ENTITIES, privateKey)
      const entityStoreTwo = await getEntityStore(EntityUtil.empty(), privateKey)

      await testThrowDataStoreException({
        stores: {
          entity: {
            data: entityStoreOne.data,
            signature: entityStoreTwo.signature
          },
          policy: policyStore
        },
        expect: {
          message: 'Data signature mismatch',
          status: HttpStatus.UNAUTHORIZED
        }
      })
    })

    it('throws DataStoreException when policy signature is invalid', async () => {
      const policyStoreOne = await getPolicyStore(FIXTURE.POLICIES, privateKey)
      const policyStoreTwo = await getPolicyStore([], privateKey)

      await testThrowDataStoreException({
        stores: {
          policy: {
            data: policyStoreOne.data,
            signature: policyStoreTwo.signature
          },
          entity: entityStore
        },
        expect: {
          message: 'Data signature mismatch',
          status: HttpStatus.UNAUTHORIZED
        }
      })
    })
  })

  describe('verifySignature', () => {
    // WARN: The Jest error equality doesn't check custom properties of errors
    // like `suggestedHttpStatusCode` from ApplicationException.

    it('returns error when jwk is not found', async () => {
      const verification = await service.verifySignature({
        data: entityStore.data,
        signature: entityStore.signature,
        keys: []
      })

      expect(verification).toEqual({
        success: false,
        error: new DataStoreException({
          message: 'JWK not found',
          suggestedHttpStatusCode: HttpStatus.NOT_FOUND
        })
      })
    })

    it('returns error when signature mismatch', async () => {
      const entityStoreOne = await getEntityStore(FIXTURE.ENTITIES, privateKey)
      const entityStoreTwo = await getEntityStore(EntityUtil.empty(), privateKey)

      const verification = await service.verifySignature({
        data: entityStoreOne.data,
        signature: entityStoreTwo.signature,
        keys: [publicKey]
      })

      expect(verification).toEqual({
        success: false,
        error: new DataStoreException({
          message: 'Data signature mismatch',
          suggestedHttpStatusCode: HttpStatus.UNAUTHORIZED
        })
      })
    })

    it('returns error when jwt verification fails', async () => {
      const verification = await service.verifySignature({
        data: entityStore.data,
        signature: 'invalid-signature',
        keys: [publicKey]
      })

      expect(verification).toEqual({
        success: false,
        error: new DataStoreException({
          message: 'Invalid signature',
          suggestedHttpStatusCode: HttpStatus.UNAUTHORIZED
        })
      })
    })

    it('returns success when signature is valid', async () => {
      const verification = await service.verifySignature({
        data: entityStore.data,
        signature: entityStore.signature,
        keys: [publicKey]
      })

      expect(verification).toEqual({ success: true })
    })
  })
})
