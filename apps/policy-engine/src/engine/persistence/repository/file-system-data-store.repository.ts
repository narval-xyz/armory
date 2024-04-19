import { FileSource } from '@narval/policy-engine-shared'
import { HttpStatus, Injectable } from '@nestjs/common'
import fs from 'fs/promises'
import { DataStoreException } from '../../core/exception/data-store.exception'
import { DataStoreRepository } from '../../core/repository/data-store.repository'

@Injectable()
export class FileSystemDataStoreRepository implements DataStoreRepository {
  async fetch<Data>(source: FileSource): Promise<Data> {
    const path = this.getPath(source.url)

    if (await this.exists(path)) {
      return this.read(path) as Data
    }

    throw new DataStoreException({
      message: 'Data store file does not exist in the instance host',
      suggestedHttpStatusCode: HttpStatus.NOT_FOUND,
      context: { source }
    })
  }

  private async read(path: string) {
    try {
      const content = await fs.readFile(path, 'utf-8')

      return JSON.parse(content)
    } catch (error) {
      throw new DataStoreException({
        message: 'Unable to parse data store file into JSON',
        suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        origin: error
      })
    }
  }

  private async exists(path: string): Promise<boolean> {
    try {
      await fs.stat(path)

      return true
    } catch (error) {
      return false
    }
  }

  private getPath(url: string): string {
    return url.replace('file://', '')
  }
}
