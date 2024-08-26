import {
  AuthClient,
  AuthConfig,
  DataStoreConfig,
  EntityStoreClient,
  PolicyStoreClient,
  VaultClient,
  VaultConfig,
  resourceId
} from '@narval-xyz/armory-sdk'
import { v4 } from 'uuid'
import { toAccount } from 'viem/accounts'
import {
  Action,
  Address,
  Eip712TypedData,
  Request,
  TransactionRequest,
  toHex
} from '../../packages/policy-engine-shared/src'

export type Sdk = {
  authClient: AuthClient
  vaultClient: VaultClient
  entityStoreClient: EntityStoreClient
  policyStoreClient: PolicyStoreClient
}

export const armoryClient = (configs: {
  auth: AuthConfig
  vault: VaultConfig
  entityStore: DataStoreConfig
  policyStore: DataStoreConfig
}): Sdk => {
  const authClient = new AuthClient(configs.auth)
  const vaultClient = new VaultClient(configs.vault)
  const entityStoreClient = new EntityStoreClient(configs.entityStore)
  const policyStoreClient = new PolicyStoreClient(configs.policyStore)

  return {
    authClient,
    vaultClient,
    entityStoreClient,
    policyStoreClient
  }
}

export const armoryUserOperationSigner = (
  { authClient, vaultClient }: { authClient: AuthClient; vaultClient: VaultClient },
  address: Address
) => {
  const account = toAccount({
    address,

    signMessage: async ({ message }) => {
      if (typeof message !== 'string') {
        const request: Request = {
          action: Action.SIGN_RAW,
          rawMessage: typeof message.raw === 'string' ? message.raw : toHex(message.raw),
          resourceId: resourceId(address),
          nonce: v4()
        }

        const accessToken = await authClient.requestAccessToken(request, {
          id: v4()
        })

        const { signature } = await vaultClient.sign({ data: request, accessToken })
        return signature
      }

      const request: Request = {
        action: Action.SIGN_MESSAGE,
        message,
        resourceId: resourceId(address),
        nonce: v4()
      }

      const accessToken = await authClient.requestAccessToken(request, {
        id: v4()
      })

      const { signature } = await vaultClient.sign({ data: request, accessToken })
      return signature
    },

    signTransaction: async (transaction) => {
      const transactionRequest = TransactionRequest.parse(transaction)
      const request: Request = {
        action: Action.SIGN_TRANSACTION,
        transactionRequest,
        resourceId: resourceId(address),
        nonce: v4()
      }

      const accessToken = await authClient.requestAccessToken(request, {
        id: v4()
      })

      const { signature } = await vaultClient.sign({ data: request, accessToken })
      return signature
    },

    signTypedData: async (typedData) => {
      const validatedTypedData = Eip712TypedData.parse(typedData)

      const request: Request = {
        action: Action.SIGN_TYPED_DATA,
        typedData: validatedTypedData,
        resourceId: resourceId(address),
        nonce: v4()
      }

      const accessToken = await authClient.requestAccessToken(request, {
        id: v4()
      })

      const { signature } = await vaultClient.sign({ data: request, accessToken })
      return signature
    }
  })

  return account
}
