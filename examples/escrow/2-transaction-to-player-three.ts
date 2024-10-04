import { resourceId, TransactionRequest } from '@narval-xyz/armory-sdk'
import { Decision, hexSchema } from '@narval-xyz/armory-sdk/policy-engine-shared'
import 'dotenv/config'
import minimist from 'minimist'
import { v4 } from 'uuid'
import { Hex, toHex } from 'viem'
import { getArmoryClients } from './armory.sdk'

const getLoss = () => 10000

const calculateSettlementTransaction = ({
  playerThreeAddress,
  escrowAddress
}: {
  playerThreeAddress: Hex
  escrowAddress: Hex
}) => {
  const tx: TransactionRequest = {
    to: playerThreeAddress,
    from: escrowAddress,
    chainId: 1,
    value: toHex(getLoss())
  }

  return tx
}

const main = async () => {
  const playerOnePrivateKey = hexSchema.parse(process.env.PLAYER_ONE_PRIVATE_KEY)
  const vaultHost = process.env.VAULT_HOST
  const authHost = process.env.AUTH_HOST
  const clientId = process.env.CLIENT_ID
  const clientSecret = process.env.CLIENT_SECRET
  const playerThreeAddress = hexSchema.parse(process.env.PLAYER_THREE_ADDRESS)

  const args = minimist(process.argv.slice(2), {
    string: ['_']
  })
  const escrowAddress = hexSchema.parse(args._[0])

  if (!authHost || !vaultHost || !clientId || !clientSecret) {
    throw new Error('Missing configuration')
  }

  const tx = calculateSettlementTransaction({
    playerThreeAddress,
    escrowAddress
  })
  console.log('📝 Settlement transaction:', tx)

  const armory = await getArmoryClients(playerOnePrivateKey, {
    clientId,
    clientSecret,
    vaultHost,
    authHost
  })

  const nonce = v4()

  console.log('🚦 Asking permission to sign the transaction')
  const response = await armory.authClient.authorize({
    resourceId: resourceId(escrowAddress),
    action: 'signTransaction',
    nonce,
    transactionRequest: tx
  })

  switch (response.decision) {
    case Decision.PERMIT: {
      console.log('✅ Transaction approved \n')
      console.log('🔐 Approval token: \n', response.accessToken.value)
      break
    }
    case Decision.CONFIRM: {
      console.log('🔐 Request needs approvals', { authId: response.authId }, '\n')
      console.table(response.approvals.missing)
      // ... existing code ...
      console.log(`To approve, run:\n\n\t\x1b[1m\x1b[33mtsx 3-p2-approval.ts ${response.authId}\x1b[0m\n`)
      // ... existing code ...
      break
    }
    case Decision.FORBID: {
      console.error('❌ Unauthorized')
      console.log('🔍 Response', response, '\n')
    }
  }
}

main().catch(console.error)
