import {
  DataStoreConfiguration,
  EntityStore,
  EntityUtil,
  PolicyStore,
  entityDataSchema,
  entitySignatureSchema,
  policyDataSchema,
  policySignatureSchema
} from '@narval/policy-engine-shared'
import { HttpStatus, Injectable } from '@nestjs/common'
import { ZodObject, z } from 'zod'
import { DataStoreException } from '../exception/data-store.exception'
import { DataStoreRepositoryFactory } from '../factory/data-store-repository.factory'

@Injectable()
export class DataStoreService {
  constructor(private dataStoreRepositoryFactory: DataStoreRepositoryFactory) {}

  async fetch(store: { entity: DataStoreConfiguration; policy: DataStoreConfiguration }): Promise<{
    entity: EntityStore
    policy: PolicyStore
  }> {
    const [entityStore, policyStore] = await Promise.all([
      this.fetchEntity(store.entity),
      this.fetchPolicy(store.policy)
    ])

    return {
      entity: entityStore,
      policy: policyStore
    }
  }

  async fetchEntity(store: DataStoreConfiguration): Promise<EntityStore> {
    const [entityData, entitySignature] = await Promise.all([
      this.fetchByUrl(store.dataUrl, entityDataSchema),
      this.fetchByUrl(store.signatureUrl, entitySignatureSchema)
    ])

    const validation = EntityUtil.validate(entityData.entity.data)

    if (validation.success) {
      return {
        data: entityData.entity.data,
        signature: entitySignature.entity.signature
      }
    }

    throw new DataStoreException({
      message: 'Invalid entity domain invariant',
      suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      context: {
        url: store.dataUrl,
        errors: validation.issues
      }
    })
  }

  async fetchPolicy(store: DataStoreConfiguration): Promise<PolicyStore> {
    const [policyData, policySignature] = await Promise.all([
      this.fetchByUrl(store.dataUrl, policyDataSchema),
      this.fetchByUrl(store.signatureUrl, policySignatureSchema)
    ])

    return {
      data: policyData.policy.data,
      signature: policySignature.policy.signature
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async fetchByUrl<DataSchema extends ZodObject<any>>(
    url: string,
    schema: DataSchema
  ): Promise<z.infer<typeof schema>> {
    const data = await this.dataStoreRepositoryFactory.getRepository(url).fetch(url)
    const result = schema.safeParse(data)

    if (result.success) {
      return result.data
    }

    throw new DataStoreException({
      message: 'Invalid store schema',
      suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      context: {
        ...(schema.description ? { schema: schema.description } : {}),
        url,
        errors: result.error.errors.map(({ path, message, code }) => ({
          path,
          code,
          message
        }))
      }
    })
  }
}
