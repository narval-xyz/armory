import { RawAesWrappingSuiteIdentifier } from '@aws-crypto/client-node'

//
// Headers
//

export const REQUEST_HEADER_SESSION_ID = 'x-session-id'

//
// Encryption
//

export const ENCRYPTION_KEY_NAMESPACE = 'armory.policy-engine'
export const ENCRYPTION_KEY_NAME = 'storage-encryption'
export const ENCRYPTION_WRAPPING_SUITE = RawAesWrappingSuiteIdentifier.AES256_GCM_IV12_TAG16_NO_PADDING
