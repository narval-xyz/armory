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
  custom,
  extractChain,
  hexToBigInt,
  hexToBytes,
  serializeSignature,
  transactionType
} from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import * as chains from 'viem/chains'
import { ApplicationException } from '../../../shared/exception/application.exception'
import { WalletRepository } from '../../persistence/repository/wallet.repository'
import { NonceService } from './nonce.service'

@Injectable()
export class SigningService {
  constructor(
    private walletRepository: WalletRepository,
    private nonceService: NonceService
  ) {}

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

    throw new ApplicationException({
      message: 'Action not supported',
      suggestedHttpStatusCode: HttpStatus.BAD_REQUEST,
      context: { clientId, request }
    })
  }

  async signTransaction(clientId: string, action: SignTransactionAction): Promise<Hex> {
    const { transactionRequest, resourceId } = action
    const chain = extractChain<chains.Chain[], number>({
      chains: Object.values(chains),
      id: transactionRequest.chainId
    })
    const client = await this.buildClient(clientId, resourceId, chain)

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

    const signature = await client.signTransaction({ ...txRequest, chain })
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

    await this.maybeSaveNonce(clientId, action)

    return signature
  }

  async signMessage(clientId: string, action: SignMessageAction): Promise<Hex> {
    const { message, resourceId } = action
    const client = await this.buildClient(clientId, resourceId)
    const signature = await client.signMessage({ message })

    await this.maybeSaveNonce(clientId, action)

    return signature
  }

  async signTypedData(clientId: string, action: SignTypedDataAction): Promise<Hex> {
    const { typedData, resourceId } = action
    const client = await this.buildClient(clientId, resourceId)
    const signature = await client.signTypedData(typedData)

    await this.maybeSaveNonce(clientId, action)

    return signature
  }

  // Sign a raw message; nothing ETH or chain-specific, simply performs an
  // ecdsa signature on the byte representation of the hex-encoded raw message
  async signRaw(clientId: string, action: SignRawAction): Promise<Hex> {
    const { rawMessage, resourceId } = action
    const wallet = await this.findWallet(clientId, resourceId)
    const message = hexToBytes(rawMessage)
    const signature = signSecp256k1(message, wallet.privateKey, true)
    const hexSignature = serializeSignature(signature)

    await this.maybeSaveNonce(clientId, action)

    return hexSignature
  }

  private async findWallet(clientId: string, resourceId: string) {
    const wallet = await this.walletRepository.findById(clientId, resourceId)

    if (!wallet) {
      throw new ApplicationException({
        message: 'Wallet not found',
        suggestedHttpStatusCode: HttpStatus.NOT_FOUND,
        context: { clientId, resourceId }
      })
    }

    return wallet
  }

  private async buildClient(clientId: string, resourceId: string, chain?: chains.Chain) {
    const wallet = await this.findWallet(clientId, resourceId)

    const account = privateKeyToAccount(wallet.privateKey)
    const client = createWalletClient({
      account,
      chain,
      transport: custom({
        // a noop transport provider; we do not want to make real RPC calls out of the server
        // so just stub ones that are needed internally, like chainId
        request: async ({ method }: { method: string }) => {
          if (method === 'eth_chainId') return chain?.id
          return
        }
      })
    })

    return client
  }

  private async maybeSaveNonce(
    clientId: string,
    request: SignTransactionAction | SignMessageAction | SignTypedDataAction | SignRawAction
  ) {
    if (request.nonce) {
      await this.nonceService.save(clientId, request.nonce)
    }
  }
}
