import { Injectable } from '@nestjs/common'
import { KeyValueService } from '../../../shared/module/key-value/core/service/key-value.service'

@Injectable()
export class NonceService {
  constructor(private keyValuService: KeyValueService) {}

  async save(clientId: string, nonce: string): Promise<boolean> {
    await this.keyValuService.set(this.getKey(clientId, nonce), '1')

    return true
  }

  async exist(clientId: string, nonce: string): Promise<boolean> {
    const value = await this.keyValuService.get(this.getKey(clientId, nonce))

    if (value) {
      return true
    }

    return false
  }

  private getKey(clientId: string, nonce: string): string {
    return `request-nonce:${clientId}:${nonce}`
  }
}
