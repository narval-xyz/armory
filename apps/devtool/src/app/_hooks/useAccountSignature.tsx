import {
  Curves,
  JwsdHeader,
  KeyTypes,
  Payload,
  PublicKey,
  SigningAlg,
  hash,
  hexToBase64Url,
  signJwsd,
  signJwt
} from '@narval/signature'
import { signMessage } from '@wagmi/core'
import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { config } from '../_lib/config'
import useStore from './useStore'

const useAccountSignature = () => {
  const account = useAccount()
  const [jwk, setJwk] = useState<PublicKey>()
  const { vaultUrl } = useStore()

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

  const signAccountJwt = async (payload: Payload) => {
    if (!jwk) return ''

    const signature = await signJwt(payload, jwk, { alg: SigningAlg.EIP191 }, signer)

    return signature
  }

  const signAccountJwsd = async (payload: { request: Request }, accessToken: string) => {
    if (!jwk) return ''

    const jwsdHeader: JwsdHeader = {
      alg: SigningAlg.EIP191,
      kid: jwk.kid,
      typ: 'gnap-binding-jwsd',
      htm: 'POST',
      uri: `${vaultUrl}/sign`,
      created: new Date().getTime(),
      ath: hexToBase64Url(hash(accessToken))
    }

    const signature = await signJwsd(payload, jwsdHeader, signer).then((jws) => {
      const parts = jws.split('.')
      parts[1] = ''
      return parts.join('.')
    })

    return signature
  }

  return { jwk, signAccountJwt, signAccountJwsd }
}

export default useAccountSignature
