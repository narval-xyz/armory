import { AuthCredential, UserEntity, UserRole } from '@narval/authz-shared'
import { Injectable } from '@nestjs/common'
import { SetRequired } from 'type-fest'
import { PrismaService } from '../../../../shared/module/persistence/service/prisma.service'

function convertResponse<T, K extends keyof T, V extends T[K]>(
  response: T,
  key: K,
  validValues: V[]
): T & Record<K, V> {
  if (!validValues.includes(response[key] as V)) {
    throw new Error(`Invalid value for key ${key as string}: ${response[key]}`)
  }

  return {
    ...response,
    [key]: response[key] as V
  } as T & Record<K, V>
}

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
        .then((d) => convertResponse(d, 'role', Object.values(UserRole)))

      if (credential) {
        await tx.authCredentialEntity.create({
          data: {
            orgId,
            id: credential.uid,
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
    return convertResponse(
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
      return convertResponse(entity, 'role', Object.values(UserRole))
    }

    return null
  }
}
