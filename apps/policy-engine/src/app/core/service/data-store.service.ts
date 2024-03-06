import { DataStoreConfiguration, entityDataSchema, entitySignatureSchema } from '@narval/policy-engine-shared'
import { HttpStatus, Injectable } from '@nestjs/common'
import { ZodObject, z } from 'zod'
import { DataStoreException } from '../exception/data-store.exception'
import { DataStoreRepositoryFactory } from '../factory/data-store-repository.factory'

@Injectable()
export class DataStoreService {
  constructor(private dataStoreRepositoryFactory: DataStoreRepositoryFactory) {}

  async fetch(config: DataStoreConfiguration) {
    const [entityData, entitySignature] = await Promise.all([
      this.fetchByUrl(config.dataUrl, entityDataSchema),
      this.fetchByUrl(config.signatureUrl, entitySignatureSchema)
    ])

    return {
      entity: {
        data: entityData.entity.data,
        signature: entitySignature.entity.signature
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
