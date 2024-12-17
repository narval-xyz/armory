import { LoggerService } from '@narval/nestjs-shared'
import { publicKeySchema, rsaPublicKeySchema } from '@narval/signature'
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

const JwsdMethodConfigSchema = z.object({
  maxAge: z.number(),
  requiredComponents: z.array(z.string())
})

const HttpSigningConfigSchema = z.object({
  methods: z.object({
    jwsd: JwsdMethodConfigSchema.nullable().optional()
  }),
  allowedUsersJwksUrl: z.string().nullable().optional(),
  allowedUsers: z
    .array(
      z.object({
        userId: z.string(),
        publicKey: publicKeySchema
      })
    )
    .nullable()
    .optional()
})

const LocalAuthConfigSchema = z.object({
  httpSigning: HttpSigningConfigSchema.nullable().optional()
})

const AppLocalAuthConfigSchema = z.object({
  adminApiKeyHash: z.string().nullable().optional()
  // TODO: Add the app-level httpSigning section:
  /**
    # HTTP Signing configuration - this is for Service-level authentication.
    # https://httpsig.org/
    httpSigning:
      # Settings for when THIS service verifies incoming requests
      verification:
        maxAge: 300 # Reject signatures older than 5 minutes
        requiredComponents: # Fail if these aren't included in signature
          - "@method"
          - "@target-uri"
          - "content-digest"

      # [optional]: Known keys for pinning/offline validation
      # If set, ONLY these keys will be accepted.
      allowedUsers:
        # Peer name
        - name: armory
          # [optional] URL of the peer's JWKS endpoint to verify signatures against.
          jwksUrl: https://armory/.well-known/jwks.json
          # [optional] Pin specific keys, instead of jwks endpoint
          publicKeys:
            - kid: "local-dev-armory-instance-1-2024-1"
              kty: "EC"
              crv: "secp256k1"
              alg: "ES256K"
              x: "..."
              y: "..."
   */
})

const TokenValidationVerificationConfigSchema = z.object({
  audience: z.string().nullable().optional(),
  issuer: z.string().nullable().optional(),
  maxTokenAge: z.number().nullable().optional(),
  requireBoundTokens: z.boolean().optional(),
  allowBearerTokens: z.boolean().optional(),
  allowWildcard: z.array(z.string()).nullable().optional()
})

const TokenValidationConfigSchema = z.object({
  disabled: z.boolean().nullable().optional(),
  url: z.string().nullable().optional(),
  jwksUrl: z.string().nullable().optional(),
  publicKey: publicKeySchema.nullable().optional(),
  verification: TokenValidationVerificationConfigSchema.nullable().optional()
})

const OIDCConfigSchema = z.any() // TODO: Define OIDC schema
const OutgoingAuthConfigSchema = z.any() // TODO: Define outgoing auth schema

const AuthConfigSchema = z.object({
  disabled: z.boolean().optional(),
  oidc: OIDCConfigSchema.nullable().optional(),
  local: LocalAuthConfigSchema.nullable().optional(),
  tokenValidation: TokenValidationConfigSchema.nullable().optional(),
  outgoing: OutgoingAuthConfigSchema.nullable().optional()
})

const ClientConfigSchema = z.object({
  name: z.string(),
  baseUrl: z.string().optional(),
  auth: AuthConfigSchema,
  backupPublicKey: rsaPublicKeySchema.optional()
})
const VaultConfigSchema = z.object({
  version: z.coerce.string(),
  env: z.nativeEnum(Env).nullish(),
  port: z.coerce.number().nullish(),
  cors: z.array(z.string()).nullable().optional(),
  baseUrl: z.string().nullish(),
  app: z
    .object({
      id: z.string(),
      auth: z.object({
        disabled: z.boolean(),
        oidc: OIDCConfigSchema.nullable(),
        local: AppLocalAuthConfigSchema.nullable(),
        outgoing: OutgoingAuthConfigSchema.nullable()
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

const LoadConfig = VaultConfigSchema.transform((yaml, ctx) => {
  const appId = process.env.APP_UID || yaml.app?.id
  const databaseUrl = process.env.APP_DATABASE_URL || yaml.database?.url
  const env = process.env.NODE_ENV || yaml.env
  const port = process.env.PORT || yaml.port
  const baseUrl = process.env.BASE_URL || yaml.baseUrl
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
  if (!env) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'NODE_ENV is required'
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

  const clients = Object.entries(yaml.clients || {}).map(([clientId, client]) => ({
    clientId,
    name: client.name,
    backupPublicKey: client.backupPublicKey || null,
    baseUrl: client.baseUrl || null,
    configurationSource: 'declarative',
    auth: {
      disabled: !!client.auth.disabled,
      oidc: client.auth.oidc || null,
      local: client.auth.local
        ? {
            httpSigning: client.auth.local.httpSigning
              ? {
                  methods: {
                    jwsd: client.auth.local.httpSigning.methods.jwsd
                      ? {
                          maxAge: client.auth.local.httpSigning.methods.jwsd.maxAge,
                          requiredComponents: client.auth.local.httpSigning.methods.jwsd.requiredComponents
                        }
                      : null
                  },
                  allowedUsersJwksUrl: client.auth.local.httpSigning.allowedUsersJwksUrl || null,
                  allowedUsers: client.auth.local.httpSigning.allowedUsers || null
                }
              : null
          }
        : null,
      tokenValidation: client.auth.tokenValidation
        ? {
            disabled: !!client.auth.tokenValidation.disabled,
            url: client.auth.tokenValidation.url || null,
            jwksUrl: client.auth.tokenValidation.jwksUrl || null,
            publicKey: client.auth.tokenValidation.publicKey || null,
            verification: client.auth.tokenValidation.verification
              ? {
                  audience: client.auth.tokenValidation.verification.audience || null,
                  issuer: client.auth.tokenValidation.verification.issuer || null,
                  maxTokenAge: client.auth.tokenValidation.verification.maxTokenAge || null,
                  requireBoundTokens: !!client.auth.tokenValidation.verification.requireBoundTokens,
                  allowBearerTokens: !!client.auth.tokenValidation.verification.allowBearerTokens,
                  allowWildcard: client.auth.tokenValidation.verification.allowWildcard || null
                }
              : null
          }
        : null,
      outgoing: client.auth.outgoing || null
    }
  }))

  return {
    version: yaml.version || CONFIG_VERSION_LATEST,
    env,
    port,
    cors: z.array(z.string()).parse(process.env.CORS || yaml.cors || []),
    baseUrl,
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
        // oidc: yaml.app.auth.oidc,
        // outgoing: yaml.app.auth.outgoing,
      }
    },
    keyring: keyringSchema.parse({
      type: process.env.KEYRING_TYPE || yaml.keyring?.type,
      encryptionMasterPassword: process.env.MASTER_PASSWORD || yaml.keyring?.encryptionMasterPassword || null,
      encryptionMasterKey: process.env.MASTER_KEY || yaml.keyring?.encryptionMasterKey || null,
      encryptionMasterAwsKmsArn: process.env.MASTER_AWS_KMS_ARN || yaml.keyring?.encryptionMasterAwsKmsArn || null,
      hmacSecret: process.env.HMAC_SECRET || yaml.keyring?.hmacSecret || null
    }),
    clients
  }
})

export type Config = z.output<typeof LoadConfig>

export const load = (): Config => {
  const configFilePathEnv = process.env.CONFIG_FILE
  const filePath = configFilePathEnv
    ? path.resolve(configFilePathEnv)
    : path.resolve(process.cwd(), 'config/vault-config.yml')
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
