import { Action, EvaluationRequest, FIXTURE, Request, TransactionRequest } from '@narval/policy-engine-shared'
import { Payload, SigningAlg, buildSignerEip191, hash, secp256k1PrivateKeyToJwk, signJwt } from '@narval/signature'
import { UNSAFE_PRIVATE_KEY } from 'packages/policy-engine-shared/src/lib/dev.fixture'
import { toHex } from 'viem'

export const ONE_ETH = BigInt('1000000000000000000')

export const generateInboundRequest = async (): Promise<EvaluationRequest> => {
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

  const message = hash(request)
  const payload: Payload = {
    requestHash: message
  }

  // const aliceSignature = await FIXTURE.ACCOUNT.Alice.signMessage({ message })
  const aliceSignature = await signJwt(
    payload,
    secp256k1PrivateKeyToJwk(UNSAFE_PRIVATE_KEY.Alice),
    { alg: SigningAlg.EIP191 },
    buildSignerEip191(UNSAFE_PRIVATE_KEY.Alice)
  )
  const bobSignature = await signJwt(
    payload,
    secp256k1PrivateKeyToJwk(UNSAFE_PRIVATE_KEY.Bob),
    { alg: SigningAlg.EIP191 },
    buildSignerEip191(UNSAFE_PRIVATE_KEY.Bob)
  )
  const carolSignature = await signJwt(
    payload,
    secp256k1PrivateKeyToJwk(UNSAFE_PRIVATE_KEY.Carol),
    { alg: SigningAlg.EIP191 },
    buildSignerEip191(UNSAFE_PRIVATE_KEY.Carol)
  )
  return {
    authentication: aliceSignature,
    request,
    approvals: [bobSignature, carolSignature]
  }
}
