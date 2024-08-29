import { Curves, KeyTypes, PublicKey, SigningAlg, hexToBase64Url } from '@narval/armory-sdk'
import { signMessage } from '@wagmi/core'
import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { config } from '../_lib/config'

const useAccountSignature = () => {
  const account = useAccount()
  const [jwk, setJwk] = useState<PublicKey>()

  useEffect(() => {
    if (!account.address) return

    setJwk({
      kty: KeyTypes.EC,
      crv: Curves.SECP256K1,
      alg: SigningAlg.ES256K,
      kid: account.address,
      addr: account.address
    })
  }, [account.address])

  const signer = async (message: string) => {
    const signature = await signMessage(config, { message })

    return hexToBase64Url(signature)
  }

  return { jwk, signer }
}

export default useAccountSignature
