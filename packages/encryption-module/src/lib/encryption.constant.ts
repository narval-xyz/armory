import { RawAesWrappingSuiteIdentifier } from '@aws-crypto/client-node'

export const DEFAULT_ENCRYPTION_CONTEXT = {
  purpose: 'data-encryption',
  app: 'armory.encryption-module'
}

export const DEFAULT_KEY_NAMESPACE = 'narval.armory.engine'

export const DEFAULT_WRAPPING_SUITE = RawAesWrappingSuiteIdentifier.AES256_GCM_IV12_TAG16_NO_PADDING
