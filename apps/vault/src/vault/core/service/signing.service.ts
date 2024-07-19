import {
  Action,
  Hex,
  Request,
  SignMessageAction,
  SignRawAction,
  SignTransactionAction,
  SignTypedDataAction,
  SignUserOperationAction,
  TransactionRequest,
  TransactionRequestEIP1559,
  TransactionRequestLegacy,
  getTxType
} from '@narval/policy-engine-shared'
import { signSecp256k1 } from '@narval/signature'
import { HttpStatus, Injectable } from '@nestjs/common'
import { EntryPoint } from 'permissionless/types'
import { getUserOperationHash } from 'permissionless/utils'
import {
  TransactionRequest as SignableTransactionRequest,
  createWalletClient,
  custom,
  extractChain,
  hexToBigInt,
  hexToBytes,
  signatureToHex,
  transactionType
} from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import * as chains from 'viem/chains'
import { ApplicationException } from '../../../shared/exception/application.exception'
import { AccountRepository } from '../../persistence/repository/account.repository'
import { NonceService } from './nonce.service'

@Injectable()
export class SigningService {
  constructor(
    private accountRepository: AccountRepository,
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
    } else if (request.action === Action.SIGN_USER_OPERATION) {
      return this.signUserOperation(clientId, request)
    }

    throw new ApplicationException({
      message: 'Action not supported',
      suggestedHttpStatusCode: HttpStatus.BAD_REQUEST,
      context: { clientId, request }
    })
  }

  async signUserOperation(clientId: string, action: SignUserOperationAction): Promise<Hex> {
    const { userOperation, resourceId } = action
    const client = await this.buildClient(clientId, resourceId)

    const { chainId, entryPoint, factoryAddress: _factoryAddress, ...userOpToBeHashed } = userOperation

    const userOpHash = getUserOperationHash({
      chainId: +chainId,
      entryPoint: entryPoint as EntryPoint,
      userOperation: userOpToBeHashed
    })

    const signature = await client.signMessage({
      message: {
        raw: userOpHash
      }
    })

    await this.maybeSaveNonce(clientId, action)

    return signature
  }

  buildSignableTransactionRequest(transactionRequest: TransactionRequest): SignableTransactionRequest {
    const type = getTxType(transactionRequest)

    const value =
      transactionRequest.value === undefined || transactionRequest.value === '0x'
        ? undefined
        : hexToBigInt(transactionRequest.value)

    switch (type) {
      case '2': {
        const tx = TransactionRequestEIP1559.parse(transactionRequest)
        return {
          from: tx.from,
          to: tx.to,
          nonce: tx.nonce,
          data: tx.data,
          gas: tx.gas,
          maxFeePerGas: tx.maxFeePerGas,
          maxPriorityFeePerGas: tx.maxPriorityFeePerGas,
          type: transactionType['0x2'],
          value
        }
      }
      case '0': {
        const tx = TransactionRequestLegacy.parse(transactionRequest)
        return {
          from: tx.from,
          to: tx.to,
          nonce: tx.nonce,
          data: tx.data,
          gas: tx.gas,
          gasPrice: tx.gasPrice,
          type: transactionType['0x0'],
          value
        }
      }
      default: {
        return {
          from: transactionRequest.from,
          to: transactionRequest.to,
          nonce: transactionRequest.nonce,
          data: transactionRequest.data,
          gas: transactionRequest.gas,
          type: transactionType['0x0'],
          value
        }
      }
    }
  }

  async signTransaction(clientId: string, action: SignTransactionAction): Promise<Hex> {
    const { transactionRequest, resourceId } = action
    const chain = extractChain<chains.Chain[], number>({
      chains: Object.values(chains),
      id: transactionRequest.chainId
    })
    const client = await this.buildClient(clientId, resourceId, chain)

    const value =
      transactionRequest.value === undefined || transactionRequest.value === '0x'
        ? undefined
        : hexToBigInt(transactionRequest.value)

    const type = getTxType(transactionRequest)
    if (type === undefined) {
      throw new ApplicationException({
        message: 'Invalid transaction type',
        suggestedHttpStatusCode: HttpStatus.BAD_REQUEST,
        context: { transactionRequest }
      })
    }
    const txRequest = this.buildSignableTransactionRequest(transactionRequest)
    const signature = await client.signTransaction({ ...txRequest, chain })
    // /*
    //   TEMPORARY
    //   for testing, uncomment the below lines to actually SEND the tx to the chain.
    // */

    // const c2 = createAccountClient({
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
    const account = await this.findAccount(clientId, resourceId)
    const message = hexToBytes(rawMessage)
    const signature = signSecp256k1(message, account.privateKey, true)
    const hexSignature = signatureToHex(signature)

    await this.maybeSaveNonce(clientId, action)

    return hexSignature
  }

  private async findAccount(clientId: string, resourceId: string) {
    const account = await this.accountRepository.findById(clientId, resourceId)

    if (!account) {
      throw new ApplicationException({
        message: 'Account not found',
        suggestedHttpStatusCode: HttpStatus.NOT_FOUND,
        context: { clientId, resourceId }
      })
    }

    return account
  }

  private async buildClient(clientId: string, resourceId: string, chain?: chains.Chain) {
    const { privateKey } = await this.findAccount(clientId, resourceId)

    const account = privateKeyToAccount(privateKey)

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
    request: SignTransactionAction | SignMessageAction | SignTypedDataAction | SignRawAction | SignUserOperationAction
  ) {
    if (request.nonce) {
      await this.nonceService.save(clientId, request.nonce)
    }
  }
}
