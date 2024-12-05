import { rsaPrivateKeySchema, rsaPublicKeySchema } from '@narval/signature'
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../shared/module/persistence/service/prisma.service'
import { EncryptionKey } from '../core/type/encryption-key.type'

@Injectable()
export class EncryptionKeyRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(encryptionKey: EncryptionKey): Promise<EncryptionKey> {
    await this.prismaService.encryptionKey.create({
      data: {
        id: encryptionKey.privateKey.kid,
        clientId: encryptionKey.clientId,
        privateKey: rsaPrivateKeySchema.parse(encryptionKey.privateKey),
        publicKey: rsaPublicKeySchema.parse(encryptionKey.publicKey),
        createdAt: encryptionKey.createdAt
      }
    })

    return encryptionKey
  }

  async findByKid(kid: string): Promise<EncryptionKey | null> {
    const encryptionKey = await this.prismaService.encryptionKey.findUnique({
      where: { id: kid }
    })

    if (encryptionKey) {
      return EncryptionKey.parse(encryptionKey)
    }

    return null
  }
}
