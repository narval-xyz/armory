import { AuthCredential } from '@app/authz/shared/types/http'
import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { mockEntityData, userAddressStore, userCredentialStore } from './mock_data'

@Injectable()
export class PersistenceRepository implements OnModuleInit {
  private logger = new Logger(PersistenceRepository.name)

  async onModuleInit() {
    this.logger.log('PersistenceRepository initialized')
  }

  async getEntityData() {
    const data = mockEntityData
    return data
  }

  async getUserForAddress(address: string): Promise<string> {
    const userId = userAddressStore[address]
    if (!userId) throw new Error(`Could not find user for address ${address}`)
    return userId
  }

  async getCredentialForPubKey(pubKey: string): Promise<AuthCredential> {
    const credential = userCredentialStore[pubKey]
    if (!credential) throw new Error(`Could not find credential for pubKey ${pubKey}`)
    return credential
  }
}
