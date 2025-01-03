import { Alg, generateJwk } from '@narval-xyz/armory-sdk'
import { privateKeyToHex, publicKeyToHex } from '@narval-xyz/armory-sdk/signature'

const main = async () => {
  const key = await generateJwk(Alg.EDDSA)
  const privateKeyHex = await privateKeyToHex(key)
  const publicKeyHex = await publicKeyToHex(key)

  console.log({
    key,
    privateKeyHex,
    publicKeyHex
  })
}

main()
  .then(() => console.log('done'))
  .catch(console.error)
