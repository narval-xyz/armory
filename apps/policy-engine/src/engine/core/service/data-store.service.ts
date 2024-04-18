import {
  DataStoreConfiguration,
  Entities,
  EntityData,
  EntitySignature,
  EntityStore,
  EntityUtil,
  Policy,
  PolicyData,
  PolicySignature,
  PolicyStore,
  Source
} from '@narval/policy-engine-shared'
import { Jwk, decodeJwt, hash, verifyJwt } from '@narval/signature'
import { HttpStatus, Injectable } from '@nestjs/common'
import { JwtError } from 'packages/signature/src/lib/error'
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
      this.fetchByUrl(store.data, EntityStore),
      this.fetchByUrl(store.signature, EntityStore)
    ])

    const validation = EntityUtil.validate(entityData.data)

    if (validation.success) {
      const signatureVerification = await this.verifySignature({
        data: entityData.data,
        signature: entitySignature.signature,
        keys: store.keys
      })

      if (signatureVerification.success) {
        return {
          data: entityData.data,
          signature: entitySignature.signature
        }
      }

      throw signatureVerification.error
    }

    throw new DataStoreException({
      message: 'Invalid entity domain invariant',
      suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      context: {
        urlConfig: store.data,
        errors: validation.success ? {} : validation.issues
      }
    })
  }

  async fetchPolicy(store: DataStoreConfiguration): Promise<PolicyStore> {
    const [policyData, policySignature] = await Promise.all([
      this.fetchByUrl(store.data, PolicyStore),
      this.fetchByUrl(store.signature, PolicyStore)
    ])

    const signatureVerification = await this.verifySignature({
      data: policyData.data,
      signature: policySignature.signature,
      keys: store.keys
    })

    if (signatureVerification.success) {
      return {
        data: policyData.data,
        signature: policySignature.signature
      }
    }

    throw signatureVerification.error
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async fetchByUrl<DataSchema extends ZodObject<any>>(
    source: Source,
    schema: DataSchema
  ): Promise<z.infer<typeof schema>> {
    const data = await this.dataStoreRepositoryFactory.getRepository(source.type).fetch(source)

    const result = schema.safeParse(data)

    if (result.success) {
      return result.data
    }

    throw new DataStoreException({
      message: 'Invalid store schema',
      suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      context: {
        ...(schema.description ? { schema: schema.description } : {}),
        source,
        errors: result.error.errors.map(({ path, message, code }) => ({
          path,
          code,
          message
        }))
      }
    })
  }

  async verifySignature(params: {
    data: Entities | Policy[]
    signature: string
    keys: Jwk[]
  }): Promise<{ success: true } | { success: false; error: DataStoreException }> {
    try {
      const jwt = decodeJwt(params.signature)
      const jwk = params.keys.find(({ kid }) => kid === jwt.header.kid)

      if (!jwk) {
        return {
          success: false,
          error: new DataStoreException({
            message: 'JWK not found',
            suggestedHttpStatusCode: HttpStatus.NOT_FOUND,
            context: {
              kid: jwt.header.kid
            }
          })
        }
      }

      const verification = await verifyJwt(params.signature, jwk)

      if (verification.payload.data !== hash(params.data)) {
        return {
          success: false,
          error: new DataStoreException({
            message: 'Data signature mismatch',
            suggestedHttpStatusCode: HttpStatus.UNAUTHORIZED
          })
        }
      }
    } catch (error) {
      if (error instanceof JwtError) {
        return {
          success: false,
          error: new DataStoreException({
            message: 'Invalid signature',
            suggestedHttpStatusCode: HttpStatus.UNAUTHORIZED,
            origin: error
          })
        }
      }

      return {
        success: false,
        error: new DataStoreException({
          message: 'Unknown error',
          suggestedHttpStatusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          origin: error
        })
      }
    }

    return {
      success: true
    }
  }
}
