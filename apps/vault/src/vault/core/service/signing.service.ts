import { MetricService, OTEL_ATTR_CLIENT_ID, TraceService } from '@narval/nestjs-shared'
import {
  Action,
  Hex,
  Request,
  SignMessageAction,
  SignRawAction,
  SignTransactionAction,
  SignTypedDataAction,
  SignUserOperationAction,
  getTxType
} from '@narval/policy-engine-shared'
import { signSecp256k1 } from '@narval/signature'
import { HttpStatus, Inject, Injectable } from '@nestjs/common'
import { Counter } from '@opentelemetry/api'
import { EntryPoint } from 'permissionless/types'
import { getUserOperationHash } from 'permissionless/utils'
import { createWalletClient, custom, extractChain, hexToBytes, signatureToHex } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import * as chains from 'viem/chains'
import { ApplicationException } from '../../../shared/exception/application.exception'
import { AccountRepository } from '../../persistence/repository/account.repository'
import { buildSignableTransactionRequest } from '../util/build-transaction.util'
import { NonceService } from './nonce.service'

@Injectable()
export class SigningService {
  private signTransactionCounter: Counter
  private signMessageCounter: Counter
  private signTypedDataCounter: Counter
  private signRawCounter: Counter
  private signUserOperationCounter: Counter

  constructor(
    private accountRepository: AccountRepository,
    private nonceService: NonceService,
    @Inject(TraceService) private traceService: TraceService,
    @Inject(MetricService) private metricService: MetricService
  ) {
    this.signTransactionCounter = this.metricService.createCounter('sign_transaction_count')
    this.signMessageCounter = this.metricService.createCounter('sign_message_count')
    this.signTypedDataCounter = this.metricService.createCounter('sign_typed_data_count')
    this.signRawCounter = this.metricService.createCounter('sign_raw_count')
    this.signUserOperationCounter = this.metricService.createCounter('sign_user_operation_count')
  }

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
    this.signUserOperationCounter.add(1, { [OTEL_ATTR_CLIENT_ID]: clientId })
    const span = this.traceService.startSpan(`${SigningService.name}.signUserOperation`)

    const { userOperation, resourceId } = action
    const client = await this.buildClient(clientId, resourceId)

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

    span.end()

    return signature
  }

  async signTransaction(clientId: string, action: SignTransactionAction): Promise<Hex> {
    this.signTransactionCounter.add(1, { [OTEL_ATTR_CLIENT_ID]: clientId })
    const span = this.traceService.startSpan(`${SigningService.name}.signTransaction`)

    const { transactionRequest, resourceId } = action
    const chain = extractChain<chains.Chain[], number>({
      chains: Object.values(chains),
      id: transactionRequest.chainId
    })
    const client = await this.buildClient(clientId, resourceId, chain)
    const type = getTxType(transactionRequest)

    if (type === undefined) {
      throw new ApplicationException({
        message: 'Invalid transaction type',
        suggestedHttpStatusCode: HttpStatus.BAD_REQUEST,
        context: { transactionRequest }
      })
    }

    const txRequest = buildSignableTransactionRequest(transactionRequest)
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

    span.end()

    return signature
  }

  async signMessage(clientId: string, action: SignMessageAction): Promise<Hex> {
    this.signMessageCounter.add(1, { [OTEL_ATTR_CLIENT_ID]: clientId })
    const span = this.traceService.startSpan(`${SigningService.name}.signMessage`)

    const { message, resourceId } = action
    const client = await this.buildClient(clientId, resourceId)
    const signature = await client.signMessage({ message })

    await this.maybeSaveNonce(clientId, action)

    span.end()

    return signature
  }

  async signTypedData(clientId: string, action: SignTypedDataAction): Promise<Hex> {
    this.signTypedDataCounter.add(1, { [OTEL_ATTR_CLIENT_ID]: clientId })
    const span = this.traceService.startSpan(`${SigningService.name}.signTypedData`)

    const { typedData, resourceId } = action
    const client = await this.buildClient(clientId, resourceId)
    const signature = await client.signTypedData(typedData)

    await this.maybeSaveNonce(clientId, action)

    span.end()

    return signature
  }

  // Sign a raw message; nothing ETH or chain-specific, simply performs an
  // ecdsa signature on the byte representation of the hex-encoded raw message
  async signRaw(clientId: string, action: SignRawAction): Promise<Hex> {
    this.signRawCounter.add(1, { [OTEL_ATTR_CLIENT_ID]: clientId })

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
