import { Polygon } from '@thirdweb-dev/chains'
import { ThirdwebSDK, UserWallet } from '@thirdweb-dev/sdk'
import { LocalWallet, SmartWallet } from '@thirdweb-dev/wallets'
import { Hex } from 'viem'

const generateSmartAccount = async (eoaPrivateKey: Hex): Promise<UserWallet> => {
  const factoryAddress = '0x61ffcc675cfbf8e0A35Cd6140bfe40Fe94DF845f'
  const secretKey = process.env.THIRDWEB_SECRET as string

  const adminWallet = new LocalWallet({
    secretKey: eoaPrivateKey
  })

  await adminWallet.loadOrCreate({
    strategy: 'privateKey',
    encryption: false
  })

  const adminWalletAddress = await adminWallet.getAddress()
  console.log('Admin wallet address:', adminWalletAddress)

  const config = {
    chain: Polygon,
    factoryAddress,
    secretKey,
    gasless: true
  }

  const smartWallet = new SmartWallet(config)
  await smartWallet.connect({
    personalWallet: adminWallet
  })

  const sdk = await ThirdwebSDK.fromWallet(smartWallet, Polygon)

  return sdk.wallet
}

export default generateSmartAccount
