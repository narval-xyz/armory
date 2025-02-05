/* eslint-disable @typescript-eslint/no-explicit-any */

import { JwsdHeader, PrivateKey, buildSignerForAlg, hash, hexToBase64Url, signJwsd } from '@narval/signature'
import { INestApplication } from '@nestjs/common'
import { isUndefined, omitBy } from 'lodash'
import request from 'supertest'

export const getJwsd = async ({
  userPrivateJwk,
  baseUrl,
  requestUrl,
  accessToken,
  payload,
  htm
}: {
  userPrivateJwk: PrivateKey
  baseUrl?: string
  requestUrl: string
  accessToken?: string
  payload: object | string
  htm?: string
}) => {
  const now = Math.floor(Date.now() / 1000)

  const jwsdSigner = await buildSignerForAlg(userPrivateJwk)
  const jwsdHeader: JwsdHeader = {
    alg: userPrivateJwk.alg,
    kid: userPrivateJwk.kid,
    typ: 'gnap-binding-jwsd',
    htm: htm || 'POST',
    uri: `${baseUrl || 'https://vault-test.narval.xyz'}${requestUrl}`, // matches the client baseUrl + request url
    created: now,
    ath: accessToken ? hexToBase64Url(hash(accessToken)) : undefined
  }

  const jwsd = await signJwsd(payload, jwsdHeader, jwsdSigner).then((jws) => {
    // Strip out the middle part for size
    const parts = jws.split('.')
    parts[1] = ''
    return parts.join('.')
  })

  return jwsd
}

/**
 * Creates a wrapper around supertest that automatically handles detached JWS
 * signatures for API requests in tests.
 *
 * This helper ensures that all requests are properly signed with a detached
 * JWS signature using the provided private key. It maintains the familiar
 * supertest chainable API while handling the complexity of JWS signatures.
 *
 * @param app - The NestJS application instance to make requests against
 * @param privateKey - The private key used to sign the requests
 *
 * @returns An object with HTTP method functions (get, post, put, delete,
 * patch) that return chainable request objects
 *
 * @example
 * const response = await signedRequest(app, userPrivateKey)
 *   .get('/api/resource')
 *   .set('header-name', 'value')
 *   .send()
 */
export const signedRequest = (app: INestApplication, privateKey: PrivateKey) => {
  const wrapper = (method: 'get' | 'post' | 'put' | 'delete' | 'patch', url: string) => {
    const req = request(app.getHttpServer())[method](url)

    let query: string | null = null

    return {
      ...req,
      set: function (key: string, value: string) {
        if (key === 'detached-jws') {
          throw new Error('You cannot override detached-jws with signedRequest')
        }

        req.set(key, value)

        return this
      },
      query: function (params: Record<string, any>) {
        if (url.includes('?')) {
          throw new Error(
            'It seems the given URL already has a query string. Pass query params either in the URL or with the query method'
          )
        }

        // Strip out undefined values but not null ones.
        const parse = omitBy(params, isUndefined)

        req.query(parse)
        query = new URLSearchParams(parse).toString()

        return this
      },
      send: async function (body?: any) {
        const jws = await getJwsd({
          userPrivateJwk: privateKey,
          requestUrl: query ? `${url}?${query}` : url,
          payload: body || {},
          htm: method.toUpperCase()
        })

        return req.set('detached-jws', jws).send(body)
      }
    }
  }

  return {
    get: (url: string) => wrapper('get', url),
    post: (url: string) => wrapper('post', url),
    put: (url: string) => wrapper('put', url),
    delete: (url: string) => wrapper('delete', url),
    patch: (url: string) => wrapper('patch', url)
  }
}
