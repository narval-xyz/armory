import { FIXTURE } from '@narval/policy-engine-shared'
import { Payload, SigningAlg, buildSignerEip191, hash, secp256k1PrivateKeyToJwk, signJwt } from '@narval/signature'
import { generatePrivateKey } from 'viem/accounts'
import { ApplicationException } from '../../../../shared/exception/application.exception'
import { SignatureService } from '../../service/signature.service'

describe(SignatureService.name, () => {
  const signatureService = new SignatureService()
  const DATA_STORE_PRIVATE_KEY = '7cfef3303797cbc7515d9ce22ffe849c701b0f2812f999b0847229c47951fca5'
  const jwk = secp256k1PrivateKeyToJwk(`0x${DATA_STORE_PRIVATE_KEY}`)

  it('throws an exception if the payload iat is older than the db createdAt date', async () => {
    const payload: Payload = {
      data: hash(FIXTURE.ENTITIES),
      sub: 'test-root-user-uid',
      iss: 'https://armory.narval.xyz',
      iat: Math.floor(new Date('2023-01-01').getTime() / 1000) // in seconds
    }

    const signature = await signJwt(payload, jwk, { alg: SigningAlg.EIP191 }, buildSignerEip191(DATA_STORE_PRIVATE_KEY))

    await expect(() =>
      signatureService.verifySignature({
        pubKey: jwk,
        payload: { signature, data: FIXTURE.ENTITIES },
        date: new Date('2024-01-01')
      })
    ).rejects.toThrow(ApplicationException)
  })

  it('throws an exception if the JWT signature is invalid', async () => {
    const payload: Payload = {
      data: hash(FIXTURE.ENTITIES),
      sub: 'test-root-user-uid',
      iss: 'https://armory.narval.xyz',
      iat: Math.floor(new Date('2024-01-01').getTime() / 1000) // in seconds
    }

    const randomPrivateKey = generatePrivateKey()

    const signature = await signJwt(payload, jwk, { alg: SigningAlg.EIP191 }, buildSignerEip191(randomPrivateKey))

    await expect(() =>
      signatureService.verifySignature({
        pubKey: jwk,
        payload: { signature, data: FIXTURE.ENTITIES },
        date: new Date('2023-01-01')
      })
    ).rejects.toThrow(ApplicationException)

    await expect(() =>
      signatureService.verifySignature({
        pubKey: jwk,
        payload: { signature, data: FIXTURE.ENTITIES },
        date: new Date('2023-01-01')
      })
    ).rejects.toThrow('Invalid JWT: Invalid signature')
  })

  it('returns true if the payload iat is more recent than the db createdAt date', async () => {
    const payload: Payload = {
      data: hash(FIXTURE.ENTITIES),
      sub: 'test-root-user-uid',
      iss: 'https://armory.narval.xyz',
      iat: Math.floor(new Date('2024-01-01').getTime() / 1000) // in seconds
    }

    const signature = await signJwt(payload, jwk, { alg: SigningAlg.EIP191 }, buildSignerEip191(DATA_STORE_PRIVATE_KEY))

    const result = await signatureService.verifySignature({
      pubKey: jwk,
      payload: { signature, data: FIXTURE.ENTITIES },
      date: new Date('2023-01-01')
    })

    expect(result).toEqual(true)
  })
})
