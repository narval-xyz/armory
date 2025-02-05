import { ConfigService } from '@narval/config-module'
import { EncryptionService } from '@narval/encryption-module'
import { LoggerService } from '@narval/nestjs-shared'
import { Injectable, OnApplicationShutdown, OnModuleDestroy, OnModuleInit, Optional } from '@nestjs/common'
import { hmac } from '@noble/hashes/hmac'
import { sha256 } from '@noble/hashes/sha2'
import { bytesToHex } from '@noble/hashes/utils'
import { Prisma, PrismaClient } from '@prisma/client/policy-engine'
import { canonicalize } from 'packages/signature/src/lib/json.util'
import { Config } from '../../../../policy-engine.config'
import { ParseException } from '../exception/parse.exception'

const ENCRYPTION_PREFIX = 'enc.v1.' // Version prefix helps with future encryption changes
const INTEGRITY_PREFIX = 'hmac.v1.' // Version prefix helps with future integrity changes

/**
 * To encrypt a field, simply reference the Model as the key, and the fields in an array.
 * NOTE: encrypted fields MUST be of string type. JSON data should be stringified before/after encryption/decryption; this assumes Strings.
 */
const encryptedModelFields = {
  Client: [Prisma.ClientScalarFieldEnum.clientSecret, Prisma.ClientScalarFieldEnum.signerPrivateKey]
}

const modelWithHmacIntegrity = {
  Client: {
    [Prisma.ClientScalarFieldEnum.clientId]: {
      integrity: true,
      nullable: false
    },
    [Prisma.ClientScalarFieldEnum.name]: {
      integrity: true,
      nullable: false
    },
    [Prisma.ClientScalarFieldEnum.configurationSource]: {
      integrity: true,
      nullable: false
    },
    [Prisma.ClientScalarFieldEnum.baseUrl]: {
      integrity: true,
      nullable: true
    },
    [Prisma.ClientScalarFieldEnum.authDisabled]: {
      integrity: true,
      nullable: false
    },
    [Prisma.ClientScalarFieldEnum.clientSecret]: {
      integrity: true,
      nullable: true
    },
    [Prisma.ClientScalarFieldEnum.dataStoreEntityDataUrl]: {
      integrity: true,
      nullable: false
    },
    [Prisma.ClientScalarFieldEnum.dataStoreEntitySignatureUrl]: {
      integrity: true,
      nullable: false
    },
    [Prisma.ClientScalarFieldEnum.dataStoreEntityPublicKeys]: {
      integrity: true,
      nullable: false
    },
    [Prisma.ClientScalarFieldEnum.dataStorePolicyDataUrl]: {
      integrity: true,
      nullable: false
    },
    [Prisma.ClientScalarFieldEnum.dataStorePolicySignatureUrl]: {
      integrity: true,
      nullable: false
    },
    [Prisma.ClientScalarFieldEnum.dataStorePolicyPublicKeys]: {
      integrity: true,
      nullable: false
    },
    [Prisma.ClientScalarFieldEnum.decisionAttestationDisabled]: {
      integrity: true,
      nullable: false
    },
    [Prisma.ClientScalarFieldEnum.signerAlg]: {
      integrity: true,
      nullable: true
    },
    [Prisma.ClientScalarFieldEnum.signerKeyId]: {
      integrity: true,
      nullable: true
    },
    [Prisma.ClientScalarFieldEnum.signerPublicKey]: {
      integrity: true,
      nullable: true
    },
    [Prisma.ClientScalarFieldEnum.signerPrivateKey]: {
      integrity: true,
      nullable: true
    },
    [Prisma.ClientScalarFieldEnum.createdAt]: {
      integrity: true,
      nullable: false
    },
    [Prisma.ClientScalarFieldEnum.updatedAt]: {
      integrity: true,
      nullable: false
    }
  }
}

const getHmac = (secret: string, value: Record<string, unknown>) => {
  const integrity = hmac(sha256, secret, canonicalize(value))
  return `${INTEGRITY_PREFIX}${bytesToHex(integrity)}`
}

