import { HttpModule, LoggerModule } from '@narval/nestjs-shared'
import { EntityData, FIXTURE, HttpSource, SourceType } from '@narval/policy-engine-shared'
import { HttpStatus } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import nock from 'nock'
import { DataStoreException } from '../../../../core/exception/data-store.exception'
import { HttpDataStoreRepository } from '../../http-data-store.repository'

describe(HttpDataStoreRepository.name, () => {
  let repository: HttpDataStoreRepository

  const dataStoreHost = 'http://some.host:3010'
  const dataStoreEndpoint = '/data-store/entities'
  const source: HttpSource = {
    type: SourceType.HTTP,
    url: dataStoreHost + dataStoreEndpoint
  }

  const entityData: EntityData = {
    entity: {
      data: FIXTURE.ENTITIES
    }
  }

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [HttpModule.forRoot(), LoggerModule.forTest()],
      providers: [HttpDataStoreRepository]
    }).compile()

    repository = module.get<HttpDataStoreRepository>(HttpDataStoreRepository)
  })

  describe('fetch', () => {
    it('fetches data from a remote data source via http protocol', async () => {
      nock(dataStoreHost).get(dataStoreEndpoint).reply(HttpStatus.OK, entityData)

      const data = await repository.fetch(source)

      expect(data).toEqual(entityData)
    })

    it('throws a DataStoreException when it fails to fetch', async () => {
      nock(dataStoreHost).get(dataStoreEndpoint).times(4).reply(HttpStatus.INTERNAL_SERVER_ERROR, {})

      await expect(() => repository.fetch(source)).rejects.toThrow(DataStoreException)
    })

    it('retries 3 times and fail on the 4th attempt', async () => {
      nock(dataStoreHost)
        .get(dataStoreEndpoint)
        .times(3)
        .reply(HttpStatus.INTERNAL_SERVER_ERROR, {})
        .get(dataStoreEndpoint)
        .reply(HttpStatus.INTERNAL_SERVER_ERROR, {})

      await expect(() => repository.fetch(source)).rejects.toThrow(DataStoreException)
    })

    it('succeeds on the 2nd retry', async () => {
      nock(dataStoreHost)
        .get(dataStoreEndpoint)
        .reply(HttpStatus.INTERNAL_SERVER_ERROR, {})
        .get(dataStoreEndpoint)
        .reply(HttpStatus.OK, entityData)

      const data = await repository.fetch(source)

      expect(data).toEqual(entityData)
    })
  })
})
