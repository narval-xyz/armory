import { coerce } from '@narval/nestjs-shared'
import { publicKeySchema, rsaPublicKeySchema } from '@narval/signature'
import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client/vault'
import { compact } from 'lodash/fp'
import { z } from 'zod'
import { KeyMetadata } from '../../../shared/module/key-value/core/repository/key-value.repository'
import { EncryptKeyValueService } from '../../../shared/module/key-value/core/service/encrypt-key-value.service'
import { PrismaService } from '../../../shared/module/persistence/service/prisma.service'
import { Client, ClientLocalAuthAllowedUser, ClientV1, Collection } from '../../../shared/type/domain.type'
export const ClientIndex = z.array(z.string())

export function clientObjectToPrisma(client: Client): Prisma.ClientCreateInput {
  return {
    clientId: client.clientId,
    name: client.name,
    configurationSource: client.configurationSource,
    authDisabled: client.auth.disabled,
    tokenValidationDisabled: client.auth.tokenValidation.disabled,
    backupPublicKey: client.backupPublicKey ? JSON.stringify(client.backupPublicKey) : null,
    baseUrl: client.baseUrl,

    // JWT Token Validation
    authorizationServerUrl: client.auth.tokenValidation.url,
    authorizationIssuer: client.auth.tokenValidation.verification.issuer,
    authorizationAudience: client.auth.tokenValidation.verification.audience,
    authorizationMaxTokenAge: client.auth.tokenValidation.verification.maxTokenAge,
    authorizationJwksUrl: client.auth.tokenValidation.jwksUrl,
    authorizationPinnedPublicKey: client.auth.tokenValidation.pinnedPublicKey
      ? JSON.stringify(client.auth.tokenValidation.pinnedPublicKey)
      : null,
    authorizationRequireBoundTokens: client.auth.tokenValidation.verification.requireBoundTokens,
    authorizationAllowBearerTokens: client.auth.tokenValidation.verification.allowBearerTokens,
    authorizationAllowWildcards: client.auth.tokenValidation.verification.allowWildcard?.join(','),

    // Local Authentication Methods
    localAuthAllowedUsersJwksUrl: client.auth.local?.allowedUsersJwksUrl || null,
    localAuthJwsdEnabled: !!client.auth.local?.jwsd,
    jwsdMaxAge: client.auth.local?.jwsd?.maxAge || null,
    jwsdRequiredComponents: client.auth.local?.jwsd?.requiredComponents.join(',') || null,

    createdAt: client.createdAt, // Exclude the createdAt so the db generates it.
    updatedAt: client.updatedAt
  }
}

function prismaToClientObject(
  prismaClient: Prisma.ClientGetPayload<{ include: { localAuthAllowedUsers: true } }>
): Client {
  return {
    clientId: prismaClient.clientId,
    name: prismaClient.name,
    configurationSource: prismaClient.configurationSource as 'declarative' | 'dynamic',
    backupPublicKey: prismaClient.backupPublicKey
      ? rsaPublicKeySchema.parse(JSON.parse(prismaClient.backupPublicKey))
      : null,
    baseUrl: prismaClient.baseUrl,

    auth: {
      disabled: prismaClient.authDisabled,
      local: prismaClient.localAuthJwsdEnabled
        ? {
            jwsd: {
              maxAge: prismaClient.jwsdMaxAge ?? 0,
              requiredComponents: prismaClient.jwsdRequiredComponents?.split(',') ?? []
            },
            allowedUsersJwksUrl: prismaClient.localAuthAllowedUsersJwksUrl,
            allowedUsers: prismaClient.localAuthAllowedUsers?.length
              ? prismaClient.localAuthAllowedUsers?.map((user) => ({
                  userId: user.userId,
                  publicKey: publicKeySchema.parse(JSON.parse(user.publicKey))
                }))
              : null
          }
        : null,
      tokenValidation: {
        disabled: prismaClient.tokenValidationDisabled,
        url: prismaClient.authorizationServerUrl,
        jwksUrl: prismaClient.authorizationJwksUrl,
        pinnedPublicKey: prismaClient.authorizationPinnedPublicKey
          ? publicKeySchema.parse(JSON.parse(prismaClient.authorizationPinnedPublicKey))
          : null,
        verification: {
          audience: prismaClient.authorizationAudience,
          issuer: prismaClient.authorizationIssuer,
          maxTokenAge: prismaClient.authorizationMaxTokenAge,
          requireBoundTokens: prismaClient.authorizationRequireBoundTokens,
          allowBearerTokens: prismaClient.authorizationAllowBearerTokens,
          allowWildcard: prismaClient.authorizationAllowWildcards
            ? prismaClient.authorizationAllowWildcards.split(',')
            : null
        }
      }
    },

    createdAt: prismaClient.createdAt,
    updatedAt: prismaClient.updatedAt
  }
}

