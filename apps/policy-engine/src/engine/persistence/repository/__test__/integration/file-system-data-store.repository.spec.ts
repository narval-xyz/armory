import { EntityData, FIXTURE, FileSource, SourceType } from '@narval/policy-engine-shared'
import { Test } from '@nestjs/testing'
import { withTempJsonFile } from '../../../../../shared/testing/with-temp-json-file.testing'
import { DataStoreException } from '../../../../core/exception/data-store.exception'
import { FileSystemDataStoreRepository } from '../../file-system-data-store.repository'

describe(FileSystemDataStoreRepository.name, () => {
  let repository: FileSystemDataStoreRepository

  const entityData: EntityData = {
    entity: {
      data: FIXTURE.ENTITIES
    }
  }

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [FileSystemDataStoreRepository]
    }).compile()

    repository = module.get<FileSystemDataStoreRepository>(FileSystemDataStoreRepository)
  })

  describe('fetch', () => {
    it('fetches data from a data source in the local file system', async () => {
      await withTempJsonFile(JSON.stringify(entityData), async (path) => {
        const source: FileSource = {
          type: SourceType.FILE,
          url: `file://${path}`
        }
        const data = await repository.fetch(source)

        expect(data).toEqual(entityData)
      })
    })

    it('throws a DataStoreException when file does not exist', async () => {
      const notFoundDataStoreUrl = 'file://./this-file-does-not-exist-in-the-file-system.json'

      const source: FileSource = {
        type: SourceType.FILE,
        url: notFoundDataStoreUrl
      }

      await expect(() => repository.fetch(source)).rejects.toThrow(DataStoreException)
    })

    it('throws a DataStoreException when the json is invalid', async () => {
      await withTempJsonFile('[ invalid }', async (path: string) => {
        const source: FileSource = {
          type: SourceType.FILE,
          url: `file://${path}`
        }
        await expect(() => repository.fetch(source)).rejects.toThrow(DataStoreException)
      })
    })
  })
})