const buildEncryptionExtension = (
  configService: ConfigService<Config>,
  logger: LoggerService,
  encryptionService: EncryptionService
) => {
  // Generate the hmac
  const hmacSecret = configService.get('keyring.hmacSecret')
  if (!hmacSecret) {
    logger.error('HMAC secret is not set, integrity verification will not be performed')
    throw new Error('HMAC secret is not set, integrity verification will not be performed')
  }

  const encryptToString = async (value: string) => {
    const encryptedBuffer = await encryptionService.encrypt(value)
    const encryptedString = encryptedBuffer.toString('hex')
    return `${ENCRYPTION_PREFIX}${encryptedString}`
  }

  const decryptToString = async (value: string) => {
    if (!value.startsWith(ENCRYPTION_PREFIX)) {
      return value
    }
    const decryptedBuffer = await encryptionService.decrypt(Buffer.from(value.slice(ENCRYPTION_PREFIX.length), 'hex'))
    return decryptedBuffer.toString()
  }

  return Prisma.defineExtension({
    name: 'encryption',
    query: {
      async $allOperations({ model, operation, args, query }) {
        if (!model || !(model in encryptedModelFields)) {
          return query(args)
        }
        const fields = encryptedModelFields[model as keyof typeof encryptedModelFields]

        // For write operations, encrypt.
        const writeOps = ['create', 'upsert', 'update', 'updateMany', 'createMany']
        if (writeOps.includes(operation)) {
          let dataToUpdate: Record<string, unknown>[] = []
          if (operation === 'upsert') {
            if (args.update) {
              dataToUpdate.push(args.update)
            }
            if (args.create) {
              dataToUpdate.push(args.create)
            }
          } else if (Array.isArray(args.data)) {
            dataToUpdate = args.data
          } else {
            dataToUpdate = [args.data]
          }
          // For each field-to-encrypt, for each object being created, encrypt the field.
          await Promise.all(
            fields.map(async (field) => {
              await Promise.all(
                dataToUpdate.map(async (item: Record<string, unknown>) => {
                  if (item[field] && typeof item[field] === 'string') {
                    item[field] = await encryptToString(item[field] as string)
                  }
                })
              )
            })
          )
          // Data has been encrypted.
          // Now, generate the _integrity hmac
          // The data must include every field on the model; if not, we will reject this operation.
          if (model in modelWithHmacIntegrity) {
            const fields = modelWithHmacIntegrity[model as keyof typeof modelWithHmacIntegrity]
            for (const data of dataToUpdate) {
              // Create object to hold fields that should be covered by integrity
              const integrityCovered: Record<string, unknown> = {}

              // Iterate through all configured fields for this model
              for (const [fieldName, fieldSettings] of Object.entries(fields)) {
                // Check if field is required but missing
                integrityCovered[fieldName] = data[fieldName]
                if (!fieldSettings.nullable && data[fieldName] === undefined) {
                  logger.error(`Missing required field ${fieldName} in data, needed for integrity hmac`)
                  throw new Error(`Missing required field ${fieldName} in data, needed for integrity hmac`)
                }
                if (fieldSettings.nullable && !data[fieldName]) {
                  // Ensure we capture the null in the integrity object
                  integrityCovered[fieldName] = null
                }
              }

              const integrity = getHmac(hmacSecret, integrityCovered)
              data.integrity = integrity
            }
          }

          return query(args)
        }

        // For read operations, decrypt.
        const readOps = ['findUnique', 'findMany', 'findUniqueOrThrow', 'findFirst', 'findFirstOrThrow'] as const
        type ReadOp = (typeof readOps)[number]

        if (readOps.includes(operation as ReadOp)) {
          const result = await query(args)

          // Handle non-record results
          if (!result || typeof result === 'number' || 'count' in result) {
            return result
          }

          // Handle array or single result
          const items = Array.isArray(result) ? result : [result]

          await Promise.all(
            items.map(async (item: Record<string, unknown>) => {
              // If it has an `integrity` field, verify it's integrity
              let skipIntegrityAndDecryption = false
              if (model in modelWithHmacIntegrity) {
                const fields = modelWithHmacIntegrity[model as keyof typeof modelWithHmacIntegrity]
                // Create object to hold fields that should be covered by integrity
                const integrityCovered: Record<string, unknown> = {}

                // Iterate through all configured fields for this model
                for (const [fieldName, fieldSettings] of Object.entries(fields)) {
                  integrityCovered[fieldName] = item[fieldName]

                  // If there is an integrity field that is in args.select with `false` then skip integrity verification & decryption
                  if (fieldSettings.integrity && args.select && args.select[fieldName] === false) {
                    logger.log(`Skipping integrity verification & decryption due to subset of fields queried`)
                    skipIntegrityAndDecryption = true
                    return
                  }

                  // Check if field is required but missing
                  if (!fieldSettings.nullable && item[fieldName] === undefined) {
                    logger.error(
                      `Missing required field ${fieldName} in data, needed for integrity hmac, did your query forget it?`
                    )
                    throw new Error(`Missing required field ${fieldName} in data, needed for integrity hmac`)
                  }
                }

                const integrityToVerify = getHmac(hmacSecret, integrityCovered)
                if (integrityToVerify !== item.integrity) {
                  logger.error('Integrity verification failed', {
                    integrityToVerify,
                    item,
                    args
                  })
                  throw new Error('Integrity verification failed')
                }
              }
              // We passed integrity verification, so we can decrypt the fields
              if (!skipIntegrityAndDecryption) {
                await Promise.all(
                  fields.map(async (field) => {
                    if (item[field] && typeof item[field] === 'string') {
                      item[field] = await decryptToString(item[field] as string)
                    }
                  })
                )
              }
            })
          )

          return result
        }

        return query(args)
      }
    }
  })
}

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy, OnApplicationShutdown {
  constructor(
    configService: ConfigService<Config>,
    private logger: LoggerService,
    @Optional() encryptionService?: EncryptionService
  ) {
    const url = configService.get('database.url')
    super({
      datasources: {
        db: { url }
      }
    })
    if (encryptionService) {
      logger.log('Instantiating Prisma encryption extension')
      Object.assign(this, this.$extends(buildEncryptionExtension(configService, logger, encryptionService)))
    }
  }

  static toPrismaJson<T>(value?: T | null): Prisma.InputJsonValue | Prisma.NullTypes.JsonNull {
    if (value === null || value === undefined) {
      return Prisma.JsonNull
    }

    // Handle basic JSON-serializable types.
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || Array.isArray(value)) {
      return value as Prisma.InputJsonValue
    }

    // For objects, ensure they're JSON-serializable.
    if (typeof value === 'object') {
      try {
        return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue
      } catch (error) {
        throw new ParseException(error)
      }
    }

    return Prisma.JsonNull
  }

  static toStringJson<T>(value?: T | null): string | null {
    if (value) {
      try {
        return JSON.stringify(value)
      } catch (error) {
        throw new ParseException(error)
      }
    }

    return null
  }

  static toJson(value?: string | null) {
    if (value) {
      try {
        return JSON.parse(value)
      } catch (error) {
        throw new ParseException(error)
      }
    }

    return null
  }

  async onModuleInit() {
    this.logger.log('Connecting to Prisma on database module initialization')

    await this.$connect()
  }

  async onModuleDestroy() {
    this.logger.log('Disconnecting from Prisma on module destroy')

    await this.$disconnect()
  }

  // In Prisma v5, the `beforeExit` is no longer available. Instead, we use
  // NestJS' application shutdown to disconnect from the database. The shutdown
  // hooks are called when the process receives a termination event lig SIGhooks
  // are called when the process receives a termination event lig SIGTERM.
  //
  // See also https://www.prisma.io/docs/guides/upgrade-guides/upgrading-versions/upgrading-to-prisma-5#removal-of-the-beforeexit-hook-from-the-library-engine
  onApplicationShutdown(signal: string) {
    this.logger.log('Disconnecting from Prisma on application shutdown', signal)

    // The $disconnect method returns a promise, so ideally we should wait for it
    // to finish. However, the onApplicationShutdown, returns `void` making it
    // impossible to ensure the database will be properly disconnected before
    // the shutdown.
    this.$disconnect()
  }
}
