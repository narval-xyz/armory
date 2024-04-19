import { FIXTURE } from '@narval/policy-engine-shared'
import { Alg, Payload, SigningAlg, buildSignerEip191, hash, privateKeyToJwk, signJwt } from '@narval/signature'
import { Injectable } from '@nestjs/common'

@Injectable()
export class FakeVaultService {
  async signDataPayload(data: any) {
    const jwk = privateKeyToJwk(FIXTURE.UNSAFE_PRIVATE_KEY.Root, Alg.ES256K)

    const payload: Payload = {
      data: hash(data),
      sub: FIXTURE.ACCOUNT.Root.address,
      iss: 'https://armory.narval.xyz',
      iat: Math.floor(Date.now() / 1000)
    }

    const signature = await signJwt(
      payload,
      jwk,
      { alg: SigningAlg.EIP191 },
      buildSignerEip191(FIXTURE.UNSAFE_PRIVATE_KEY.Root)
    )

    return signature
  }
}
