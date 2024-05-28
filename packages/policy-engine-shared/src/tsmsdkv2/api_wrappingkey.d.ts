export class API_WrappingKey {
  /**
   * Create a new Wrapping Key instance, used internally
   * @param {TSMClient} tsmClient
   */
  constructor(tsmClient: TSMClient, _sdkv2: any)
  clientHandle: any
  /**
   * Create a new wrapping key
   * @return {Promise<Uint8Array>}
   */
  wrappingKey(): Promise<Uint8Array>
  fingerprint(): Promise<any>
}
