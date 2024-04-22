import { Polygon } from '@thirdweb-dev/chains'
import { InAppWallet, SmartWallet } from '@thirdweb-dev/wallets'
import { LocalWalletNode } from '@thirdweb-dev/wallets/evm/wallets/local-wallet-node'

const createSmartAccount = async (eoa?: InAppWallet) => {
  const factoryAddress = '0x61ffcc675cfbf8e0A35Cd6140bfe40Fe94DF845f'
  const secretKey = process.env.THIRDWEB_SECRET as string

  const adminWallet = new LocalWalletNode()
  await adminWallet.loadOrCreate({
    strategy: 'encryptedJson',
    password: 'password'
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

  smartWallet.connect({
    personalWallet: adminWallet
  })

  return smartWallet
}

export default createSmartAccount
