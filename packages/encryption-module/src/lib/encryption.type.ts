import { KmsKeyringNode, RawAesKeyringNode } from '@aws-crypto/client-node'
export type EncryptionModuleOption = {
  keyring: RawAesKeyringNode | KmsKeyringNode
}
