import { AuthCredential, UserEntity, UserRole } from '@narval/authz-shared'
import { Injectable } from '@nestjs/common'
import { SetRequired } from 'type-fest'
import { PrismaService } from '../../../../shared/module/persistence/service/prisma.service'
import { decodeConstant } from '../decode.util'

@Injectable()
export class UserRepository {
  constructor(private prismaService: PrismaService) {}

  async create(orgId: string, user: UserEntity, credential?: AuthCredential): Promise<UserEntity> {
    const result = await this.prismaService.$transaction(async (tx) => {
      const entity: UserEntity = await tx.userEntity
        .create({
          data: {
            ...user,
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

      await tx.userGroupEntityMembership.deleteMany({
        where: {
          user: uid
        }
      })
    })

    return true
  }

  async update(user: SetRequired<Partial<UserEntity>, 'uid'>): Promise<UserEntity> {
    return decodeConstant(
      await this.prismaService.userEntity.update({
        where: {
          uid: user.uid
        },
        data: user
      }),
      'role',
      Object.values(UserRole)
    )
  }

  async findById(uid: string): Promise<UserEntity | null> {
    const entity = await this.prismaService.userEntity.findUnique({
      where: { uid }
    })

    if (entity) {
      return decodeConstant(entity, 'role', Object.values(UserRole))
    }

    return null
  }
}
