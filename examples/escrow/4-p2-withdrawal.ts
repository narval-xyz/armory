import { Decision, resourceId, TransactionRequest } from '@narval-xyz/armory-sdk'
import { hexSchema } from '@narval-xyz/armory-sdk/policy-engine-shared'
import 'dotenv/config'
import minimist from 'minimist'
import { v4 } from 'uuid'
import { Hex, toHex } from 'viem'
import { getArmoryClients } from './armory.sdk'

const getWithdrawalRequest = ({
  playerTwoColdWalletAddress,
  escrowAddress
}: {
  playerTwoColdWalletAddress: Hex
  escrowAddress: Hex
}) => {
  const tx: TransactionRequest = {
    to: playerTwoColdWalletAddress,
    from: escrowAddress,
    chainId: 1,
    value: toHex(1000)
  }

  return tx
}

const main = async () => {
  const playerTwoPrivateKey = hexSchema.parse(process.env.PLAYER_TWO_PRIVATE_KEY)
  const vaultHost = process.env.VAULT_HOST
  const authHost = process.env.AUTH_HOST
  const clientId = process.env.CLIENT_ID
  const clientSecret = process.env.CLIENT_SECRET
  const playerTwoColdWalletAddress = hexSchema.parse(process.env.PLAYER_TWO_EXTERNAL_WALLET_ADDRESS)
  const args = minimist(process.argv.slice(2), {
    string: ['_']
  })
  const escrowAddress = hexSchema.parse(args._[0])

  if (!authHost || !vaultHost || !clientId || !clientSecret) {
    throw new Error('Missing configuration')
  }

  const tx = getWithdrawalRequest({
    playerTwoColdWalletAddress,
    escrowAddress
  })
  console.log('📝 Settlement transaction:', tx)

  const armory = await getArmoryClients(playerTwoPrivateKey, {
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
      console.log(`To approve, run:\n\n\t\x1b[1m\x1b[33mtsx 5-p1-approval.ts ${response.authId}\x1b[0m\n`)
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
