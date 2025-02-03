import { BitGo } from 'bitgo'
import dotenv from 'dotenv'

dotenv.config()

const main = async () => {
  const WALLET_ID = '6784d7a77e4213f088e81b36ed7dd699'
  const bitgo = new BitGo({
    env: 'prod',
    accessToken: process.env.BITGO_ACCESS_TOKEN
  })

  const sui = await bitgo.coin('sui')
  // const wallets = await (await sui.wallets().list()).wallets
  const wallet = await sui.wallets().get({ id: WALLET_ID })
  console.log(wallet._wallet)
  const stakingWallet = await wallet.toStakingWallet()
  // const stakeRes = await stakingWallet.stake({
  //   amount: '1000000000', // 1 SUI = 10^9 MIST, similar to 1 ETH = 10^18 WEI
  //   validator: '0x92c7bf9914897e8878e559c19a6cffd22e6a569a6dd4d26f8e82e0f2ad1873d6' // Kiln validator, from BitGo UI
  // })
  // console.log('StakingRequest - Response', stakeRes)
  let transactions
  do {
    // transactions = await stakingWallet.getStakingRequest(stakeRes.id)
    transactions = await stakingWallet.getStakingRequest('9fd7864f-738d-40a4-a584-49f6ad4d327c')
    if (!transactions.transactions.some((tx) => tx.txRequestId)) {
      console.log('Waiting for transactions to be ready to sign; txRequestId not found', transactions)
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Wait 1 second before polling again
    }
  } while (!transactions.transactions.some((tx) => tx.txRequestId))

  console.log('Transactions Ready to Sign', transactions)
  // if (!transactions.allSigningComplete && transactions.transactions.length > 0) {
  //   for (const transaction of transactions.transactions) {
  //     console.log('Signing and Sending Transaction', transaction)
  //     // const res = await stakingWallet.buildSignAndSend(
  //     //   { walletPassphrase: process.env.BITGO_WALLET_PASSPHRASE || '' },
  //     //   transaction
  //     // )
  //     // console.log('Build and Send Response', res)
  //   }
  // }
}

main()
  .then(() => console.log('done'))
  .catch(console.error)

const x = {
  intent: {
    intentType: 'payment',
    recipients: [
      {
        address: { address: '0x14e7e397d684856f28ad09d04cc550eab2b16e23' },
        amount: { value: '10000000000000000', symbol: 'hteth' }
      }
    ]
  },
  apiVersion: 'full',
  preview: false
}
