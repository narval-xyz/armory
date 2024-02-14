import { Alg, AuthCredential } from '@narval/authz-shared'
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../../shared/module/persistence/service/prisma.service'
import { decodeConstant } from '../decode.util'

@Injectable()
export class CredentialRepository {
  constructor(private prismaService: PrismaService) {}

  async create(orgId: string, credential: AuthCredential): Promise<AuthCredential> {
    await this.prismaService.authCredentialEntity.create({
      data: {
        orgId,
        uid: credential.uid,
        pubKey: credential.pubKey,
        alg: credential.alg,
        userId: credential.userId
      }
    })

    return credential
  }

  async findById(uid: string): Promise<AuthCredential | null> {
    const entity = await this.prismaService.authCredentialEntity.findUnique({
      where: { uid }
    })

    if (entity) {
      return decodeConstant(entity, 'alg', Object.values(Alg))
    }

    return null
  }
}
