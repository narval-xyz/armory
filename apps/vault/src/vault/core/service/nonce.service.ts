import { Injectable } from '@nestjs/common'
import { KeyMetadata } from '../../../shared/module/key-value/core/repository/key-value.repository'
import { KeyValueService } from '../../../shared/module/key-value/core/service/key-value.service'
import { Collection } from '../../../shared/type/domain.type'

@Injectable()
export class NonceService {
  private readonly KEY_PREFIX = Collection.REQUEST_NONCE

  constructor(private keyValuService: KeyValueService) {}

  async save(clientId: string, nonce: string): Promise<boolean> {
    await this.keyValuService.set(this.getKey(clientId, nonce), '1', this.getMetadata(clientId))

    return true
  }

  async exist(clientId: string, nonce: string): Promise<boolean> {
    const value = await this.keyValuService.get(this.getKey(clientId, nonce))

    if (value) {
      return true
    }

    return false
  }

  private getMetadata(clientId: string): KeyMetadata {
    return {
      clientId,
      collection: this.KEY_PREFIX
    }
  }

  private getKey(clientId: string, nonce: string): string {
    return `${this.KEY_PREFIX}:${clientId}:${nonce}`
  }
}
