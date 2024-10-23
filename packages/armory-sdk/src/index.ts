export * from './lib/auth'
export * from './lib/data-store'
export * from './lib/domain'
export * from './lib/http'
export * from './lib/sdk'
export * from './lib/shared/promise'
export * from './lib/types'
export * from './lib/vault'

export { AuthorizationResponseDtoStatusEnum } from './lib/http/client/auth'
export type { CreateClientResponseDto } from './lib/http/client/auth'
export type { ClientDto, WalletDto } from './lib/http/client/vault'
export type { Signer } from './lib/shared/type'
export { resourceId } from './lib/utils'

export type { Jwk, PrivateKey, PublicKey, RsaPublicKey } from '@narval/signature'

export {
  Alg,
  Curves,
  KeyTypes,
  SigningAlg,
  base64UrlToHex,
  buildSignerEip191,
  buildSignerForAlg,
  eip191Hash,
  generateJwk,
  getPublicKey,
  hash,
  hexToBase64Url,
  jwkEoaSchema,
  jwkSchema,
  privateKeyToJwk,
  publicKeySchema,
  publicKeyToJwk,
  rsaKeyToKid,
  rsaPublicKeySchema,
  signJwt
} from '@narval/signature'

export type {
  AccountEntity,
  Address,
  CredentialEntity,
  Decision,
  Entities,
  EvaluationRequest,
  Hex,
  Policy,
  PolicyCriterion,
  UserAccountEntity,
  UserEntity
} from '@narval/policy-engine-shared'

export {
  AccessToken,
  AccountType,
  Action,
  CreateAuthorizationRequest,
  Criterion,
  Eip712TypedData,
  EntityData,
  EntityStore,
  EntityType,
  EntityUtil,
  JwtString,
  PolicyData,
  PolicyStore,
  Request,
  Then,
  TransactionRequest,
  UserRole,
  ValueOperators,
  getAddress,
  hexSchema,
  isAddress,
  toHex
} from '@narval/policy-engine-shared'
