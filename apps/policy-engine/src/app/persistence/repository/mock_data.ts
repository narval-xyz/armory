import { Action, Alg, EvaluationRequest, FIXTURE, Request, TransactionRequest, hashRequest } from '@narval/authz-shared'
import { toHex } from 'viem'

export const ONE_ETH = BigInt('1000000000000000000')

export const generateInboundRequest = async (): Promise<EvaluationRequest> => {
  const txRequest: TransactionRequest = {
    from: FIXTURE.WALLET.engineering1.address,
    to: FIXTURE.WALLET.treasury.address,
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
    resourceId: FIXTURE.WALLET.engineering1.uid
  }

  const message = hashRequest(request)

  const aliceSignature = await FIXTURE.ACCOUNT.Alice.signMessage({ message })
  const bobSignature = await FIXTURE.ACCOUNT.Bob.signMessage({ message })
  const carolSignature = await FIXTURE.ACCOUNT.Carol.signMessage({ message })

  return {
    authentication: {
      sig: aliceSignature,
      alg: Alg.ES256K,
      pubKey: FIXTURE.ACCOUNT.Alice.address
    },
    request,
    approvals: [
      {
        sig: bobSignature,
        alg: Alg.ES256K,
        pubKey: FIXTURE.ACCOUNT.Bob.address
      },
      {
        sig: carolSignature,
        alg: Alg.ES256K,
        pubKey: FIXTURE.ACCOUNT.Carol.address
      }
    ]
  }
}
