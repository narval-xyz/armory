import { SigningAlg, buildSignerForAlg, privateKeyToJwk } from '@narval/signature'
import { AxiosHeaders, InternalAxiosRequestConfig } from 'axios'
import { generatePrivateKey } from 'viem/accounts'
import { REQUEST_HEADER_DETACHED_JWS, interceptRequestAddDetachedJwsHeader } from '../../gnap'
import { Signer } from '../../type'

describe('interceptRequestAddDetachedJwsHeader', () => {
  let interceptor: (config: InternalAxiosRequestConfig) => Promise<InternalAxiosRequestConfig>
  let signer: Signer

  beforeEach(async () => {
    const privateKey = privateKeyToJwk(generatePrivateKey())

    signer = {
      jwk: privateKey,
      alg: SigningAlg.ES256K,
      sign: await buildSignerForAlg(privateKey)
    }

    interceptor = interceptRequestAddDetachedJwsHeader(signer)
  })

  it(`adds ${REQUEST_HEADER_DETACHED_JWS} header with jws`, async () => {
    const data = { foo: 'bar' }
    const config = {
      transitional: {
        silentJSONParsing: true,
        forcedJSONParsing: true,
        clarifyTimeoutError: false
      },
      adapter: ['xhr', 'http', 'fetch'],
      timeout: 0,
      xsrfCookieName: 'XSRF-TOKEN',
      xsrfHeaderName: 'X-XSRF-TOKEN',
      maxContentLength: -1,
      maxBodyLength: -1,
      headers: new AxiosHeaders({
        Accept: 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
        'x-client-id': '7286c821-3894-408b-bf8a-3977c9d5434d',
        Authorization:
          'GNAP eyJhbGciOiJFSVAxOTEiLCJraWQiOiIweDAwNjgxM2ZlNDIwODRhZDUyM2M1ZmJjODY5NTlmNjYxNWY4MjA3NGQ3YTE5YjFiMGNiZTIyYmNkY2I2ODI3ZTUiLCJ0eXAiOiJKV1QifQ.eyJhY2Nlc3MiOlt7InBlcm1pc3Npb25zIjpbIndhbGxldDppbXBvcnQiLCJ3YWxsZXQ6Y3JlYXRlIiwid2FsbGV0OnJlYWQiXSwicmVzb3VyY2UiOiJ2YXVsdCJ9XSwiY25mIjp7ImFsZyI6IkVTMjU2SyIsImNydiI6InNlY3AyNTZrMSIsImtpZCI6IjB4YTc2MzQzMTAyYzMwMjM5MTIxYmIxZDUyOWY3ODg3OTI1Y2ZhYTlmMTY4NGIxOWE0NjlmOGQ3YzU1MzgwNThiZiIsImt0eSI6IkVDIiwieCI6Ik11N2kxYTdrSE1ZS3lERzB3NTBsN19HU0pKTjhiSERhWGswQzMxVmItUVkiLCJ5IjoiclhBZVN6RDUteGhZSEY4TFlDX3lkaW5pWEhTbVdnWldFUnU3UlFVUFhtayJ9LCJleHAiOjE3MTkyMTk1ODUsImlhdCI6MTcxOTIxODk4NSwiaXNzIjoiNzI4NmM4MjEtMzg5NC00MDhiLWJmOGEtMzk3N2M5ZDU0MzRkLmFybW9yeS5uYXJ2YWwueHl6Iiwic3ViIjoiZDMzYmRjMDYtODk2My00M2ExLTkyYWQtOTcwZTUyZjRjZTE0In0.xZkmWN3zjbNrZqulkfHz01wFeIGNwGFDvr528s4EnHQ2qStIwBXNeimmtlJRoGQzlPrlrWCCmpS_3PW7VJ1tbBs'
      }),
      method: 'post',
      data: JSON.stringify(data),
      url: 'http://localhost:3011/accounts/import'
    }

    const actualConfig = await interceptor(config)

    const signature = actualConfig.headers.get(REQUEST_HEADER_DETACHED_JWS)

    expect(signature).toEqual(expect.any(String))
  })
})
