export class API_Broadcast {
  /**
   * Create a new Key Management instance, used internally
   * @param {TSMClient} tsmClient
   */
  constructor(tsmClient: TSMClient, _sdkv2: any)
  clientHandle: any
  sdkv2: any
  /**
   * Simple broadcast, one round, less secure
   * @param {SessionConfig} sessionConfig
   * @param {Uint8Array} message
   * @return {Promise<Object>}
   */
  simpleBroadcast(sessionConfig: SessionConfig, message: Uint8Array): Promise<any>
  /**
   * Advanced broadcast, two rounds round, more secure
   * @param {SessionConfig} sessionConfig
   * @param {Uint8Array} message
   * @return {Promise<Object>}
   */
  advancedBroadcast(sessionConfig: SessionConfig, message: Uint8Array): Promise<any>
}
