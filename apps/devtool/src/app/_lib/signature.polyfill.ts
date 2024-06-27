import { Hex, Jwk, RsaPublicKey, rsaPublicKeySchema } from '@narval/signature'
import { validateJwk } from 'packages/signature/src/lib/validate'
import { toHex } from 'viem'

export const browserRsaPubKeyToHex = async (jwk: Jwk): Promise<Hex> => {
  const key = validateJwk<RsaPublicKey>({
    schema: rsaPublicKeySchema,
    jwk,
    errorMessage: 'Invalid RSA Public Key'
  })

  const subtle = window.crypto.subtle

  if (!subtle) throw new Error('SubtleCrypto is not available, you need to use a secure context to import RSA keys')

  const imported = await subtle.importKey(
    'jwk',
    key,
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256'
    },
    true,
    ['verify']
  )

  const keyData = await subtle.exportKey('spki', imported)

  return toHex(new Uint8Array(keyData))
}
