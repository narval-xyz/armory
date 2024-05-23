/**
 * THIS IS NOT A PROD FILE.
 * This is a demo of TSM where it's controlling 3 nodes from the same Engine. This can be useful locally when not running multiple nodes.
 */

import { ConfigService } from '@narval/config-module'
import { Alg, Hex, PublicKey, eip191Hash, hexToBase64Url, publicKeyToJwk } from '@narval/signature'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { Configuration, SessionConfig, TSMClient, curves } from '@sepior/tsmsdkv2'
import { toHex } from 'viem'
import { Config } from '../../../policy-engine.config'
import { ApplicationException } from '../../../shared/exception/application.exception'
import { SignerConfig } from '../../../shared/type/domain.type'
import { SigningService } from './signing.service.interface'

/**
 * Temp references for TSM
 */
const node0 = {
  url: 'http://host.docker.internal:8500',
  apiKey: 'apikey0'
}
const node1 = {
  url: 'http://host.docker.internal:8501',
  apiKey: 'apikey1'
}
const node2 = {
  url: 'http://host.docker.internal:8502',
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
  private url: string
  private apiKey: string
  private playerCount: number

  constructor(@Inject(ConfigService) private configService: ConfigService<Config>) {
    const tsm = this.configService.get('tsm')
    if (!tsm) {
      throw new ApplicationException({
        message: 'TSM config not found',
        suggestedHttpStatusCode: 500
      })
    }
    this.url = tsm.url
    this.apiKey = tsm.apiKey
    this.playerCount = tsm.playerCount
  }

  async generateKey(keyId?: string, sessionId?: string): Promise<{ publicKey: PublicKey }> {
    if (!sessionId) {
      throw new ApplicationException({
        message: 'sessionId is missing',
        suggestedHttpStatusCode: 500
      })
    }
    const sessionConfig = await SessionConfig.newStaticSessionConfig(sessionId, this.playerCount)

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

  // Note: sessionId must be optional so we meet the SignerService interface requirement
  buildSignerEip191(signer: SignerConfig, sessionId?: string) {
    return async (messageToSign: string): Promise<string> => {
      const hash = eip191Hash(messageToSign)
      if (!sessionId) {
        throw new ApplicationException({
          message: 'sessionId is missing',
          suggestedHttpStatusCode: 500
        })
      }

      const sessionConfig = await SessionConfig.newStaticSessionConfig(sessionId, this.playerCount)

      const tsmClient0 = await createClient(node0.url, node0.apiKey)
      const tsmClient1 = await createClient(node1.url, node1.apiKey)
      const tsmClient2 = await createClient(node2.url, node2.apiKey)
      const keyId = signer.keyId || signer.publicKey?.kid
      if (!keyId) throw new Error('missing kid in buildSigner')

      const derivationPath = new Uint32Array()
      const partialSigs = await Promise.all([
        tsmClient0.ECDSA().sign(sessionConfig, keyId, derivationPath, hash),
        tsmClient1.ECDSA().sign(sessionConfig, keyId, derivationPath, hash),
        tsmClient2.ECDSA().sign(sessionConfig, keyId, derivationPath, hash)
      ])

      // // NOTE TSM returns a DER signature
      // const { signature, recoveryID } = await tsmClient0
      //   .ECDSA()
      //   .finalizeSignature(hash, partialSigs)
      // const sig = secp256k1.Signature.fromDER(signature)

      // const hexSignature: Hex = `0x${sig.toCompactHex()}${toHex(27n + BigInt(recoveryID)).slice(2)}`

      // const sig = secp256k1.Signature.fromDER(partialSigs[0])
      const hexSignature: Hex = toHex(partialSigs[0])

      // const signature = signSecp256k1(hash, privateKey, true)
      this.logger.log(hexSignature)

      return hexToBase64Url(hexSignature)
    }
  }
}
