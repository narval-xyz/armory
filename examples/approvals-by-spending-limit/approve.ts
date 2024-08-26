import { AuthClient, AuthConfig, buildSignerEip191, privateKeyToJwk } from "@narval/armory-sdk"
import { hexSchema } from "@narval/policy-engine-shared"
import minimist from "minimist"
import 'dotenv/config'

const main = async () => {
  console.log('Starting...')

  const args = minimist(process.argv.slice(2))

  const userType = args.user
  const authId = args._[0]

  // Check if userType is provided
  if (!userType) {
    console.error('Please specify the user type: --user=member or --user=admin')
    process.exit(1)
  }

  // Check if authId is provided
  if (!authId) {
    console.error('Please provide the authId as the second argument')
    process.exit(1)
  }

  const CRED =
    userType === 'admin' ? hexSchema.parse(process.env.ADMIN_USER_CRED) : hexSchema.parse(process.env.MEMBER_USER_CRED)

  const AUTH_HOST = process.env.AUTH_HOST
  const AUTH_CLIENT_ID = process.env.AUTH_CLIENT_ID

  if (
    !AUTH_HOST ||
    !AUTH_CLIENT_ID
  ) {
    console.error('Missing environment variables')
    return
  }

  const authJwk = privateKeyToJwk(CRED)

  const authConfig: AuthConfig = {
    host: AUTH_HOST,
    clientId: AUTH_CLIENT_ID,
    signer: {
      jwk: authJwk,
      alg: 'EIP191',
      sign: buildSignerEip191(CRED)
    }
  }

  const auth = new AuthClient(authConfig)

  const authRequest = await auth.getAuthorizationById(authId)
  console.log('### authRequestBeforeApproval', JSON.stringify(authRequest, null, 2))

  await auth.approve(authId)

  const approvedAuthorizationRequest = await auth.getAuthorizationById(authId)
  console.log('### approvedAuthorizationRequest', JSON.stringify(approvedAuthorizationRequest, null, 2))
  console.log('Done')
}

main().catch(console.error)