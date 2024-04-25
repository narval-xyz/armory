import { Polygon } from '@thirdweb-dev/chains'
import { ThirdwebSDK, UserWallet, getSignerAndProvider } from '@thirdweb-dev/sdk'
import { SmartWallet } from '@thirdweb-dev/wallets'
import { Wallet } from 'ethers'
import { Hex } from 'viem'

const generateSmartAccount = async (eoaPrivateKey: Hex): Promise<UserWallet> => {
  const factoryAddress = '0x61ffcc675cfbf8e0A35Cd6140bfe40Fe94DF845f'
  const secretKey = process.env.THIRDWEB_SECRET as string
  const res = getSignerAndProvider(Polygon)
  const account = new Wallet(eoaPrivateKey, res[1])

  console.log('Admin wallet address:', account.address)

  const getSigner = async () => account
  const config = {
    chain: Polygon,
    factoryAddress,
    secretKey,
    gasless: true
  }

  const smartWallet = new SmartWallet(config)
  await smartWallet.connect({
    personalWallet: { getSigner }
  })

  const { wallet } = await ThirdwebSDK.fromWallet(smartWallet, Polygon)

  return wallet
}

export default generateSmartAccount
