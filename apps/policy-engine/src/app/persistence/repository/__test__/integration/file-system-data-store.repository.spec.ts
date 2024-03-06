import { EntityData, FIXTURE } from '@narval/policy-engine-shared'
import { Test } from '@nestjs/testing'
import { unlink, writeFile } from 'fs/promises'
import { v4 as uuid } from 'uuid'
import { DataStoreException } from '../../../../core/exception/data-store.exception'
import { FileSystemDataStoreRepository } from '../../file-system-data-store.repository'

const withTempJsonFile = async (data: string, thunk: (path: string) => Promise<void>) => {
  const path = `./test-temp-data-store-${uuid()}.json`

  await writeFile(path, data, 'utf-8')

  try {
    await thunk(path)
  } finally {
    await unlink(path)
  }
}

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
      withTempJsonFile(JSON.stringify(entityData), async (path) => {
        const data = await repository.fetch(`file:${path}`)

        expect(data).toEqual(entityData)
      })
    })

    it('throws a DataStoreException when file does not exist', async () => {
      const notFoundDataStoreUrl = 'file:./this-file-does-not-exist-in-the-file-system.json'

      await expect(() => repository.fetch(notFoundDataStoreUrl)).rejects.toThrow(DataStoreException)
    })

    it('throws a DataStoreException when the json is invalid', async () => {
      withTempJsonFile('[ invalid }', async (path: string) => {
        await expect(() => repository.fetch(`file:${path}`)).rejects.toThrow(DataStoreException)
      })
    })
  })
})
