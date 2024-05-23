export class API_ECDSA {
  /**
   * Create a new ECDSA instance, used internally
   * @param {TSMClient} tsmClient
   */
  constructor(tsmClient: TSMClient, _sdkv2: any)
  clientHandle: any
  sdkv2: any
  /**
   * Generate a new key in the TSM
   * @param {SessionConfig} sessionConfig
   * @param {Number} threshold
   * @param {string} curveName
   * @param {string} desiredKeyID
   * @return {Promise<string>} KeyID
   */
  generateKey(
    sessionConfig: SessionConfig,
    threshold: number,
    curveName: string,
    desiredKeyID?: string
  ): Promise<string>
  /**
   * Generate presignatureCount new presignatures
   * @param {SessionConfig} sessionConfig
   * @param {string} keyID
   * @param {Number} presignatureCount
   * @return {Promise<string[]>}
   */
  generatePresignatures(sessionConfig: SessionConfig, keyID: string, presignatureCount: number): Promise<string[]>
  /**
   * Create a partial signature
   * @param {SessionConfig} sessionConfig
   * @param {string} keyID
   * @param {Uint32Array} derivationPath
   * @param {Uint8Array} message
   * @return {Promise<{"partialSignature": Uint8Array}>}
   */
  sign(
    sessionConfig: SessionConfig,
    keyID: string,
    derivationPath: Uint32Array,
    message: Uint8Array
  ): Promise<Uint8Array>

  /**
   * Use an existing presignature to create a partial signature
   * @param {string} keyID
   * @param {string} presignatureID
   * @param {Uint32Array} derivationPath
   * @param {Uint8Array} message
   * @return {Promise<{"partialSignature": Uint8Array, "presignatureID": string}>}
   */
  signWithPresignature(
    keyID: string,
    presignatureID: string,
    derivationPath: Uint32Array,
    message: Uint8Array
  ): Promise<{
    partialSignature: Uint8Array
    presignatureID: string
  }>
  /**
   * Generate partial recovery data used to recover private key in case of emergency
   * @param {SessionConfig} sessionConfig
   * @param {string} keyID
   * @param {Uint8Array} ersPublicKey
   * @param {Uint8Array} ersLabel
   * @return {Promise<Uint8Array>}
   */
  generateRecoveryData(
    sessionConfig: SessionConfig,
    keyID: string,
    ersPublicKey: Uint8Array,
    ersLabel: Uint8Array
  ): Promise<Uint8Array>
  /**
   * Fetch the pkix public key belonging to keyID, derived by the derivationPath
   * @param {string} keyID
   * @param {Uint32Array} derivationPath
   * @return {Promise<Uint8Array>}
   */
  publicKey(keyID: string, derivationPath?: Uint32Array): Promise<Uint8Array>
  /**
   * Fetch the chain code belonging to keyID, derived by the derivationPath
   * @param {string} keyID
   * @param {Uint32Array} derivationPath
   * @return {Promise<Uint8Array>}
   */
  chainCode(keyID: string, derivationPath?: Uint32Array): Promise<Uint8Array>
  /**
   * Reshuffle the key shares belonging to keyID
   * @param {SessionConfig} sessionConfig
   * @param {string} keyID
   * @return {Promise<string>}
   */
  reshare(sessionConfig: SessionConfig, keyID: string): Promise<string>
  /**
   * Create a backup of a single key share
   * @param {string} keyID
   * @return {Promise<Uint8Array>}
   */
  backupKeyShare(keyID: string): Promise<Uint8Array>
  /**
   * Restore a key share backup
   * @param {Uint8Array} keyShareBackup
   * @return {Promise<string>} The restored keyID
   */
  restoreKeyShare(keyShareBackup: Uint8Array): Promise<string>
  /**
   * Export encrypted key shares
   * @param {SessionConfig} sessionConfig
   * @param {string} keyID
   * @param {Uint32Array} derivationPath
   * @param {Uint8Array} wrappingKey
   * @return {Promise<{"wrappedKeyShare": Uint8Array, "wrappedChainCode": Uint8Array, "pkixPublicKey": Uint8Array}>}
   */
  exportKeyShares(
    sessionConfig: SessionConfig,
    keyID: string,
    derivationPath: Uint32Array,
    wrappingKey: Uint8Array
  ): Promise<{
    wrappedKeyShare: Uint8Array
    wrappedChainCode: Uint8Array
    pkixPublicKey: Uint8Array
  }>
  /**
   * Import key shares
   * @param {SessionConfig} sessionConfig
   * @param {Number} threshold
   * @param {Uint8Array} wrappedKeyShare
   * @param {Uint8Array} wrappedChainCode
   * @param {Uint8Array} pkixPublicKey
   * @param {string} desiredKeyID
   * @return {Promise<string>} The restored keyID
   */
  importKeyShares(
    sessionConfig: SessionConfig,
    threshold: number,
    wrappedKeyShare: Uint8Array,
    wrappedChainCode: Uint8Array,
    pkixPublicKey: Uint8Array,
    desiredKeyID: string
  ): Promise<string>
  /**
   * Generate BIP-32 seed
   * @param {SessionConfig} sessionConfig
   * @param {Number} threshold
   * @return {Promise<string>} seedID
   */
  bip32GenerateSeed(sessionConfig: SessionConfig, threshold: number): Promise<string>
  /**
   * Derive BIP-32 key from seed
   * @param {SessionConfig} sessionConfig
   * @param {string} seedID
   * @return {Promise<string>} bip32KeyID
   */
  bip32DeriveFromSeed(sessionConfig: SessionConfig, seedID: string): Promise<string>
  /**
   * Derive BIP-32 key from parent key
   * @param {SessionConfig} sessionConfig
   * @param {string} parentKeyID
   * @param {Number} bip32PathElement
   * @return {Promise<string>}
   */
  bip32DeriveFromKey(sessionConfig: SessionConfig, parentKeyID: string, bip32PathElement: number): Promise<string>
  /**
   * Convert BIP-32 key
   * @param {SessionConfig} sessionConfig
   * @param {string} bip32PKeyID
   * @return {Promise<string>} keyID
   */
  bip32ConvertKey(sessionConfig: SessionConfig, bip32PKeyID: string): Promise<string>
  /**
   * Import BIP-32 seed
   * @param {SessionConfig} sessionConfig
   * @param {Number} threshold
   * @param {Uint8Array} wrappedSeedShare
   * @param {Uint8Array} seedWitness
   * @return {Promise<string>} seedID
   */
  bip32ImportSeed(
    sessionConfig: SessionConfig,
    threshold: number,
    wrappedSeedShare: Uint8Array,
    seedWitness: Uint8Array
  ): Promise<string>
  /**
   *
   * @param {SessionConfig} sessionConfig
   * @param {string} seedID
   * @param {Uint8Array} wrappingKey
   * @return {Promise<{"wrappedSeedShare": Uint8Array, "seedWitness": Uint8Array}>}
   */
  bip32ExportSeed(
    sessionConfig: SessionConfig,
    seedID: string,
    wrappingKey: Uint8Array
  ): Promise<{
    wrappedSeedShare: Uint8Array
    seedWitness: Uint8Array
  }>
  /**
   * Get BIP-32 information
   * @param {string} keyID
   * @return {Promise<{"keyType": string, "bip32Path": Uint32Array, "parentKeyID": string}>}
   */
  bip32Info(keyID: string): Promise<{
    keyType: string
    bip32Path: Uint32Array
    parentKeyID: string
  }>
  /**
   * Finalize a signature, based on partial signatures
   * @param {Uint8Array} message
   * @param {Uint8Array[]} partialSignatures
   * @return {Promise<{"signature": Uint8Array, "recoveryID": Number}>}
   */
  finalizeSignature(
    message: Uint8Array,
    partialSignatures: Uint8Array[]
  ): Promise<{
    signature: Uint8Array
    recoveryID: number
  }>
  /**
   * Verify signature
   * @param {Uint8Array} pkixPublicKey
   * @param {Uint8Array} message
   * @param {Uint8Array} signature
   * @return {Promise<string>}
   */
  verifySignature(pkixPublicKey: Uint8Array, message: Uint8Array, signature: Uint8Array): Promise<string>
  /**
   * Derive public key
   * @param {Uint8Array} pkixPublicKey
   * @param {Uint8Array} chainCode
   * @param {Uint32Array} derivationPath
   * @return {Promise<Uint8Array>}
   */
  derivePublicKey(pkixPublicKey: Uint8Array, chainCode: Uint8Array, derivationPath: Uint32Array): Promise<Uint8Array>
  /**
   * Derive Chain Code
   * @param {Uint8Array} pkixPublicKey
   * @param {Uint8Array} chainCode
   * @param {Uint32Array} derivationPath
   * @return {Promise<Uint8Array>}
   */
  deriveChainCode(pkixPublicKey: Uint8Array, chainCode: Uint8Array, derivationPath: Uint32Array): Promise<Uint8Array>
  /**
   * Finalize recovery data
   * @param {Uint8Array[]} partialRecoveryData
   * @param {Uint8Array} ersPublicKey
   * @param {Uint8Array} ersLabel
   * @return {Promise<Uint8Array>}
   */
  finalizeRecoveryData(
    partialRecoveryData: Uint8Array[],
    ersPublicKey: Uint8Array,
    ersLabel: Uint8Array
  ): Promise<Uint8Array>
  /**
   * Validate recovery data
   * @param {Uint8Array} recoveryData
   * @param {Uint8Array} pkixPublicKey
   * @param {Uint8Array} ersPublicKey
   * @param {Uint8Array} ersLabel
   * @return {Promise<string>}
   */
  validateRecoveryData(
    recoveryData: Uint8Array,
    pkixPublicKey: Uint8Array,
    ersPublicKey: Uint8Array,
    ersLabel: Uint8Array
  ): Promise<string>
  /**
   * Recover private key
   * @param {Uint8Array} recoveryData
   * @param {Uint8Array} ersPrivateKey
   * @param {Uint8Array} ersLabel
   * @return {Promise<{"privateKey": Uint8Array, "chainCode": Uint8Array}>}
   */
  recoverPrivateKey(
    recoveryData: Uint8Array,
    ersPrivateKey: Uint8Array,
    ersLabel: Uint8Array
  ): Promise<{
    privateKey: Uint8Array
    chainCode: Uint8Array
  }>
}
