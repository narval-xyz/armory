import { PublicKey, RsaPublicKey, publicKeyToHex, publicKeyToPem } from '@narval/signature'

export const formatPublicKey = async (publicKey: PublicKey) => {
  return {
    keyId: publicKey.kid,
    jwk: publicKey,
    hex: await publicKeyToHex(publicKey)
  }
}

export const formatRsaPublicKey = async (rsaPublicKey: RsaPublicKey) => {
  const pem = await publicKeyToPem(rsaPublicKey, rsaPublicKey.alg)

  return {
    keyId: rsaPublicKey.kid,
    jwk: rsaPublicKey,
    pem: Buffer.from(pem).toString('base64')
  }
}
