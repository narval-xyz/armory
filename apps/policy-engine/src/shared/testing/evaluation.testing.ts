import { Permission, Resource, resourceId } from '@narval/armory-sdk'
import { Action, EvaluationRequest, FIXTURE, Request, TransactionRequest } from '@narval/policy-engine-shared'
import { Alg, Payload, hash, privateKeyToJwk, signJwt } from '@narval/signature'
import { randomBytes } from 'crypto'
import { ENTRYPOINT_ADDRESS_V06 } from 'permissionless'
import { v4 as uuid } from 'uuid'
import { toHex } from 'viem'
import { sepolia } from 'viem/chains'

export const ONE_ETH = BigInt('1000000000000000000')

const sign = async (request: Request) => {
  const message = hash(request)
  const payload: Payload = {
    requestHash: message
  }

  const aliceSignature = await signJwt(payload, privateKeyToJwk(FIXTURE.UNSAFE_PRIVATE_KEY.Alice, Alg.ES256K))
  const bobSignature = await signJwt(payload, privateKeyToJwk(FIXTURE.UNSAFE_PRIVATE_KEY.Bob, Alg.ES256K))
  const carolSignature = await signJwt(payload, privateKeyToJwk(FIXTURE.UNSAFE_PRIVATE_KEY.Carol, Alg.ES256K))

  return { aliceSignature, bobSignature, carolSignature }
}

export const generateSignTransactionRequestWithGas = async (): Promise<EvaluationRequest> => {
  const txRequest: TransactionRequest = {
    from: FIXTURE.ACCOUNT.Engineering.address,
    to: FIXTURE.ACCOUNT.Treasury.address,
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
    resourceId: FIXTURE.ACCOUNT.Engineering.id
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
    from: FIXTURE.ACCOUNT.Engineering.address,
    to: FIXTURE.ACCOUNT.Treasury.address,
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
    resourceId: FIXTURE.ACCOUNT.Engineering.id
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
    resourceId: FIXTURE.ACCOUNT.Engineering.id,
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
    resourceId: FIXTURE.ACCOUNT.Engineering.id,
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
    resourceId: FIXTURE.ACCOUNT.Engineering.id,
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
          { name: 'account', type: 'address' }
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
          account: FIXTURE.VIEM_ACCOUNT.Alice.address
        },
        to: {
          name: 'Bob',
          account: FIXTURE.VIEM_ACCOUNT.Bob.address
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

export const generateSignUserOperationRequest = async (): Promise<EvaluationRequest> => {
  const request: Request = {
    action: 'signUserOperation',
    nonce: 'e1c8a972-3828-4046-abaf-eda251bf56bd',
    resourceId: resourceId(FIXTURE.VIEM_ACCOUNT.Alice.address),
    userOperation: {
      sender: FIXTURE.VIEM_ACCOUNT.Alice.address,
      nonce: 0n,
      initCode:
        '0x9406Cc6185a346906296840746125a0E449764545fbfb9cf000000000000000000000000d9d431ad45d96dd9eeb05dd0a7d66876d1d74c4b0000000000000000000000000000000000000000000000000000000000000000',
      callData: `0xb61d27f6000000000000000000000000${FIXTURE.VIEM_ACCOUNT.Bob.address.slice(2)}000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000`,
      callGasLimit: 82511n,
      verificationGasLimit: 526140n,
      preVerificationGas: 65912n,
      maxFeePerGas: 31775842396n,
      maxPriorityFeePerGas: 1200000000n,
      paymasterAndData:
        '0xDFF7FA1077Bce740a6a212b3995990682c0Ba66d000000000000000000000000000000000000000000000000000000006686a49d0000000000000000000000000000000000000000000000000000000000000000c9cd3f0fdd847ea7e02a9a7ed8dda9067dc4da959750f2aed1b33198bef83cee75a3a15f3c90f881476a508beb21305cdbce6b93502db8b4831a955ec11a08111c',
      entryPoint: ENTRYPOINT_ADDRESS_V06,
      signature:
        '0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c',
      factoryAddress: '0x9406Cc6185a346906296840746125a0E44976454',
      chainId: sepolia.id
    }
  }

  const { aliceSignature, bobSignature, carolSignature } = await sign(request)
  return {
    authentication: aliceSignature,
    request,
    approvals: [bobSignature, carolSignature]
  }
}
