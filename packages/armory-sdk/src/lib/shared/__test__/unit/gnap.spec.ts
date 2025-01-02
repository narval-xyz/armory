import {
  SigningAlg,
  buildSignerForAlg,
  hash,
  hexToBase64Url,
  privateKeyToHex,
  privateKeyToJwk,
  secp256k1PrivateKeyToPublicJwk,
  verifyJwsd
} from '@narval/signature'
import { AxiosHeaders, InternalAxiosRequestConfig } from 'axios'
import { generatePrivateKey } from 'viem/accounts'
import { REQUEST_HEADER_DETACHED_JWS, interceptRequestAddDetachedJwsHeader, parseToken } from '../../gnap'
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

  it(`adds ${REQUEST_HEADER_DETACHED_JWS} header with jws, bound to Authorization header token`, async () => {
    expect.assertions(2)
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

    const verified = await verifyJwsd(
      signature as string,
      secp256k1PrivateKeyToPublicJwk(await privateKeyToHex(signer.jwk)),
      {
        uri: 'http://localhost:3011/accounts/import',
        htm: 'POST',
        maxTokenAge: 60,
        requestBody: data
      }
    )

    expect(signature).toEqual(expect.any(String))
    expect(verified.header.ath).toEqual(
      hexToBase64Url(
        hash(
          'eyJhbGciOiJFSVAxOTEiLCJraWQiOiIweDAwNjgxM2ZlNDIwODRhZDUyM2M1ZmJjODY5NTlmNjYxNWY4MjA3NGQ3YTE5YjFiMGNiZTIyYmNkY2I2ODI3ZTUiLCJ0eXAiOiJKV1QifQ.eyJhY2Nlc3MiOlt7InBlcm1pc3Npb25zIjpbIndhbGxldDppbXBvcnQiLCJ3YWxsZXQ6Y3JlYXRlIiwid2FsbGV0OnJlYWQiXSwicmVzb3VyY2UiOiJ2YXVsdCJ9XSwiY25mIjp7ImFsZyI6IkVTMjU2SyIsImNydiI6InNlY3AyNTZrMSIsImtpZCI6IjB4YTc2MzQzMTAyYzMwMjM5MTIxYmIxZDUyOWY3ODg3OTI1Y2ZhYTlmMTY4NGIxOWE0NjlmOGQ3YzU1MzgwNThiZiIsImt0eSI6IkVDIiwieCI6Ik11N2kxYTdrSE1ZS3lERzB3NTBsN19HU0pKTjhiSERhWGswQzMxVmItUVkiLCJ5IjoiclhBZVN6RDUteGhZSEY4TFlDX3lkaW5pWEhTbVdnWldFUnU3UlFVUFhtayJ9LCJleHAiOjE3MTkyMTk1ODUsImlhdCI6MTcxOTIxODk4NSwiaXNzIjoiNzI4NmM4MjEtMzg5NC00MDhiLWJmOGEtMzk3N2M5ZDU0MzRkLmFybW9yeS5uYXJ2YWwueHl6Iiwic3ViIjoiZDMzYmRjMDYtODk2My00M2ExLTkyYWQtOTcwZTUyZjRjZTE0In0.xZkmWN3zjbNrZqulkfHz01wFeIGNwGFDvr528s4EnHQ2qStIwBXNeimmtlJRoGQzlPrlrWCCmpS_3PW7VJ1tbBs'
        )
      )
    )
  })

  it(`adds ${REQUEST_HEADER_DETACHED_JWS} header even without Authorization header`, async () => {
    // expect.assertions(2)
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
        'x-client-id': '7286c821-3894-408b-bf8a-3977c9d5434d'
      }),
      method: 'post',
      data: JSON.stringify(data),
      url: 'http://localhost:3011/accounts/import'
    }

    const actualConfig = await interceptor(config)

    const signature = actualConfig.headers.get(REQUEST_HEADER_DETACHED_JWS)

    const verified = await verifyJwsd(
      signature as string,
      secp256k1PrivateKeyToPublicJwk(await privateKeyToHex(signer.jwk)),
      {
        uri: 'http://localhost:3011/accounts/import',
        htm: 'POST',
        maxTokenAge: 60,
        requestBody: data
      }
    )

    expect(signature).toEqual(expect.any(String))
    expect(verified.header.ath).toBeUndefined()
  })
})

describe('parseToken', () => {
  it('removes GNAP prefix', () => {
    expect(parseToken('GNAP 123AAa4567890')).toEqual('123AAa4567890')
  })

  it('removes bearer prefix', () => {
    expect(parseToken('bearer 1234567890')).toEqual('1234567890')
  })

  it('trims whitespace', () => {
    expect(parseToken(' GNAP 1234567890 ')).toEqual('1234567890')
  })

  it('handles mixed case', () => {
    expect(parseToken('Bearer 1234567890')).toEqual('1234567890')
    expect(parseToken('gnap 1234567890')).toEqual('1234567890')
  })
})