@Injectable()
export class ClientRepository {
  constructor(
    private encryptKeyValueService: EncryptKeyValueService,
    private prismaService: PrismaService
  ) {}

  private KEY_PREFIX = Collection.CLIENT

  async findById(clientId: string): Promise<Client | null> {
    const value = await this.prismaService.client.findUnique({
      where: { clientId },
      include: { localAuthAllowedUsers: true }
    })

    if (value) {
      return prismaToClientObject(value)
    }

    return null
  }
  async findAll(): Promise<Client[]> {
    const clients = await this.prismaService.client.findMany({ include: { localAuthAllowedUsers: true } })
    return clients.map(prismaToClientObject)
  }

  async saveAllowedUsers(
    clientId: string,
    allowedUsers: ClientLocalAuthAllowedUser[],
    overwrite: boolean
  ): Promise<void> {
    const allowedUsersInput = allowedUsers.map((user) => ({
      id: `${clientId}:${user.userId}`,
      userId: user.userId,
      clientId: clientId,
      publicKey: JSON.stringify(user.publicKey)
    }))

    await this.prismaService.$transaction(
      compact([
        overwrite ? this.prismaService.clientLocalAuthAllowedUser.deleteMany({ where: { clientId } }) : undefined,
        allowedUsers.length > 0
          ? this.prismaService.clientLocalAuthAllowedUser.createMany({
              data: allowedUsersInput,
              skipDuplicates: true
            })
          : undefined
      ])
    )
  }

  // Upsert the Client and any Allowed Users, optionally overwriting existing "allowedUsers"
  async save(client: Client, overwriteAllowedUsers = false): Promise<Client> {
    const clientData = clientObjectToPrisma(client)

    await this.prismaService.client.upsert({
      where: { clientId: client.clientId },
      update: { ...clientData, createdAt: undefined }, // Ensure we don't overwrite the createdAt
      create: clientData
    })

    await this.saveAllowedUsers(client.clientId, client.auth.local?.allowedUsers ?? [], overwriteAllowedUsers)

    return client
  }

  /** @deprecated */
  async saveV1(client: ClientV1): Promise<ClientV1> {
    await this.encryptKeyValueService.set(
      this.getKey(client.clientId),
      coerce.encode(ClientV1, client),
      this.getMetadata(client.clientId)
    )
    await this.index(client)

    return client
  }

  /** @deprecated */
  async findByIdV1(clientId: string): Promise<ClientV1 | null> {
    const value = await this.encryptKeyValueService.get(this.getKey(clientId))

    if (value) {
      return coerce.decode(ClientV1, value)
    }

    return null
  }

  /** @deprecated */
  async getClientIndex(): Promise<string[]> {
    const index = await this.encryptKeyValueService.get(this.getIndexKey())

    if (index) {
      return coerce.decode(ClientIndex, index)
    }

    return []
  }

  // TODO: (@wcalderipe, 07/03/24) we need to rethink this strategy. If we use a
  // SQL database, this could generate a massive amount of queries; thus,
  // degrading the performance.
  //
  // An option is to move these general queries `findBy`, findAll`, etc to the
  // KeyValeuRepository implementation letting each implementation pick the best
  // strategy to solve the problem (e.g. where query in SQL)
  /** @deprecated */
  async findAllV1(): Promise<ClientV1[]> {
    const ids = await this.getClientIndex()
    const clients = await Promise.all(ids.map((id) => this.findByIdV1(id)))

    return compact(clients)
  }

  /** @deprecated */
  getMetadata(clientId: string): KeyMetadata {
    return { collection: Collection.CLIENT, clientId }
  }

  /** @deprecated */
  getKey(clientId: string): string {
    return `${this.KEY_PREFIX}:${clientId}`
  }

  /** @deprecated */
  getIndexKey(): string {
    return `${this.KEY_PREFIX}:index`
  }

  /** @deprecated */
  private async index(client: ClientV1): Promise<boolean> {
    const currentIndex = await this.getClientIndex()

    await this.encryptKeyValueService.set(
      this.getIndexKey(),
      coerce.encode(ClientIndex, [...currentIndex, client.clientId]),
      this.getMetadata(client.clientId)
    )

    return true
  }
  async deleteV1(clientId: string): Promise<void> {
    await this.encryptKeyValueService.delete(this.getKey(clientId))
    // Remove the client from the index
    const currentIndex = await this.getClientIndex()

    const newIndex = currentIndex.filter((id) => id !== clientId)
    await this.encryptKeyValueService.set(
      this.getIndexKey(),
      coerce.encode(ClientIndex, newIndex),
      this.getMetadata(clientId) // This is ignored on updates
    )
  }
}
