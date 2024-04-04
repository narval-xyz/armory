import { Action, EvaluationRequest, FIXTURE, Request, TransactionRequest } from '@narval/policy-engine-shared'
import { Alg, Payload, hash, privateKeyToJwk, signJwt } from '@narval/signature'
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
    nonce: 'random-nonce-111',
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
