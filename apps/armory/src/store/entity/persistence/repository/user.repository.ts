import { CredentialEntity, UserEntity, UserRole } from '@narval/authz-shared'
import { Injectable } from '@nestjs/common'
import { UserEntity as UserModel } from '@prisma/client/orchestration'
import { omit } from 'lodash/fp'
import { SetRequired } from 'type-fest'
import { PrismaService } from '../../../../shared/module/persistence/service/prisma.service'
import { decodeConstant } from '../decode.util'

@Injectable()
export class UserRepository {
  constructor(private prismaService: PrismaService) {}

  async create(orgId: string, user: UserEntity, credential?: CredentialEntity): Promise<UserEntity> {
    const result = await this.prismaService.$transaction(async (tx) => {
      const entity: UserEntity = await tx.userEntity
        .create({
          data: {
            uid: user.uid,
            role: user.role,
            orgId
          }
        })
        .then((d) => decodeConstant(d, 'role', Object.values(UserRole)))

      if (credential) {
        await tx.authCredentialEntity.create({
          data: {
            orgId,
            uid: credential.uid,
            pubKey: credential.pubKey,
            alg: credential.alg,
            userId: user.uid
          }
        })
      }

      return entity
    })

    return result
  }

  async delete(uid: string): Promise<boolean> {
    await this.prismaService.$transaction(async (tx) => {
      await tx.userEntity.delete({
        where: {
          uid
        }
      })

      await tx.authCredentialEntity.deleteMany({
        where: {
          userId: uid
        }
      })

      await tx.userGroupMemberEntity.deleteMany({
        where: {
          userId: uid
        }
      })
    })

    return true
  }

  async update(user: SetRequired<Partial<UserEntity>, 'uid'>): Promise<UserEntity> {
    const entity = await this.prismaService.userEntity.update({
      where: {
        uid: user.uid
      },
      data: user
    })

    return this.decode(entity)
  }

  async findById(uid: string): Promise<UserEntity | null> {
    const entity = await this.prismaService.userEntity.findUnique({
      where: { uid }
    })

    if (entity) {
      return this.decode(entity)
    }

    return null
  }

  async findByOrgId(orgId: string): Promise<UserEntity[]> {
    const entities = await this.prismaService.userEntity.findMany({ where: { orgId } })

    return entities.map(this.decode)
  }

  private decode(model: UserModel): UserEntity {
    return decodeConstant(omit(['orgId'], model), 'role', Object.values(UserRole))
  }
}
