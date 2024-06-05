import { CompactEncrypt, compactDecrypt, importJWK } from 'jose'
import { RsaPrivateKey, RsaPublicKey } from './types'

export async function rsaEncrypt(data: string, rsaKey: RsaPrivateKey | RsaPublicKey): Promise<string> {
  const key = await importJWK(rsaKey, 'RSA-OAEP-256')
  const jwe = await new CompactEncrypt(new TextEncoder().encode(data))
    .setProtectedHeader({
      kid: rsaKey.kid,
      alg: 'RSA-OAEP-256',
      enc: 'A256GCM'
    })
    .encrypt(key)
  return jwe
}

export async function rsaDecrypt(jwe: string, rsaKey: RsaPrivateKey): Promise<string> {
  const key = await importJWK(rsaKey)
  const { plaintext } = await compactDecrypt(jwe, key)
  return new TextDecoder().decode(plaintext)
}
