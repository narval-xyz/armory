import { AuthClient, resourceId, TransactionRequest, VaultClient } from '@narval-xyz/armory-sdk'
import {
  Action,
  Decision,
  hexSchema,
  Request,
  TransactionRequestLegacy
} from '@narval-xyz/armory-sdk/policy-engine-shared'
import 'dotenv/config'
import minimist from 'minimist'
import { Hex, hexToBigInt, keccak256, parseSignature, serializeTransaction, toHex } from 'viem'
import { getArmoryClients } from './armory.sdk'

const buildTransactionRequest = ({ fromAddress, toAddress }: { toAddress: Hex; fromAddress: Hex }) => {
  const tx: TransactionRequest = {
    to: toAddress,
    from: fromAddress,
    chainId: 1,
    value: toHex(10000),
    nonce: 109, // made up nonce
    gas: 21000n,
    gasPrice: 1000000n,
    type: '0'
  }

  return tx
}

const authorizeAndSignRequest = async (authClient: AuthClient, vaultClient: VaultClient, request: Request) => {
  console.log('🚦 Asking permission to sign the transaction')
  const response = await authClient.authorize(request)

  switch (response.decision) {
    case Decision.PERMIT: {
      console.log('✅ Transaction approved \n')
      console.log('🔐 Sending to Vault for signing...: \n')
      const { signature } = await vaultClient.sign({ data: request, accessToken: response.accessToken })

      console.log('✅ Vault Response: \n', signature)
      return signature as Hex
    }
    case Decision.CONFIRM: {
      console.log('🔐 Request needs approvals', { authId: response.authId }, '\n')
      console.table(response.approvals.missing)
      break
    }
    case Decision.FORBID: {
      console.error('❌ Unauthorized')
      console.log('🔍 Response', response, '\n')
    }
  }
  return null
}

// Method to format the Narval TX Request into a Viem-compatible object, then serialize it
const _serializeTransactionRequest = (transactionRequest: TransactionRequest, signature?: Hex) => {
  const tx = TransactionRequestLegacy.parse(transactionRequest)
  const preparedTx = {
    ...tx,
    type: undefined,
    value: tx.value === undefined ? undefined : hexToBigInt(tx.value)
  }

  const serialized = serializeTransaction(preparedTx, signature ? parseSignature(signature) : undefined)

  return serialized
}

const main = async () => {
  const playerOnePrivateKey = hexSchema.parse(process.env.PLAYER_ONE_PRIVATE_KEY)
  const vaultHost = process.env.VAULT_HOST
  const authHost = process.env.AUTH_HOST
  const clientId = process.env.CLIENT_ID

  const args = minimist(process.argv.slice(2), {
    string: ['_']
  })
  const fromAddress = hexSchema.parse(args._[0])
  const toAddress = hexSchema.parse(args._[1])

  if (!authHost || !vaultHost || !clientId || !fromAddress || !toAddress) {
    throw new Error('Missing configuration')
  }

  const { authClient, vaultClient } = await getArmoryClients(playerOnePrivateKey, {
    clientId,
    vaultHost,
    authHost
  })

  const transactionRequest = buildTransactionRequest({
    fromAddress,
    toAddress
  })

  console.log('📝 Transaction Request:', transactionRequest)

  const request: Request = {
    action: Action.SIGN_TRANSACTION,
    resourceId: resourceId(fromAddress), // This must match the `account.id` in your entity data. resourceId() formats an address like `eip155:eoa:${address}`, which is the default way account ids are generated.
    nonce: crypto.randomUUID(), // nonce for the auth request, not the same as the TX nonce.
    transactionRequest: transactionRequest
  }

  // Signing the full TransactionRequest
  const signature = await authorizeAndSignRequest(authClient, vaultClient, request)
  console.log('🔐 TX Signature -- broadcast this to the chain:', signature)

  // Serialize the TransactionRequest & sign it using a Raw signature
  console.log('🔁 Repeating with a RAW signature \n\n')

  const serialized = _serializeTransactionRequest(transactionRequest)

  // an eth txn requires a signature of the keccak256 hash of the serialized txn data
  const txHash = keccak256(serialized)

  // A SIGN_RAW request will simply do a sign secp256k1 of the hex data passed
  const rawRequest: Request = {
    action: Action.SIGN_RAW,
    resourceId: resourceId(fromAddress), // This must match the `account.id` in your entity data. resourceId() formats an address like `eip155:eoa:${address}`, which is the default way account ids are generated.
    nonce: crypto.randomUUID(), // nonce for the auth request, not the same as the TX nonce.
    rawMessage: txHash
  }

  const rawSignature = await authorizeAndSignRequest(authClient, vaultClient, rawRequest)
  if (!rawSignature) {
    throw new Error('Failed to sign raw transaction')
  }

  // An Eth txn is the serialization of the txn data + the signature, so re-serialize the data now that we have the raw sig
  const serializedSignedTx = _serializeTransactionRequest(transactionRequest, rawSignature)

  // This signature should EXACTLY match the signature from the first pass with `signTransaction
  console.log('🔐 TX Signature -- broadcast this to the chain:', serializedSignedTx)
}

main().catch(console.error)
