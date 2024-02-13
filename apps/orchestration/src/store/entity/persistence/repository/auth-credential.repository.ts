import { Alg, AuthCredential } from '@narval/authz-shared'
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../../shared/module/persistence/service/prisma.service'
import { decodeConstant } from '../decode.util'

@Injectable()
export class AuthCredentialRepository {
  constructor(private prismaService: PrismaService) {}

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
