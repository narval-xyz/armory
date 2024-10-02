/* eslint-disable no-console */
import { AuthClient, AuthConfig, Decision, buildSignerEip191, privateKeyToJwk } from '@narval-xyz/armory-sdk'
import { hexSchema } from '@narval-xyz/armory-sdk/policy-engine-shared'
import 'dotenv/config'
import minimist from 'minimist'

const main = async () => {
  const args = minimist(process.argv.slice(2))
  const authId = args._[0]

  console.log(`\x1b[32m🚀 Approving Transfer as Player One\x1b[0m - \x1b[36m${authId}\x1b[0m \n`)

  const playerOnePrivateKey = hexSchema.parse(process.env.PLAYER_ONE_PRIVATE_KEY)
  const host = process.env.AUTH_HOST
  const clientId = process.env.CLIENT_ID
  if (!host || !clientId) {
    throw new Error('Missing configuration')
  }

  const authJwk = privateKeyToJwk(playerOnePrivateKey)
  const signer = buildSignerEip191(playerOnePrivateKey)
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

  const authRequest = await auth.getAuthorizationById(authId)
  console.log('🔎 Found pending request \n')

  await auth.approve(authId)
  const approvedAuthorizationRequest = await auth.getAuthorizationById(authId)
  console.log('🔎 Found approved request \n')
  const permit = approvedAuthorizationRequest.evaluations.find(({ decision }) => decision === Decision.PERMIT)

  if (permit) {
    console.log('✅ Transaction approved \n')
    console.log('🔐 Approval token: \n', permit.signature)
    return
  }

  const confirm = approvedAuthorizationRequest.evaluations.find(({ decision }) => decision === Decision.CONFIRM)

  if (confirm) {
    console.log('🔐 Request still needs approvals', { authId: approvedAuthorizationRequest.id }, '\n')
    console.table(confirm.approvalRequirements?.missing)
    console.table(confirm.approvalRequirements?.satisfied)
    return
  }

  console.error('❌ Unauthorized')
  console.log('🔍 Response', approvedAuthorizationRequest, '\n')
}

main().catch(console.error)
