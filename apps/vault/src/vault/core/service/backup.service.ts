import { RsaPublicKey, hash, rsaEncrypt } from '@narval/signature'
import { Injectable, Logger } from '@nestjs/common'
import { ClientService } from '../../../client/core/service/client.service'
import { ApplicationException } from '../../../shared/exception/application.exception'
import { BackupRepository } from '../../persistence/repository/backup.repository'

@Injectable()
export class BackupService {
  private logger = new Logger(BackupService.name)

  constructor(
    private clientService: ClientService,
    private backupRepository: BackupRepository
  ) {}

  async getKey(clientId: string): Promise<RsaPublicKey | undefined> {
    const client = await this.clientService.findById(clientId)
    if (!client) {
      throw new ApplicationException({
        message: 'Client not found',
        suggestedHttpStatusCode: 404,
        context: { clientId }
      })
    }
    return client.backupPublicKey
  }

  async encrypt(
    clientId: string,
    {
      mnemonic,
      backupPublicKey
    }: {
      mnemonic: string
      backupPublicKey: RsaPublicKey
    }
  ) {
    const data = await rsaEncrypt(mnemonic, backupPublicKey)

    return data
  }

  async save(
    clientId: string,
    {
      keyId,
      data,
      backupPublicKeyHash
    }: {
      keyId: string
      data: string
      backupPublicKeyHash: string
    }
  ) {
    await this.backupRepository.save(clientId, {
      keyId,
      data,
      backupPublicKeyHash,
      createdAt: new Date()
    })
  }

  async tryBackup(clientId: string, mnemonic: string): Promise<string | undefined> {
    const backupPublicKey = await this.getKey(clientId)
    if (!backupPublicKey) {
      return
    }

    const backupPublicKeyHash = hash(backupPublicKey)
    const data = await this.encrypt(clientId, { mnemonic, backupPublicKey })
    await this.save(clientId, { keyId: 'backup', data, backupPublicKeyHash })
    return data
  }
}
