import { rsaPrivateKeySchema, rsaPublicKeySchema } from '@narval/signature'
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../shared/module/persistence/service/prisma.service'
import { EncryptionKey } from '../core/type/encryption-key.type'

@Injectable()
export class EncryptionKeyRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(encryptionKey: EncryptionKey): Promise<EncryptionKey> {
    await this.prismaService.transitEncryptionKey.create({
      data: {
        id: encryptionKey.privateKey.kid,
        clientId: encryptionKey.clientId,
        privateKey: JSON.stringify(rsaPrivateKeySchema.parse(encryptionKey.privateKey)),
        publicKey: JSON.stringify(rsaPublicKeySchema.parse(encryptionKey.publicKey)),
        createdAt: encryptionKey.createdAt
      }
    })

    return encryptionKey
  }

  async findByKid(kid: string): Promise<EncryptionKey | null> {
    const encryptionKey = await this.prismaService.transitEncryptionKey.findUnique({
      where: { id: kid }
    })

    if (encryptionKey) {
      // TODO: we have stringified json, so make sure to handle errors
      return EncryptionKey.parse({
        ...encryptionKey,
        privateKey: JSON.parse(encryptionKey.privateKey),
        publicKey: JSON.parse(encryptionKey.publicKey)
      })
    }

    return null
  }
}
