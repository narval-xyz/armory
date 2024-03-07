import { EntityData, FIXTURE } from '@narval/policy-engine-shared'
import { HttpModule } from '@nestjs/axios'
import { HttpStatus } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import nock from 'nock'
import { DataStoreException } from '../../../../../app/core/exception/data-store.exception'
import { HttpDataStoreRepository } from '../../http-data-store.repository'

describe(HttpDataStoreRepository.name, () => {
  let repository: HttpDataStoreRepository

  const dataStoreHost = 'http://some.host:3010'
  const dataStoreEndpoint = '/data-store/entities'
  const dataStoreUrl = dataStoreHost + dataStoreEndpoint

  const entityData: EntityData = {
    entity: {
      data: FIXTURE.ENTITIES
    }
  }

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [HttpDataStoreRepository]
    }).compile()

    repository = module.get<HttpDataStoreRepository>(HttpDataStoreRepository)
  })

  describe('fetch', () => {
    it('fetches data from a remote data source via http protocol', async () => {
      nock(dataStoreHost).get(dataStoreEndpoint).reply(HttpStatus.OK, entityData)

      const data = await repository.fetch(dataStoreUrl)

      expect(data).toEqual(entityData)
    })

    it('throws a DataStoreException when it fails to fetch', async () => {
      nock(dataStoreHost).get(dataStoreEndpoint).reply(HttpStatus.INTERNAL_SERVER_ERROR, {})

      await expect(() => repository.fetch(dataStoreUrl)).rejects.toThrow(DataStoreException)
    })
  })
})
