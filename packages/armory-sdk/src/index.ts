export * from './lib/auth'
export * from './lib/data-store'
export * from './lib/domain'
export * from './lib/http'
export * from './lib/sdk'
export * from './lib/shared/promise'
export * from './lib/types'
export * from './lib/vault'

export { resourceId } from './lib/utils'

export type { Alg, PrivateKey, PublicKey, RsaPublicKey } from '@narval/signature'

export {
  Curves,
  KeyTypes,
  SigningAlg,
  base64UrlToHex,
  buildSignerEip191,
  buildSignerForAlg,
  eip191Hash,
  getPublicKey,
  hash,
  hexToBase64Url,
  jwkEoaSchema,
  jwkSchema,
  privateKeyToJwk,
  publicKeySchema,
  publicKeyToJwk,
  signJwt
} from '@narval/signature'

export type {
  AccessToken,
  AccountEntity,
  Address,
  CreateAuthorizationRequest,
  CredentialEntity,
  Criterion,
  Decision,
  Eip712TypedData,
  Entities,
  EntityType,
  Hex,
  JwtString,
  Policy,
  PolicyCriterion,
  Request,
  Then,
  TransactionRequest,
  UserAccountEntity,
  UserEntity,
  ValueOperators,
} from '@narval/policy-engine-shared'

export {
  AccountType,
  Action,
  EntityUtil,
  UserRole,
  getAddress,
  hexSchema,
  isAddress,
  toHex
} from '@narval/policy-engine-shared'
