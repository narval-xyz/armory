export * from './lib/auth'
export * from './lib/data-store'
export * from './lib/domain'
export * from './lib/http'
export * from './lib/sdk'
export * from './lib/shared/promise'
export * from './lib/types'
export * from './lib/vault'

export { resourceId } from './lib/utils'

export type { Alg, PrivateKey, PublicKey, RsaPublicKey, SigningAlg } from '@narval/signature'

export {
  base64UrlToHex,
  buildSignerEip191,
  buildSignerForAlg,
  eip191Hash,
  getPublicKey,
  hash,
  hexToBase64Url,
  jwkSchema,
  privateKeyToJwk,
  publicKeyToJwk,
  signJwt
} from '@narval/signature'

export {
  AccessToken,
  AccountType,
  Action,
  CreateAuthorizationRequest,
  Criterion,
  Decision,
  Eip712TypedData,
  EntityType,
  JwtString,
  Request,
  Then,
  TransactionRequest,
  UserRole,
  ValueOperators
} from '@narval/policy-engine-shared'

export type {
  AccountEntity,
  Address,
  Entities,
  Hex,
  Policy,
  PolicyCriterion,
  UserEntity
} from '@narval/policy-engine-shared'

export { EntityUtil, getAddress, toHex } from '@narval/policy-engine-shared'
