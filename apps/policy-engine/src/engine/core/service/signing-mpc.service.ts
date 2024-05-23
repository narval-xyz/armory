import { Alg, Hex, PublicKey, eip191Hash, hexToBase64Url, publicKeyToJwk } from '@narval/signature'
import { Injectable, Logger } from '@nestjs/common'
import { secp256k1 } from '@noble/curves/secp256k1'
import { Configuration, SessionConfig, TSMClient, curves } from '@sepior/tsmsdkv2'
import { toHex } from 'viem'
import { SignerConfig } from '../../../shared/type/domain.type'
import { SigningService } from './signing.service.interface'

/**
 * Temp references for TSM
 */
const node0 = {
  url: 'http://localhost:8500',
  apiKey: 'apikey0'
}
const node1 = {
  url: 'http://localhost:8501',
  apiKey: 'apikey1'
}
const node2 = {
  url: 'http://localhost:8502',
  apiKey: 'apikey2'
}

const createClient = async (url: string, apiKey: string) => {
  const config = await new Configuration(url)
  await config.withAPIKeyAuthentication(apiKey)
  return await TSMClient.withConfiguration(config)
}

@Injectable()
export class MpcSigningService implements SigningService {
  private logger = new Logger(MpcSigningService.name)

  constructor() {}

  async generateKey(keyId?: string): Promise<{ publicKey: PublicKey }> {
    const sessionID = await SessionConfig.GenerateSessionID()
    const sessionConfig = await SessionConfig.newStaticSessionConfig(sessionID, 3)

    const tsmClient0 = await createClient(node0.url, node0.apiKey)
    const tsmClient1 = await createClient(node1.url, node1.apiKey)
    const tsmClient2 = await createClient(node2.url, node2.apiKey)

    const generateKeyPromises = [
      tsmClient0.ECDSA().generateKey(sessionConfig, 1, curves.SECP256K1, keyId),
      tsmClient1.ECDSA().generateKey(sessionConfig, 1, curves.SECP256K1, keyId),
      tsmClient2.ECDSA().generateKey(sessionConfig, 1, curves.SECP256K1, keyId)
    ]

    const keyIDResults = await Promise.allSettled(generateKeyPromises)

    let ecdsaKeyId

    for (const result of keyIDResults) {
      if (result.status === 'fulfilled') {
        if (!result.value || (ecdsaKeyId && ecdsaKeyId !== result.value) || (keyId && keyId !== result.value)) {
          throw new Error('Key ID mismatch')
        }
        ecdsaKeyId = result.value
        break
      } else {
        this.logger.log('Error in keygen', result.reason)
        throw new Error('Error in keygen')
      }
    }
    if (!ecdsaKeyId) {
      throw new Error('No key ID generated')
    }

    this.logger.log('Generated ECDSA key with ID: ', ecdsaKeyId)

    // Ensure each node has the same public key
    const publicKeys = await Promise.all([
      tsmClient0.ECDSA().publicKey(ecdsaKeyId),
      tsmClient1.ECDSA().publicKey(ecdsaKeyId),
      tsmClient2.ECDSA().publicKey(ecdsaKeyId)
    ])
    // This is DER-encoded SPKI public key, so we need to slice off the DER header, which is 23 bytes for secp256k1
    const publicKeysHex = publicKeys.map((spki) => toHex(spki.slice(23)))

    const publicKey = publicKeysHex.every((key) => key === publicKeysHex[0]) ? publicKeysHex[0] : null
    this.logger.log('Public key: ', publicKey)
    if (!publicKey) throw new Error('Failed to generate public key')

    return {
      publicKey: publicKeyToJwk(publicKey, Alg.ES256K, ecdsaKeyId)
    }
  }

  buildSignerEip191(signer: SignerConfig) {
    return async (messageToSign: string): Promise<string> => {
      const hash = eip191Hash(messageToSign)

      const sessionID = await SessionConfig.GenerateSessionID()
      const sessionConfig = await SessionConfig.newStaticSessionConfig(sessionID, 3)

      const tsmClient0 = await createClient(node0.url, node0.apiKey)
      const tsmClient1 = await createClient(node1.url, node1.apiKey)
      const tsmClient2 = await createClient(node2.url, node2.apiKey)
      if (!signer.keyId) throw new Error('missing kid in buildSigner')

      const derivationPath = new Uint32Array()
      const partialSigs = await Promise.all([
        tsmClient0.ECDSA().sign(sessionConfig, signer.keyId, derivationPath, hash),
        tsmClient1.ECDSA().sign(sessionConfig, signer.keyId, derivationPath, hash),
        tsmClient2.ECDSA().sign(sessionConfig, signer.keyId, derivationPath, hash)
      ])

      // NOTE TSM returns a DER signature
      const { signature, recoveryID } = await tsmClient0
        .ECDSA()
        .finalizeSignature(hash, partialSigs as unknown as Uint8Array[])
      const sig = secp256k1.Signature.fromDER(signature)

      const hexSignature: Hex = `0x${sig.toCompactHex()}${toHex(27n + BigInt(recoveryID)).slice(2)}`
      // const signature = signSecp256k1(hash, privateKey, true)
      this.logger.log(hexSignature)

      return hexToBase64Url(hexSignature)
    }
  }
}
