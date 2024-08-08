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
  SigningAlgs,
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

export type {
  AccessToken,
  AccountEntity,
  AccountType,
  Action,
  Address,
  CreateAuthorizationRequest,
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
  UserEntity,
  UserRole,
  ValueOperators
} from '@narval/policy-engine-shared'

export { EntityUtil, Foo, getAddress, toHex } from '@narval/policy-engine-shared'
