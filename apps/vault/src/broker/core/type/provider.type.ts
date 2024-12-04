// How to build a credential with the right private key Alg?
//
// Pass the input type that's part of the CreateConnection
// Get a provider specific credential
export interface CredentialBuilder<Input, Credential> {
  build(input: Input): Promise<Credential>
}
