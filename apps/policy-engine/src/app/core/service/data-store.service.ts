import {
  DataStoreConfiguration,
  Entities,
  Policy,
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
    entity: {
      data: Entities
      signature: string
    }
    policy: {
      data: Policy[]
      signature: string
    }
  }> {
    const [entityData, entitySignature, policyData, policySignature] = await Promise.all([
      this.fetchByUrl(store.entity.dataUrl, entityDataSchema),
      this.fetchByUrl(store.entity.signatureUrl, entitySignatureSchema),
      this.fetchByUrl(store.policy.dataUrl, policyDataSchema),
      this.fetchByUrl(store.policy.signatureUrl, policySignatureSchema)
    ])

    return {
      entity: {
        data: entityData.entity.data,
        signature: entitySignature.entity.signature
      },
      policy: {
        data: policyData.policy.data,
        signature: policySignature.policy.signature
      }
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
