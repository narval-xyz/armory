import { BitGo } from 'bitgo'
import dotenv from 'dotenv'

dotenv.config()

const stakingWalletId = '678a30728bda4b5d7a23a1896e031cda'
const stakingWalletAddress = '0xa9d15711933cfcd8332131eeed76ec9054e40518'
const defaultWalletId = '678a2a006bb272c9d62870f1994291ab'
const defaultWalletAddress = '0xdee7439a1f337d645df0b6804aaabc6ea4a17972'

const main = async () => {
  const bitgo = new BitGo({
    env: (process.env.BITGO_ENV as any) || 'test',
    accessToken: process.env.BITGO_ACCESS_TOKEN
  })
  const coin = 'hteth'

  const myCoin = await bitgo.coin(coin)

  // const wallets = await (await sui.wallets().list()).wallets
  const wallet = await myCoin.wallets().get({ id: stakingWalletId })
  console.log(wallet._wallet)

  const transfer = await wallet.prebuildAndSignTransaction({
    recipients: [
      {
        tokenData: {
          tokenType: 'ERC20' as any,
          tokenQuantity: '4100000000000000',
          tokenContractAddress: '0x94373a4919b3240d86ea41593d5eba789fef3848',
          tokenName: 'tweth', // This is the TokenId from https://developers.bitgo.com/coins/test-ethereum-terc20-tokens
          decimalPlaces: undefined
        },

        amount: '0', // 0.0141 ETH in wei (1 ETH = 10^18 wei)
        address: defaultWalletAddress
      }
    ],
    walletPassphrase: process.env.BITGO_WALLET_PASSPHRASE,
    type: 'transfertoken'
  })
  console.log('transfer', transfer)
  // console.log('txRequestId to Poll', transfer?.txRequest?.txRequestId)
}

main()
  .then(() => console.log('done'))
  .catch(console.error)
