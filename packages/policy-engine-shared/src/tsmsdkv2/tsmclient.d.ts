export class SessionConfig {
  /**
   * Create a session config for dynamic TSM nodes
   * @param {string} sessionID
   * @param {Uint32Array} players
   * @param {Object} dynamicPublicKeys map of public keys
   * @returns {Promise<SessionConfig>} For use when calling methods on TSMClient
   */
  static newSessionConfig(sessionID: string, players: Uint32Array, dynamicPublicKeys: any): Promise<SessionConfig>
  /**
   * Create a session config for static TSM nodes
   * @param {string} sessionID
   * @param {Number} playerCount
   * @returns {Promise<SessionConfig>} For use when calling methods on TSMClient
   */
  static newStaticSessionConfig(sessionID: string, playerCount: number): Promise<SessionConfig>
  /**
   * Create a session config for static TSM nodes with a tenant
   * @param {string} sessionID
   * @param {Number} playerCount
   * @param {Uint8Array} tenantPublicKey
   * @returns {Promise<SessionConfig>} For use when calling methods on TSMClient
   */
  static newStaticSessionConfigWithTenant(
    sessionID: string,
    playerCount: number,
    tenantPublicKey: Uint8Array
  ): Promise<SessionConfig>
  /**
   * Generate a new session ID for use when calling the TSM
   * @return {Promise<string>}
   * @constructor
   */
  static GenerateSessionID(): Promise<string>
}
export class Configuration {
  constructor(url: any)
  /**
   * Authenticate using API Key
   * @param {string} apiKey
   * @return {Promise<>}
   */
  withAPIKeyAuthentication(apiKey: string): Promise<any>
  /**
   * Authenticate using mTLS
   * @param {string} clientKeyPath
   * @param {string} clientCertPath
   * @param {Uint8Array} serverPKIXPublicKey
   * @return {Promise<>}
   */
  withMTLSAuthentication(clientKeyPath: string, clientCertPath: string, serverPKIXPublicKey: Uint8Array): Promise<any>
  /**
   * Authenticate using OIDC Access Token
   * @param {string} accessToken
   * @return {Promise<string>}
   */
  withOIDCAccessTokenAuthentication(accessToken: string): Promise<string>
}
export class TSMClient {
  /**
   * Initialise the TSM client based on the input configuration
   * @param {Configuration} configuration The configuration describing the TSM connection
   * @returns {Promise<TSMClient>}
   */
  static withConfiguration(configuration: Configuration): Promise<TSMClient>
  constructor(clientHandle: any)
  clientHandle: any
  Broadcast(): {
    clientHandle: any
    sdkv2: any
    simpleBroadcast(sessionConfig: SessionConfig, message: Uint8Array): Promise<any>
    advancedBroadcast(sessionConfig: SessionConfig, message: Uint8Array): Promise<any>
  }
  ECDSA(): {
    clientHandle: any
    sdkv2: any
    generateKey(
      sessionConfig: SessionConfig,
      threshold: number,
      curveName: string,
      desiredKeyID?: string
    ): Promise<string>
    generatePresignatures(sessionConfig: SessionConfig, keyID: string, presignatureCount: number): Promise<string[]>
    sign(
      sessionConfig: SessionConfig,
      keyID: string,
      derivationPath: Uint32Array,
      message: Uint8Array
    ): Promise<Uint8Array>
    signWithPresignature(
      keyID: string,
      presignatureID: string,
      derivationPath: Uint32Array,
      message: Uint8Array
    ): Promise<{
      partialSignature: Uint8Array
      presignatureID: string
    }>
    generateRecoveryData(
      sessionConfig: SessionConfig,
      keyID: string,
      ersPublicKey: Uint8Array,
      ersLabel: Uint8Array
    ): Promise<Uint8Array>
    publicKey(keyID: string, derivationPath?: Uint32Array): Promise<Uint8Array>
    chainCode(keyID: string, derivationPath?: Uint32Array): Promise<Uint8Array>
    reshare(sessionConfig: SessionConfig, keyID: string): Promise<string>
    backupKeyShare(keyID: string): Promise<Uint8Array>
    restoreKeyShare(keyShareBackup: Uint8Array): Promise<string>
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
    importKeyShares(
      sessionConfig: SessionConfig,
      threshold: number,
      wrappedKeyShare: Uint8Array,
      wrappedChainCode: Uint8Array,
      pkixPublicKey: Uint8Array,
      desiredKeyID: string
    ): Promise<string>
    bip32GenerateSeed(sessionConfig: SessionConfig, threshold: number): Promise<string>
    bip32DeriveFromSeed(sessionConfig: SessionConfig, seedID: string): Promise<string>
    bip32DeriveFromKey(sessionConfig: SessionConfig, parentKeyID: string, bip32PathElement: number): Promise<string>
    bip32ConvertKey(sessionConfig: SessionConfig, bip32PKeyID: string): Promise<string>
    bip32ImportSeed(
      sessionConfig: SessionConfig,
      threshold: number,
      wrappedSeedShare: Uint8Array,
      seedWitness: Uint8Array
    ): Promise<string>
    bip32ExportSeed(
      sessionConfig: SessionConfig,
      seedID: string,
      wrappingKey: Uint8Array
    ): Promise<{
      wrappedSeedShare: Uint8Array
      seedWitness: Uint8Array
    }>
    bip32Info(keyID: string): Promise<{
      keyType: string
      bip32Path: Uint32Array
      parentKeyID: string
    }>
    finalizeSignature(
      message: Uint8Array,
      partialSignatures: Uint8Array[]
    ): Promise<{
      signature: Uint8Array
      recoveryID: number
    }>
    verifySignature(pkixPublicKey: Uint8Array, message: Uint8Array, signature: Uint8Array): Promise<string>
    derivePublicKey(pkixPublicKey: Uint8Array, chainCode: Uint8Array, derivationPath: Uint32Array): Promise<Uint8Array>
    deriveChainCode(pkixPublicKey: Uint8Array, chainCode: Uint8Array, derivationPath: Uint32Array): Promise<Uint8Array>
    finalizeRecoveryData(
      partialRecoveryData: Uint8Array[],
      ersPublicKey: Uint8Array,
      ersLabel: Uint8Array
    ): Promise<Uint8Array>
    validateRecoveryData(
      recoveryData: Uint8Array,
      pkixPublicKey: Uint8Array,
      ersPublicKey: Uint8Array,
      ersLabel: Uint8Array
    ): Promise<string>
    recoverPrivateKey(
      recoveryData: Uint8Array,
      ersPrivateKey: Uint8Array,
      ersLabel: Uint8Array
    ): Promise<{
      privateKey: Uint8Array
      chainCode: Uint8Array
    }>
  }
  KeyManagement(): {
    clientHandle: any
    sdkv2: any
    listKeys(): Promise<string[]>
    deleteKeyShare(keyID: string): Promise<string>
    deletePresignatures(keyID: string): Promise<string>
  }
  Schnorr(): {
    clientHandle: any
    sdkv2: any
    generateKey(
      sessionConfig: SessionConfig,
      threshold: number,
      curveName: string,
      desiredKeyID?: string
    ): Promise<string>
    generatePresignatures(sessionConfig: SessionConfig, keyID: string, presignatureCount: number): Promise<string[]>
    sign(
      sessionConfig: SessionConfig,
      keyID: string,
      derivationPath: Uint32Array,
      message: Uint8Array
    ): Promise<{
      partialSignature: Uint8Array
    }>
    sign(sessionConfig: SessionConfig, keyID: string, derivationPath: Uint32Array, message: string): Promise<Uint8Array>
    signWithPresignature(
      keyID: string,
      presignatureID: string,
      derivationPath: Uint32Array,
      message: Uint8Array
    ): Promise<{
      partialSignature: Uint8Array
      presignatureID: string
    }>
    generateRecoveryData(
      sessionConfig: SessionConfig,
      keyID: string,
      ersPublicKey: Uint8Array,
      ersLabel: Uint8Array
    ): Promise<Uint8Array>
    publicKey(keyID: string, derivationPath?: Uint32Array): Promise<Uint8Array>
    chainCode(keyID: string, derivationPath?: Uint32Array): Promise<Uint8Array>
    reshare(sessionConfig: SessionConfig, keyID: string): Promise<string>
    backupKeyShare(keyID: string): Promise<Uint8Array>
    restoreKeyShare(keyShareBackup: Uint8Array): Promise<string>
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
    importKeyShares(
      sessionConfig: SessionConfig,
      threshold: number,
      wrappedKeyShare: Uint8Array,
      wrappedChainCode: Uint8Array,
      pkixPublicKey: Uint8Array,
      desiredKeyID: string
    ): Promise<string>
    finalizeSignature(
      message: Uint8Array,
      partialSignatures: Uint8Array[]
    ): Promise<{
      signature: Uint8Array
      recoveryID: number
    }>
    verifySignature(pkixPublicKey: Uint8Array, message: Uint8Array, signature: Uint8Array): Promise<string>
    derivePublicKey(pkixPublicKey: Uint8Array, chainCode: Uint8Array, derivationPath: Uint32Array): Promise<Uint8Array>
    deriveChainCode(pkixPublicKey: Uint8Array, chainCode: Uint8Array, derivationPath: Uint32Array): Promise<Uint8Array>
    finalizeRecoveryData(
      partialRecoveryData: Uint8Array[],
      ersPublicKey: Uint8Array,
      ersLabel: Uint8Array
    ): Promise<Uint8Array>
    validateRecoveryData(
      recoveryData: Uint8Array,
      pkixPublicKey: Uint8Array,
      ersPublicKey: Uint8Array,
      ersLabel: Uint8Array
    ): Promise<string>
    recoverPrivateKey(
      recoveryData: Uint8Array,
      ersPrivateKey: Uint8Array,
      ersLabel: Uint8Array
    ): Promise<{
      recoveredPrivateKey: Uint8Array
      recoveredChainCode: Uint8Array
    }>
  }
  Utils(): {
    sdkv2: any
    generateECDSAKeyPair(curveName: any): Promise<{
      pkcs8PrivateKey: Uint8Array
      spkiPublicKey: Uint8Array
    }>
    pkixPublicKeyToUncompressedPoint(spkiPublicKey: Uint8Array): Promise<Uint8Array>
    pkixPublicKeyToCompressedPoint(spkiPublicKey: Uint8Array): Promise<Uint8Array>
    ecPointToPKIXPublicKey(curveName: string, ecPoint: Uint8Array): Promise<Uint8Array>
    shamirSecretShare(
      threshold: number,
      players: Uint32Array,
      curveName: string,
      value: Uint8Array
    ): Promise<Map<any, any>>
    wrap(spkiPublicKey: Uint8Array, value: Uint8Array): Promise<Uint8Array>
    unwrap(pkcs8PrivateKey: Uint8Array, wrappedValue: Uint8Array): Promise<Uint8Array>
  }
  WrappingKey(): {
    clientHandle: any
    wrappingKey(): Promise<Uint8Array>
    fingerprint(): Promise<any>
  }
  #private
}
export namespace curves {
  let SECP256K1: string
  let ED448: string
  let ED25519: string
}
