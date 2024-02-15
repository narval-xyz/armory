import { Alg, AuthCredential } from '@narval/authz-shared'
import { Injectable } from '@nestjs/common'
import { AuthCredentialEntity as Model } from '@prisma/client/orchestration'
import { omit } from 'lodash/fp'
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
    const model = await this.prismaService.authCredentialEntity.findUnique({
      where: { uid }
    })

    if (model) {
      return this.decode(model)
    }

    return null
  }

  async findByOrgId(orgId: string): Promise<AuthCredential[]> {
    const models = await this.prismaService.authCredentialEntity.findMany({
      where: { orgId }
    })

    return models.map(this.decode)
  }

  private decode(model: Model): AuthCredential {
    return decodeConstant(omit('orgId', model), 'alg', Object.values(Alg))
  }
}
