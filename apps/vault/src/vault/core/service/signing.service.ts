import {
  Action,
  Hex,
  Request,
  SignMessageAction,
  SignRawAction,
  SignTransactionAction,
  SignTypedDataAction
} from '@narval/policy-engine-shared'
import { signSecp256k1 } from '@narval/signature'
import { HttpStatus, Injectable } from '@nestjs/common'
import {
  TransactionRequest,
  checksumAddress,
  createWalletClient,
  extractChain,
  hexToBigInt,
  hexToBytes,
  http,
  signatureToHex,
  transactionType
} from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import * as chains from 'viem/chains'
import { ApplicationException } from '../../../shared/exception/application.exception'
import { WalletRepository } from '../../persistence/repository/wallet.repository'

@Injectable()
export class SigningService {
  constructor(private walletRepository: WalletRepository) {}

  async sign(clientId: string, request: Request): Promise<Hex> {
    if (request.action === Action.SIGN_TRANSACTION) {
      return this.signTransaction(clientId, request)
    } else if (request.action === Action.SIGN_MESSAGE) {
      return this.signMessage(clientId, request)
    } else if (request.action === Action.SIGN_TYPED_DATA) {
      return this.signTypedData(clientId, request)
    } else if (request.action === Action.SIGN_RAW) {
      return this.signRaw(clientId, request)
    }

    throw new Error('Action not supported')
  }

  async #getWallet(clientId: string, resourceId: string) {
    const wallet = await this.walletRepository.findById(clientId, resourceId)
    if (!wallet) {
      throw new ApplicationException({
        message: 'Wallet not found',
        suggestedHttpStatusCode: HttpStatus.BAD_REQUEST,
        context: { clientId: clientId, resourceId }
      })
    }

    return wallet
  }

  async #buildClient(clientId: string, resourceId: string, chainId?: number) {
    const wallet = await this.#getWallet(clientId, resourceId)

    const account = privateKeyToAccount(wallet.privateKey)
    const chain = extractChain<chains.Chain[], number>({
      chains: Object.values(chains),
      id: chainId || 1
    })

    const client = createWalletClient({
      account,
      chain,
      transport: http('') // clear the RPC so we don't call any chain stuff here.
    })

    return client
  }

  async signTransaction(clientId: string, action: SignTransactionAction): Promise<Hex> {
    const { transactionRequest, resourceId } = action
    const client = await this.#buildClient(clientId, resourceId, transactionRequest.chainId)

    const txRequest: TransactionRequest = {
      from: checksumAddress(client.account.address),
      to: transactionRequest.to,
      nonce: transactionRequest.nonce,
      data: transactionRequest.data,
      gas: transactionRequest.gas,
      maxFeePerGas: transactionRequest.maxFeePerGas,
      maxPriorityFeePerGas: transactionRequest.maxPriorityFeePerGas,
      type: transactionType['0x2'],
      value: transactionRequest.value ? hexToBigInt(transactionRequest.value) : undefined
    }

    const signature = await client.signTransaction(txRequest)
    // /*
    //   TEMPORARY
    //   for testing, uncomment the below lines to actually SEND the tx to the chain.
    // */

    // const c2 = createWalletClient({
    //   account,
    //   chain,
    //   transport: http('https://polygon-mainnet.g.alchemy.com/v2/zBfj-qB2fQVXyTlbD8DRitsNn_ukCJAp') // clear the RPC so we don't call any chain stuff here.
    // })
    // console.log('sending transaction')
    // const hash = await c2.sendRawTransaction({ serializedTransaction: signature })
    // console.log('sent transaction', hash)

    return signature
  }

  async signMessage(clientId: string, action: SignMessageAction): Promise<Hex> {
    const { message, resourceId } = action
    const client = await this.#buildClient(clientId, resourceId)

    const signature = await client.signMessage({ message })
    return signature
  }

  async signTypedData(clientId: string, action: SignTypedDataAction): Promise<Hex> {
    const { typedData, resourceId } = action
    const client = await this.#buildClient(clientId, resourceId)

    const signature = await client.signTypedData(typedData)
    return signature
  }

  // Sign a raw message; nothing ETH or chain-specific, simply performs an ecdsa signature on the byte representation of the hex-encoded raw message
  async signRaw(clientId: string, action: SignRawAction): Promise<Hex> {
    const { rawMessage, resourceId } = action

    const wallet = await this.#getWallet(clientId, resourceId)
    const message = hexToBytes(rawMessage)
    const signature = await signSecp256k1(message, wallet.privateKey, true)

    const hexSignature = signatureToHex(signature)
    return hexSignature
  }
}
