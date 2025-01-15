import { vaultClient } from './vault.client'

const main = async () => {
  const wallets = await vaultClient.startSync({ data: { connectionId: process.env.CONNECTION_ID || 'xxx' } })

  console.log(wallets)
}

main()
  .then(() => console.log('done'))
  .catch(console.error)
