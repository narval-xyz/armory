import { Payload, PrivateKey, SigningAlg, buildSignerEip191, buildSignerEs256k, signJwt } from '@narval/signature'
import { Injectable } from '@nestjs/common'
type SignOptions = {
  alg?: SigningAlg
}

@Injectable()
export class SigningService {
  constructor() {}

  async sign(payload: Payload, jwk: PrivateKey, opts: SignOptions = {}): Promise<string> {
    const alg: SigningAlg = opts.alg || jwk.alg
    if (alg === SigningAlg.ES256K) {
      const pk = jwk.d
      const jwt = await signJwt(payload, jwk, opts, buildSignerEs256k(pk))

      return jwt
    } else if (alg === SigningAlg.EIP191) {
      const pk = jwk.d

      const jwt = await signJwt(payload, jwk, opts, buildSignerEip191(pk))

      return jwt
    }

    throw new Error('Unsupported algorithm')
  }
}
