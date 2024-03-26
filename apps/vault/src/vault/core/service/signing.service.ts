import { Action, Hex, Request, SignMessageAction, SignTransactionAction } from '@narval/policy-engine-shared'
import { HttpStatus, Injectable } from '@nestjs/common'
import {
  TransactionRequest,
  checksumAddress,
  createWalletClient,
  extractChain,
  hexToBigInt,
  http,
  transactionType
} from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import * as chains from 'viem/chains'
import { ApplicationException } from '../../../shared/exception/application.exception'
import { WalletRepository } from '../../persistence/repository/wallet.repository'

@Injectable()
export class SigningService {
  constructor(private walletRepository: WalletRepository) {}

  async sign(tenantId: string, request: Request): Promise<Hex> {
    if (request.action === Action.SIGN_TRANSACTION) {
      return this.signTransaction(tenantId, request)
    } else if (request.action === Action.SIGN_MESSAGE) {
      return this.signMessage(tenantId, request)
    }

    throw new Error('Action not supported')
  }

  async signTransaction(tenantId: string, action: SignTransactionAction): Promise<Hex> {
    const { transactionRequest, resourceId } = action
    const wallet = await this.walletRepository.findById(tenantId, resourceId)
    if (!wallet) {
      throw new ApplicationException({
        message: 'Wallet not found',
        suggestedHttpStatusCode: HttpStatus.BAD_REQUEST,
        context: { clientId: tenantId, resourceId }
      })
    }

    const account = privateKeyToAccount(wallet.privateKey)
    const chain = extractChain<chains.Chain[], number>({
      chains: Object.values(chains),
      id: transactionRequest.chainId
    })

    const client = createWalletClient({
      account,
      chain,
      transport: http('') // clear the RPC so we don't call any chain stuff here.
    })

    const txRequest: TransactionRequest = {
      from: checksumAddress(account.address),
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

  async signMessage(tenantId: string, action: SignMessageAction): Promise<Hex> {
    const { message, resourceId } = action
    const wallet = await this.walletRepository.findById(tenantId, resourceId)
    if (!wallet) {
      throw new ApplicationException({
        message: 'Wallet not found',
        suggestedHttpStatusCode: HttpStatus.BAD_REQUEST,
        context: { clientId: tenantId, resourceId }
      })
    }

    const account = privateKeyToAccount(wallet.privateKey)

    const client = createWalletClient({
      account,
      chain: chains.mainnet,
      transport: http('') // clear the RPC so we don't call any chain stuff here.
    })

    const signature = await client.signMessage({ message })
    return signature
  }
}
