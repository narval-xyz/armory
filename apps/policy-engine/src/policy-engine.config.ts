import { LoggerService } from '@narval/nestjs-shared'
import { privateKeySchema, publicKeySchema, SigningAlg } from '@narval/signature'
import fs from 'fs'
import path from 'path'
import { parse } from 'yaml'
import { z } from 'zod'

export enum Env {
  DEVELOPMENT = 'development',
  TEST = 'test',
  PRODUCTION = 'production'
}

const CONFIG_VERSION_LATEST = '1'
const logger = new LoggerService()

const AppLocalAuthConfigSchema = z.object({
  adminApiKeyHash: z.string().nullable().optional()
  // TODO: Add the app-level httpSigning section:
})

const LocalAuthConfigSchema = z.object({
  clientSecret: z.string().nullish()
})

const AuthConfigSchema = z.object({
  disabled: z.boolean().optional(),
  local: LocalAuthConfigSchema.nullable().optional()
})

const DataStoreConfigSchema = z.object({
  entity: z.object({
    data: z.object({
      type: z.enum(['HTTP', 'HTTPS']),
      url: z.string()
    }),
    signature: z.object({
      type: z.enum(['HTTP', 'HTTPS']),
      url: z.string()
    }),
    publicKeys: z.array(publicKeySchema)
  }),
  policy: z.object({
    data: z.object({
      type: z.enum(['HTTP', 'HTTPS']),
      url: z.string()
    }),
    signature: z.object({
      type: z.enum(['HTTP', 'HTTPS']),
      url: z.string()
    }),
    publicKeys: z.array(publicKeySchema)
  })
})

const SignerConfigSchema = z.object({
  alg: z.nativeEnum(SigningAlg).optional(),
  keyId: z.string().optional(),
  publicKey: publicKeySchema.optional(),
  privateKey: privateKeySchema.optional()
})

const ClientConfigSchema = z.object({
  name: z.string(),
  baseUrl: z.string().optional(),
  auth: AuthConfigSchema,
  dataStore: DataStoreConfigSchema,
  decisionAttestation: z.object({
    disabled: z.boolean().optional(),
    signer: SignerConfigSchema.optional()
  })
})
const PolicyEngineConfigSchema = z.object({
  version: z.coerce.string(),
  env: z.nativeEnum(Env).nullish(),
  port: z.coerce.number().nullish(),
  cors: z.array(z.string()).nullish(),
  baseUrl: z.string().nullish(),
  resourcePath: z.string().nullish(),
  app: z
    .object({
      id: z.string(),
      auth: z.object({
        disabled: z.boolean(),
        local: AppLocalAuthConfigSchema.nullable()
      })
    })
    .nullish(),
  database: z
    .object({
      url: z.string()
    })
    .nullish(),
  keyring: z
    .object({
      type: z.enum(['raw', 'awskms']),
      encryptionMasterPassword: z.string().nullable().optional(),
      encryptionMasterKey: z.string().nullable().optional(),
      encryptionMasterAwsKmsArn: z.string().nullable().optional(),
      hmacSecret: z.string().nullable().optional()
    })
    .nullish(),
  decisionAttestation: z
    .object({
      protocol: z.union([z.literal('simple'), z.literal('mpc')]).nullish(),
      tsm: z
        .object({
          url: z.string(),
          apiKey: z.string(),
          playerCount: z.coerce.number().default(3)
        })
        .nullish()
        .describe('Only required when protocol is mpc. The TSM SDK node config.')
    })
    .nullish(),
  clients: z.record(z.string(), ClientConfigSchema).nullish()
})

const keyringSchema = z.union([
  z.object({
    type: z.literal('raw'),
    encryptionMasterPassword: z.string(),
    encryptionMasterKey: z.string().nullable(),
    hmacSecret: z.string().nullable()
  }),
  z.object({
    type: z.literal('awskms'),
    encryptionMasterAwsKmsArn: z.string(),
    hmacSecret: z.string().nullable()
  })
])

