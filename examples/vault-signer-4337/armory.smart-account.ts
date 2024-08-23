/* eslint-disable no-console */

import { SimpleSmartAccount } from 'permissionless/accounts'
import { v4 } from 'uuid'
import { HttpTransport } from 'viem'
import { getChainId } from 'viem/actions'
import { Action, UserOperationV6 } from '../../packages/policy-engine-shared/src'
import { Sdk } from './armory.account'

export const simpleSmartAccountWithNarval = (
  simpleSmartAccount: SimpleSmartAccount<'0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789', HttpTransport, undefined>,
  narvalSdk: Sdk,
  signerId: string
): SimpleSmartAccount<'0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789', HttpTransport, undefined> => {
  const signUserOperation = async (userOp: any) => {
    // TODO: elegant and modular typing for userOp and account
    const factoryAddress = await simpleSmartAccount.getFactory()
    const chainId = await getChainId(simpleSmartAccount.client)
    const signature = await simpleSmartAccount.getDummySignature(userOp as any)

    const result = UserOperationV6.safeParse({
      ...userOp,
      chainId,
      factoryAddress,
      signature,
      entryPoint: simpleSmartAccount.entryPoint
    })
    if (!result.success) {
      throw new Error('Invalid user operation')
    }
    const nonce = v4()
    const accessToken = await narvalSdk.authClient
      .requestAccessToken({
        action: Action.SIGN_USER_OPERATION,
        resourceId: signerId,
        userOperation: result.data,
        nonce
      })
      .catch((e: unknown) => {
        console.error(e)
      })

    if (!accessToken) {
      console.error('Unauthorized')
      process.exit(0)
    }

    const signedUserOp = await narvalSdk.vaultClient.sign({
      data: {
        action: Action.SIGN_USER_OPERATION,
        resourceId: signerId,
        nonce,
        userOperation: result.data
      },
      accessToken
    })

    return signedUserOp.signature
  }
  return {
    ...simpleSmartAccount,
    signUserOperation
  }
}
