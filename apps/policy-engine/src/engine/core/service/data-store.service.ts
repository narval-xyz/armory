import { LoggerService } from '@narval/nestjs-shared'
import {
  DataStore,
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
import { Jwk, JwtError, decodeJwt, hash, verifyJwt } from '@narval/signature'
import { HttpStatus, Injectable } from '@nestjs/common'
import { ZodObject, z } from 'zod'
import { DataStoreException } from '../exception/data-store.exception'
import { DataStoreRepositoryFactory } from '../factory/data-store-repository.factory'

@Injectable()
export class DataStoreService {
  constructor(
    private dataStoreRepositoryFactory: DataStoreRepositoryFactory,
    private logger: LoggerService
  ) {}

  async fetch(store: DataStore): Promise<{
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
      this.fetchBySource(store.data, EntityData),
      this.fetchBySource(store.signature, EntitySignature)
    ])

    const validation = EntityUtil.validate(entityData.entity.data)

    if (validation.success) {
      if (!entitySignature.entity.signature) {
        throw new DataStoreException({
          message: 'Entity data is unsigned',
          suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY
        })
      }

      if (validation.issues) {
        this.logger.warn('Entity data validation warnings', {
          urlConfig: store.data,
          errors: validation.issues
        })
      }

      const signatureVerification = await this.verifySignature({
        data: entityData.entity.data,
        signature: entitySignature.entity.signature,
        keys: store.keys
      })

      if (signatureVerification.success) {
        return {
          data: entityData.entity.data,
          signature: entitySignature.entity.signature
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
      this.fetchBySource(store.data, PolicyData),
      this.fetchBySource(store.signature, PolicySignature)
    ])

    if (!policySignature.policy.signature) {
      throw new DataStoreException({
        message: 'Policy data is unsigned',
        suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY
      })
    }

    const signatureVerification = await this.verifySignature({
      data: policyData.policy.data,
      signature: policySignature.policy.signature,
      keys: store.keys
    })

    if (signatureVerification.success) {
      return {
        data: policyData.policy.data,
        signature: policySignature.policy.signature
      }
    }

    throw signatureVerification.error
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async fetchBySource<DataSchema extends ZodObject<any>>(
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
