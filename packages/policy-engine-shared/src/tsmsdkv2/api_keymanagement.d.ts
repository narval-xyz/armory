export class API_KeyManagement {
  /**
   * Create a new Key Management instance, used internally
   * @param {TSMClient} tsmClient
   */
  constructor(tsmClient: TSMClient, _sdkv2: any)
  clientHandle: any
  sdkv2: any
  /**
   * List keys
   * @return {Promise<string[]>}
   */
  listKeys(): Promise<string[]>
  /**
   * Delete key share
   * @param {string} keyID
   * @return {Promise<string>}
   */
  deleteKeyShare(keyID: string): Promise<string>
  /**
   * Delete presignatures
   * @param {string} keyID
   * @return {Promise<string>}
   */
  deletePresignatures(keyID: string): Promise<string>
}
