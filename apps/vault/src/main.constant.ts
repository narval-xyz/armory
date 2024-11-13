import { RawAesWrappingSuiteIdentifier } from '@aws-crypto/client-node'
import { adminApiKeySecurity, gnapSecurity } from '@narval/nestjs-shared'

export const REQUEST_HEADER_API_KEY = 'x-api-key'
export const REQUEST_HEADER_AUTHORIZATION = 'Authorization'

export const ENCRYPTION_KEY_NAMESPACE = 'armory.vault'
export const ENCRYPTION_KEY_NAME = 'storage-encryption'
export const ENCRYPTION_WRAPPING_SUITE = RawAesWrappingSuiteIdentifier.AES256_GCM_IV12_TAG16_NO_PADDING

export const GNAP_SECURITY = gnapSecurity()
export const ADMIN_API_KEY_SECURITY = adminApiKeySecurity(REQUEST_HEADER_API_KEY)
