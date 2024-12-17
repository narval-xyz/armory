import { coerce } from '@narval/nestjs-shared'
import { Injectable } from '@nestjs/common'
import { KeyMetadata } from './shared/module/key-value/core/repository/key-value.repository'
import { KeyValueService } from './shared/module/key-value/core/service/key-value.service'
import { PrismaService } from './shared/module/persistence/service/prisma.service'
import { App, AppV1, Collection } from './shared/type/domain.type'

@Injectable()
export class AppRepository {
  constructor(
    private keyValueService: KeyValueService,
    private prismaService: PrismaService
  ) {}

  private KEY_PREFIX = Collection.APP

  /** @deprecated */
  getMetadata(): KeyMetadata {
    return {
      collection: Collection.APP
    }
  }

  /** @deprecated */
  async findByIdV1(id: string): Promise<AppV1 | null> {
    const value = await this.keyValueService.get(this.getKey(id))

    if (value) {
      return coerce.decode(AppV1, value)
    }

    return null
  }

  async findById(id: string): Promise<App | null> {
    const value = await this.prismaService.vault.findUnique({ where: { id } })

    if (value) {
      return App.parse(value)
    }

    return null
  }

  async findAll(): Promise<App[]> {
    const values = await this.prismaService.vault.findMany()

    return values.map((value) => App.parse(value))
  }

  /** @deprecated */
  async saveV1(app: AppV1): Promise<AppV1> {
    await this.keyValueService.set(this.getKey(app.id), coerce.encode(AppV1, app), this.getMetadata())

    return app
  }

  async save(app: App): Promise<App> {
    const appData = {
      id: app.id,
      encryptionKeyringType: app.encryptionKeyringType,
      encryptionMasterKey: app.encryptionMasterKey,
      encryptionMasterAwsKmsArn: app.encryptionMasterAwsKmsArn,
      authDisabled: app.authDisabled,
      adminApiKeyHash: app.adminApiKeyHash
    }

    // You cannot update the encryption details; that will cause data corruption.
    // Key rotation must be a separate process.
    await this.prismaService.vault.upsert({
      where: { id: app.id },
      update: {
        authDisabled: app.authDisabled,
        adminApiKeyHash: app.adminApiKeyHash
      },
      create: appData
    })

    return app
  }

  /** @deprecated */
  getKey(id: string): string {
    return `${this.KEY_PREFIX}:${id}`
  }
}