const LoadConfig = PolicyEngineConfigSchema.transform((yaml, ctx) => {
  const appId = process.env.APP_UID || yaml.app?.id
  const databaseUrl = process.env.APP_DATABASE_URL || yaml.database?.url
  const env = z.nativeEnum(Env).parse(process.env.NODE_ENV || yaml.env)
  const port = process.env.PORT || yaml.port
  const baseUrl = process.env.BASE_URL || yaml.baseUrl
  const resourcePath = process.env.RESOURCE_PATH || yaml.resourcePath

  if (!appId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'APP_UID is required'
    })
    return z.NEVER
  }
  if (!databaseUrl) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'APP_DATABASE_URL is required'
    })
    return z.NEVER
  }
  if (!port) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'PORT is required'
    })
    return z.NEVER
  }
  if (!baseUrl) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'BASE_URL is required'
    })
    return z.NEVER
  }
  if (!resourcePath) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'RESOURCE_PATH is required'
    })
    return z.NEVER
  }

  // TODO: add Clients

  // process.env.SIGNING_PROTOCOL is for backwards-compatibility
  const signingProtocol =
    process.env.SIGNING_PROTOCOL ||
    process.env.DECISION_ATTESTATION_PROTOCOL ||
    yaml.decisionAttestation?.protocol ||
    null
  let tsmConfig = null
  if (signingProtocol === 'mpc') {
    const tsmUrl = process.env.TSM_URL || yaml.decisionAttestation?.tsm?.url
    const tsmApiKey = process.env.TSM_API_KEY || yaml.decisionAttestation?.tsm?.apiKey
    const tsmPlayerCount = process.env.TSM_PLAYER_COUNT || yaml.decisionAttestation?.tsm?.playerCount
    if (!tsmUrl || !tsmApiKey || !tsmPlayerCount) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'TSM_URL, TSM_API_KEY, and TSM_PLAYER_COUNT are required when attestation is enabled and signingProtocol is mpc'
      })
      return z.NEVER
    }
    tsmConfig = {
      url: tsmUrl,
      apiKey: tsmApiKey,
      playerCount: z.coerce.number().parse(tsmPlayerCount)
    }
  }

  const clients = Object.entries(yaml.clients || {}).map(([clientId, client]) => ({
    clientId,
    name: client.name,
    baseUrl: client.baseUrl || null,
    configurationSource: 'declarative',
    auth: {
      disabled: !!client.auth.disabled,
      local: client.auth.local
        ? {
            clientSecret: client.auth.local.clientSecret || null
          }
        : null
    },
    dataStore: client.dataStore,
    decisionAttestation: client.decisionAttestation
      ? {
          disabled: !!client.decisionAttestation.disabled,
          signer: {
            alg: client.decisionAttestation.signer?.alg || SigningAlg.EIP191,
            keyId: client.decisionAttestation.signer?.keyId || null,
            publicKey: client.decisionAttestation.signer?.publicKey || undefined,
            privateKey: client.decisionAttestation.signer?.privateKey || undefined
          }
        }
      : { disabled: true }
  }))

  return {
    version: yaml.version || CONFIG_VERSION_LATEST,
    env,
    port,
    cors: z.array(z.string()).parse(process.env.CORS || yaml.cors || []),
    baseUrl,
    resourcePath,
    database: {
      url: databaseUrl
    },

    app: {
      id: appId,
      auth: {
        disabled: yaml.app?.auth.disabled || false,
        local:
          yaml.app?.auth.local || process.env.ADMIN_API_KEY
            ? {
                adminApiKeyHash: yaml.app?.auth.local?.adminApiKeyHash || process.env.ADMIN_API_KEY || null
              }
            : null
      }
    },
    keyring: keyringSchema.parse({
      type: process.env.KEYRING_TYPE || yaml.keyring?.type,
      encryptionMasterPassword: process.env.MASTER_PASSWORD || yaml.keyring?.encryptionMasterPassword || null,
      encryptionMasterKey: process.env.MASTER_KEY || yaml.keyring?.encryptionMasterKey || null,
      encryptionMasterAwsKmsArn: process.env.MASTER_AWS_KMS_ARN || yaml.keyring?.encryptionMasterAwsKmsArn || null,
      hmacSecret: process.env.HMAC_SECRET || yaml.keyring?.hmacSecret || null
    }),
    decisionAttestation: {
      protocol: signingProtocol,
      tsm: tsmConfig
    },
    clients
  }
})

export type Config = z.infer<typeof LoadConfig>

export const load = (): Config => {
  const configFilePathEnv = process.env.CONFIG_FILE_ABSOLUTE_PATH
  const configFileRelativePathEnv = process.env.CONFIG_FILE_RELATIVE_PATH
  const filePath = configFilePathEnv
    ? path.resolve(configFilePathEnv)
    : path.resolve(process.cwd(), configFileRelativePathEnv || 'config/policy-engine-config.yaml')
  let yamlConfigRaw = {}
  try {
    if (fs.existsSync(filePath)) {
      const fileContents = fs.readFileSync(filePath, 'utf8')
      yamlConfigRaw = parse(fileContents)
    }
    // If file doesn't exist, we'll use empty object as default
  } catch (error) {
    logger.warn(`Warning: Could not read config file at ${filePath}: ${error.message}`)
    // Continue with empty config
  }

  const result = LoadConfig.safeParse(yamlConfigRaw)

  if (result.success) {
    return result.data
  }

  throw new Error(`Invalid application configuration: ${result.error.message}`)
}

export const getEnv = (): Env => {
  return z.nativeEnum(Env).parse(process.env.NODE_ENV)
}
