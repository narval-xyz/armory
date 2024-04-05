import { RawAesWrappingSuiteIdentifier } from '@aws-crypto/client-node'

export const REQUEST_HEADER_API_KEY = 'x-api-key'
export const REQUEST_HEADER_CLIENT_ID = 'x-client-id'
export const REQUEST_HEADER_CLIENT_SECRET = 'x-client-secret'

export const ENCRYPTION_KEY_NAMESPACE = 'armory.vault'
export const ENCRYPTION_KEY_NAME = 'storage-encryption'
export const ENCRYPTION_WRAPPING_SUITE = RawAesWrappingSuiteIdentifier.AES256_GCM_IV12_TAG16_NO_PADDING
