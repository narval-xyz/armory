import { coerce } from '@narval/nestjs-shared'
import { Injectable } from '@nestjs/common'
import { KeyValueService } from '../../../shared/module/key-value/core/service/key-value.service'
import { PrismaService } from '../../../shared/module/persistence/service/prisma.service'
import { Engine, EngineV1 } from '../../../shared/type/domain.type'

@Injectable()
export class EngineRepository {
  constructor(
    private keyValueService: KeyValueService,
    private prismaService: PrismaService
  ) {}

  /** @deprecated */
  async findByIdV1(id: string): Promise<EngineV1 | null> {
    const value = await this.keyValueService.get(this.getEngineKey(id))

    if (value) {
      return coerce.decode(EngineV1, value)
    }

    return null
  }

  async findById(id: string): Promise<Engine | null> {
    const value = await this.prismaService.engine.findUnique({ where: { id } })

    if (value) {
      return Engine.parse(value)
    }

    return null
  }

  async findAll(): Promise<Engine[]> {
    const values = await this.prismaService.engine.findMany()

    return values.map((value) => Engine.parse(value))
  }

  /** @deprecated */
  async saveV1(engine: EngineV1): Promise<EngineV1> {
    await this.keyValueService.set(this.getEngineKey(engine.id), coerce.encode(EngineV1, engine))

    return engine
  }

  async save(engine: Engine): Promise<Engine> {
    const engineData = {
      id: engine.id,
      encryptionKeyringType: engine.encryptionKeyringType,
      encryptionMasterKey: engine.encryptionMasterKey,
      encryptionMasterAwsKmsArn: engine.encryptionMasterAwsKmsArn,
      authDisabled: !!engine.authDisabled,
      adminApiKeyHash: engine.adminApiKeyHash
    }

    // You cannot update the encryption details; that will cause data corruption.
    // Key rotation must be a separate process.
    await this.prismaService.engine.upsert({
      where: { id: engine.id },
      update: {
        authDisabled: engine.authDisabled,
        adminApiKeyHash: engine.adminApiKeyHash
      },
      create: engineData
    })

    return engine
  }

  /** @deprecated */
  getEngineKey(id: string): string {
    return `engine:${id}`
  }
}
