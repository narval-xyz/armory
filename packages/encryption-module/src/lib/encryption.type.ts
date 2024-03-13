import { KmsKeyringNode, RawAesKeyringNode } from '@aws-crypto/client-node'

export type Keyring = RawAesKeyringNode | KmsKeyringNode

export type EncryptionModuleOption = {
  keyring?: Keyring
}
