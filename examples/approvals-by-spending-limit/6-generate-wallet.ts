/* eslint-disable no-console */
import { AuthClient, AuthConfig, Permission, buildSignerEip191, privateKeyToJwk } from '@narval-xyz/armory-sdk'
import { Action, hexSchema } from '@narval-xyz/armory-sdk/policy-engine-shared'
import 'dotenv/config'
import { v4 } from 'uuid'

const main = async () => {
  console.log(`🚀 Generate Wallet \n`)
  const adminUserPrivateKey = hexSchema.parse(process.env.ADMIN_USER_PRIVATE_KEY)
  const host = process.env.AUTH_HOST
  const clientId = process.env.CLIENT_ID
  if (!host || !clientId) {
    throw new Error('Missing configuration')
  }

  const authJwk = privateKeyToJwk(adminUserPrivateKey)
  const signer = buildSignerEip191(adminUserPrivateKey)
  const authConfig: AuthConfig = {
    host,
    clientId,
    signer: {
      jwk: authJwk,
      alg: 'EIP191',
      sign: signer
    }
  }
  const auth = new AuthClient(authConfig)

  const nonces = [v4()]
  const tokens = await Promise.all(
    nonces.map((nonce) =>
      auth.requestAccessToken({
        action: Action.GRANT_PERMISSION,
        resourceId: 'vault',
        nonce,
        permissions: [Permission.WALLET_CREATE]
      })
    )
  )

  tokens.map((token, i) => {
    if (!token) {
      console.error('❌ Unauthorized, nonce: ', nonces[i])
      return
    }
    console.log('🔐 Approval token: \n', token.value)
  })
}

main().catch(console.error)
