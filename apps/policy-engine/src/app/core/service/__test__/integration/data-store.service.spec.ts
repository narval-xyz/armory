import { DataStoreConfiguration, EntityData, EntitySignature, FIXTURE } from '@narval/policy-engine-shared'
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

  const entityDataStore: EntityData = {
    entity: {
      data: FIXTURE.ENTITIES
    }
  }

  const entitySignatureStore: EntitySignature = {
    entity: {
      signature: 'test-signature'
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
      nock(remoteDataStoreUrl).get('/').reply(HttpStatus.OK, entityDataStore)

      await withTempJsonFile(JSON.stringify(entitySignatureStore), async (path) => {
        const url = `file://${path}`
        const config: DataStoreConfiguration = {
          dataUrl: remoteDataStoreUrl,
          signatureUrl: url,
          keys: []
        }

        const { entity } = await service.fetch(config)

        expect(entity.data).toEqual(entityDataStore.entity.data)
        expect(entity.signature).toEqual(entitySignatureStore.entity.signature)
      })
    })
  })
})
