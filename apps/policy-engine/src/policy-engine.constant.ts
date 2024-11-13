import { RawAesWrappingSuiteIdentifier } from '@aws-crypto/client-node'
import {
  REQUEST_HEADER_CLIENT_ID,
  REQUEST_HEADER_CLIENT_SECRET,
  adminApiKeySecurity,
  clientIdSecurity,
  clientSecretSecurity
} from '@narval/nestjs-shared'

//
// Headers
//

export const REQUEST_HEADER_API_KEY = 'x-api-key'
export const REQUEST_HEADER_SESSION_ID = 'x-session-id'

//
// Encryption
//

export const ENCRYPTION_KEY_NAMESPACE = 'armory.policy-engine'
export const ENCRYPTION_KEY_NAME = 'storage-encryption'
export const ENCRYPTION_WRAPPING_SUITE = RawAesWrappingSuiteIdentifier.AES256_GCM_IV12_TAG16_NO_PADDING

//
// API Security
//

export const ADMIN_SECURITY = adminApiKeySecurity(REQUEST_HEADER_API_KEY)
export const CLIENT_ID_SECURITY = clientIdSecurity(REQUEST_HEADER_CLIENT_ID)
export const CLIENT_SECRET_SECURITY = clientSecretSecurity(REQUEST_HEADER_CLIENT_SECRET)
