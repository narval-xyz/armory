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
import { FileSystemDataStoreRepository } from '../../../../../app/persistence/repository/file-system-data-store.repository'
import { HttpDataStoreRepository } from '../../../../../app/persistence/repository/http-data-store.repository'
import { withTempJsonFile } from '../../../../../shared/testing/with-temp-json-file.testing'
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
  })
})
