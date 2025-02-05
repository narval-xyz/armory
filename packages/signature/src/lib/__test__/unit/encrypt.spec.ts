import { rsaDecrypt, rsaEncrypt } from '../../encrypt'
import { Alg } from '../../types'
import { generateJwk, rsaPrivateKeyToPublicKey } from '../../utils'

describe('encrypt / decrypt', () => {
  it('should encrypt & decrypt with RS256 key', async () => {
    const rsaPrivate = await generateJwk(Alg.RS256, { use: 'enc' })
    const data = 'myTestDataString'

    const rsaPublic = rsaPrivateKeyToPublicKey(rsaPrivate)
    const encrypted = await rsaEncrypt(data, rsaPublic)
    const decrypted = await rsaDecrypt(encrypted, rsaPrivate)
    expect(decrypted).toEqual(data)
  })
})
