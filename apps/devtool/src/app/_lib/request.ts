import { Permission, Resource } from '@narval/armory-sdk'
import { Action, FIXTURE } from '@narval/policy-engine-shared'
import { Alg, hash, privateKeyToJwk, signJwt } from '@narval/signature'
import { getTime } from 'date-fns'
import { v4 as uuid } from 'uuid'

export const erc20 = async () => {
  const from = FIXTURE.ACCOUNT.Engineering
  const to = FIXTURE.ACCOUNT.Operation

  const request = {
    resourceId: from.id,
    action: Action.SIGN_TRANSACTION,
    nonce: uuid(),
    transactionRequest: {
      from: from.address,
      to: to.address,
      data: '0x42842e0e00000000000000000000000024f0914062f66d487dc082802aac53cd10328d960000000000000000000000008cc7929789e14ce2ac6d4e8f2294ee4c501283e30000000000000000000000000000000000000000000000000000000000000085',
      chainId: 137,
      type: '2'
    }
  }

  const bobSignature = await signJwt(
    {
      iss: FIXTURE.USER.Bob.id,
      sub: request.resourceId,
      requestHash: hash(request)
    },
    privateKeyToJwk(FIXTURE.UNSAFE_PRIVATE_KEY.Bob, Alg.ES256K)
  )

  const carolSignature = await signJwt(
    {
      iss: FIXTURE.USER.Carol.id,
      sub: request.resourceId,
      requestHash: hash(request)
    },
    privateKeyToJwk(FIXTURE.UNSAFE_PRIVATE_KEY.Carol, Alg.ES256K)
  )

  return {
    request,
    approvals: [bobSignature, carolSignature]
  }
}

export const spendingLimits = async () => {
  const from = FIXTURE.ACCOUNT.Engineering
  const to = FIXTURE.ACCOUNT.Operation

  const transferOneMatic = {
    from: from.address,
    to: to.address,
    value: '0xde0b6b3a7640000',
    chainId: 137,
    type: '2'
  }

  const request = {
    resourceId: from.id,
    action: Action.SIGN_TRANSACTION,
    nonce: uuid(),
    transactionRequest: transferOneMatic
  }

  return {
    request,
    feeds: [
      {
        source: 'armory/price-feed',
        sig: 'eyJhbGciOiJFSVAxOTEiLCJraWQiOiIweDlENDMyYTA5Q0JmNTVGMjJBYTZhMkUyOTBhY0IxMkQ1N2QyOUIyRmMiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJmZTcyMzA0NC0zNWRmLTRlOTktOTczOS0xMjJhNDhkNGFiOTYiLCJyZXF1ZXN0SGFzaCI6IjB4ZjdmY2MyMzRhMTMzNWNmNGE0NDE0MzAwNWJhOWJhNWQyY2VlMTJhMmZmZDFlNDMyYTU4Yjc5YjllNzcyYzk5NiIsInN1YiI6ImVpcDE1NTplb2E6MHg0OTQwNDI1MDRhODE0OGE2ZDAwYWIxMGVkMjYwNDNmNTU3OWNlMDBmIn0.BxgEr9TILTIocaNpQs-59vKhBSePpS-q0D4VWfVpqIs0bRSBp8vBMHkKa7AxdtfMwRCBd86vldj-1Ebb5UtmMhs',
        data: {
          'eip155:137/slip44:966': {
            'fiat:usd': '0.99',
            'fiat:eur': '1.10'
          }
        }
      },
      {
        source: 'armory/historical-transfer-feed',
        sig: 'eyJhbGciOiJFSVAxOTEiLCJraWQiOiIweDlENDMyYTA5Q0JmNTVGMjJBYTZhMkUyOTBhY0IxMkQ1N2QyOUIyRmMiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJmZTcyMzA0NC0zNWRmLTRlOTktOTczOS0xMjJhNDhkNGFiOTYiLCJyZXF1ZXN0SGFzaCI6IjB4ZjdmY2MyMzRhMTMzNWNmNGE0NDE0MzAwNWJhOWJhNWQyY2VlMTJhMmZmZDFlNDMyYTU4Yjc5YjllNzcyYzk5NiIsInN1YiI6ImVpcDE1NTplb2E6MHg0OTQwNDI1MDRhODE0OGE2ZDAwYWIxMGVkMjYwNDNmNTU3OWNlMDBmIn0.BxgEr9TILTIocaNpQs-59vKhBSePpS-q0D4VWfVpqIs0bRSBp8vBMHkKa7AxdtfMwRCBd86vldj-1Ebb5UtmMhs',
        data: [
          {
            amount: '500000000000000000',
            from: 'eip155:eoa:0x494042504a8148a6d00ab10ed26043f5579ce00f',
            token: 'eip155:137/slip44:966',
            timestamp: getTime(new Date()),
            rates: { 'fiat:usd': '0.90', 'fiat:eur': '1.10' },
            chainId: 137,
            initiatedBy: FIXTURE.USER.Alice.id
          }
        ]
      }
    ]
  }
}

export const grantPermission = async () => {
  return {
    request: {
      action: Action.GRANT_PERMISSION,
      resourceId: Resource.VAULT,
      nonce: uuid(),
      permissions: [Permission.WALLET_CREATE, Permission.WALLET_READ, Permission.WALLET_IMPORT]
    },
    metadata: {
      expiresIn: 600
    }
  }
}

export const signMessage = async () => {
  return {
    request: {
      resourceId: FIXTURE.ACCOUNT.Engineering.id,
      action: 'signMessage',
      nonce: uuid(),
      message: 'Narval Testing'
    }
  }
}
