import { SourceType } from '@narval/policy-engine-shared'
import { HttpStatus, Injectable } from '@nestjs/common'
import { FileSystemDataStoreRepository } from '../../persistence/repository/file-system-data-store.repository'
import { HttpDataStoreRepository } from '../../persistence/repository/http-data-store.repository'
import { DataStoreException } from '../exception/data-store.exception'
import { DataStoreRepository } from '../repository/data-store.repository'

@Injectable()
export class DataStoreRepositoryFactory {
  constructor(
    private fileSystemRepository: FileSystemDataStoreRepository,
    private httpRepository: HttpDataStoreRepository
  ) {}

  getRepository(type: SourceType): DataStoreRepository {
    switch (type) {
      case SourceType.FILE:
        return this.fileSystemRepository
      case SourceType.HTTP:
      case SourceType.HTTPS:
        return this.httpRepository
      default:
        throw new DataStoreException({
          message: 'Data store URL protocol not supported',
          suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          context: { type }
        })
    }
  }
}
