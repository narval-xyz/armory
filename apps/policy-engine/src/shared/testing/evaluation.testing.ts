import { Permission, Resource } from '@narval/armory-sdk'
import { Action, EvaluationRequest, FIXTURE, Request, TransactionRequest } from '@narval/policy-engine-shared'
import { Alg, Payload, hash, privateKeyToJwk, signJwt } from '@narval/signature'
import { randomBytes } from 'crypto'
import { UNSAFE_PRIVATE_KEY } from 'packages/policy-engine-shared/src/lib/dev.fixture'
import { v4 as uuid } from 'uuid'
import { toHex } from 'viem'

export const ONE_ETH = BigInt('1000000000000000000')

const sign = async (request: Request) => {
  const message = hash(request)
  const payload: Payload = {
    requestHash: message
  }

  const aliceSignature = await signJwt(payload, privateKeyToJwk(UNSAFE_PRIVATE_KEY.Alice, Alg.ES256K))
  const bobSignature = await signJwt(payload, privateKeyToJwk(UNSAFE_PRIVATE_KEY.Bob, Alg.ES256K))
  const carolSignature = await signJwt(payload, privateKeyToJwk(UNSAFE_PRIVATE_KEY.Carol, Alg.ES256K))

  return { aliceSignature, bobSignature, carolSignature }
}

export const generateSignTransactionRequestWithGas = async (): Promise<EvaluationRequest> => {
  const txRequest: TransactionRequest = {
    from: FIXTURE.WALLET.Engineering.address,
    to: FIXTURE.WALLET.Treasury.address,
    chainId: 137,
    value: toHex(ONE_ETH),
    data: '0x00000000',
    gas: BigInt(22000),
    nonce: 192,
    type: '2'
  }

  const request: Request = {
    action: Action.SIGN_TRANSACTION,
    nonce: uuid(),
    transactionRequest: txRequest,
    resourceId: FIXTURE.WALLET.Engineering.id
  }

  const { aliceSignature, bobSignature, carolSignature } = await sign(request)

  return {
    authentication: aliceSignature,
    request,
    approvals: [bobSignature, carolSignature]
  }
}

export const generateSignTransactionRequest = async (): Promise<EvaluationRequest> => {
  const txRequest: TransactionRequest = {
    from: FIXTURE.WALLET.Engineering.address,
    to: FIXTURE.WALLET.Treasury.address,
    chainId: 137,
    value: toHex(ONE_ETH),
    data: '0x00000000',
    nonce: 192,
    type: '2'
  }

  const request: Request = {
    action: Action.SIGN_TRANSACTION,
    nonce: uuid(),
    transactionRequest: txRequest,
    resourceId: FIXTURE.WALLET.Engineering.id
  }

  const { aliceSignature, bobSignature, carolSignature } = await sign(request)

  return {
    authentication: aliceSignature,
    request,
    approvals: [bobSignature, carolSignature]
  }
}

export const generateSignMessageRequest = async (): Promise<EvaluationRequest> => {
  const request: Request = {
    action: Action.SIGN_MESSAGE,
    nonce: uuid(),
    resourceId: FIXTURE.WALLET.Engineering.id,
    message: 'generated sign message request'
  }

  const { aliceSignature, bobSignature, carolSignature } = await sign(request)

  return {
    authentication: aliceSignature,
    request,
    approvals: [bobSignature, carolSignature]
  }
}

export const generateSignRawRequest = async (): Promise<EvaluationRequest> => {
  const request: Request = {
    action: Action.SIGN_RAW,
    nonce: uuid(),
    resourceId: FIXTURE.WALLET.Engineering.id,
    rawMessage: toHex(randomBytes(42))
  }

  const { aliceSignature, bobSignature, carolSignature } = await sign(request)

  return {
    authentication: aliceSignature,
    request,
    approvals: [bobSignature, carolSignature]
  }
}

export const generateSignTypedDataRequest = async (): Promise<EvaluationRequest> => {
  const request: Request = {
    action: Action.SIGN_TYPED_DATA,
    nonce: uuid(),
    resourceId: FIXTURE.WALLET.Engineering.id,
    typedData: {
      domain: {
        name: 'Ether Mail',
        version: '1',
        chainId: 1,
        verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC'
      },
      primaryType: 'Mail',
      types: {
        Person: [
          { name: 'name', type: 'string' },
          { name: 'wallet', type: 'address' }
        ],
        Mail: [
          { name: 'from', type: 'Person' },
          { name: 'to', type: 'Person' },
          { name: 'contents', type: 'string' }
        ]
      },
      message: {
        from: {
          name: 'Alice',
          wallet: FIXTURE.ACCOUNT.Alice.address
        },
        to: {
          name: 'Bob',
          wallet: FIXTURE.ACCOUNT.Bob.address
        },
        contents: "Dear Bob, today we're going to the moon"
      }
    }
  }

  const { aliceSignature, bobSignature, carolSignature } = await sign(request)

  return {
    authentication: aliceSignature,
    request,
    approvals: [bobSignature, carolSignature]
  }
}

export const generateGrantPermissionRequest = async (): Promise<EvaluationRequest> => {
  const request: Request = {
    action: Action.GRANT_PERMISSION,
    nonce: uuid(),
    resourceId: Resource.VAULT,
    permissions: [Permission.WALLET_CREATE, Permission.WALLET_READ, Permission.WALLET_IMPORT]
  }

  const { aliceSignature, bobSignature, carolSignature } = await sign(request)

  return {
    authentication: aliceSignature,
    request,
    approvals: [bobSignature, carolSignature]
  }
}
