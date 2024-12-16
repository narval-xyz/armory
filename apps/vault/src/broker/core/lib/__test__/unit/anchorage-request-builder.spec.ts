import { Alg, privateKeyToJwk } from '@narval/signature'
import * as nobleEd25519 from '@noble/ed25519'
import { UrlParserException } from '../../../exception/url-parser.exception'
import { HttpMethod, buildAnchorageSignedRequest, parseUrl, serializePayload } from '../../anchorage-request-builder'

const ED25519_PRIVATE_KEY = '0xe6ad32d225c16074bd4a3b62e28c99dd26136ef341e6368ca05227d1e13822d9'

describe('Anchorage Request Builder', () => {
  const mockTime = new Date(1234567890)

  const privateKey = privateKeyToJwk(ED25519_PRIVATE_KEY, Alg.EDDSA)

  describe('parseUrl', () => {
    it('extracts version path from valid URLs', () => {
      const testCases = [
        {
          input: 'https://api.anchorage.com/v2/accounts',
          expected: '/v2/accounts'
        },
        {
          input: 'https://api.anchorage.com/v1/trading/quotes',
          expected: '/v1/trading/quotes'
        },
        {
          input: 'https://api.anchorage.com/v3/something/nested/path',
          expected: '/v3/something/nested/path'
        },
        {
          input: 'https://api.anchorage.com/v4/something/nested/path?query=param&another=param&yetAnother=param',
          expected: '/v4/something/nested/path?query=param&another=param&yetAnother=param'
        }
      ]
      testCases.forEach(({ input, expected }) => {
        expect(parseUrl(input)).toBe(expected)
      })
    })

    it('throws UrlParserException for invalid URLs', () => {
      const invalidUrls = [
        'https://api.anchorage.com/accounts',
        'https://api.anchorage.com/invalidv1/',
        'not-even-a-url'
      ]

      invalidUrls.forEach((url) => expect(() => parseUrl(url)).toThrow(UrlParserException))
    })
  })

  describe('serializePayload', () => {
    it('serializes GET requests without body', () => {
      const result = serializePayload(mockTime.getTime(), 'GET', '/v2/accounts', { some: 'data' })
      expect(result).toBe(`${mockTime.getTime()}GET/v2/accounts`)
    })

    it('serializes POST requests with body', () => {
      const body = { some: 'data' }
      const result = serializePayload(mockTime.getTime(), 'POST', '/v2/accounts', body)
      expect(result).toBe(`${mockTime.getTime()}POST/v2/accounts${JSON.stringify(body)}`)
    })

    it('handles undefined body for non-GET requests', () => {
      const result = serializePayload(mockTime.getTime(), 'POST', '/v2/accounts', undefined)
      expect(result).toBe(`${mockTime.getTime()}POST/v2/accounts`)
    })

    it('formats payloads for all HTTP methods', () => {
      const methods: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
      const body = { test: 'data' }

      methods.forEach((method) => {
        const result = serializePayload(mockTime.getTime(), method, '/v2/test', body)
        const expected = `${mockTime.getTime()}${method}/v2/test${method === 'GET' ? '' : JSON.stringify(body)}`
        expect(result).toBe(expected)
      })
    })
  })

  describe('buildAnchorageSignedRequest', () => {
    const defaultParams = {
      url: 'https://api.anchorage.com/v2/accounts',
      method: 'GET' as const,
      apiKey: 'test-api-key',
      signKey: privateKey,
      body: undefined,
      now: mockTime
    }

    it('builds GET request config', async () => {
      jest.spyOn(nobleEd25519, 'sign')

      const config = await buildAnchorageSignedRequest(defaultParams)

      expect(config).toEqual({
        url: defaultParams.url,
        method: defaultParams.method,
        headers: {
          'Api-Access-Key': defaultParams.apiKey,
          'Api-Signature':
            '6b312c48285544422dc7f4bc44a8f094094453d74fb83f5419c99a2ce1ce79133034b561838b1312d257eb7af5ac8582bfdad319f602f3ff81c484c5a147c50e',
          'Api-Timestamp': Math.floor(mockTime.getTime() / 1000),
          'Content-Type': 'application/json'
        },
        data: undefined
      })

      expect(nobleEd25519.sign).toHaveBeenCalledWith(
        expect.any(String),
        // We need to slice the '0x' prefix from the hex key
        ED25519_PRIVATE_KEY.slice(2)
      )
    })

    it('builds POST request config with body', async () => {
      const params = {
        ...defaultParams,
        method: 'POST' as HttpMethod,
        body: { test: 'data' }
      }

      const config = await buildAnchorageSignedRequest(params)

      expect(config).toEqual({
        url: params.url,
        method: params.method,
        headers: {
          'Api-Access-Key': params.apiKey,
          'Api-Signature':
            '51f1feffab30a8e8bbad75cb85e99a945db0f71ca0e2dfc9b8f7be0f6ec65b9d5274d1e8eac283be9370a4c6d16bbab84049b58feadfcbcbc499bb816195420d',
          'Api-Timestamp': Math.floor(mockTime.getTime() / 1000),
          'Content-Type': 'application/json'
        },
        data: params.body
      })
    })

    it('supports all HTTP methods with appropriate body handling', async () => {
      const methods: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
      const body = { test: 'data' }

      for (const method of methods) {
        const params = { ...defaultParams, method, body }
        const config = await buildAnchorageSignedRequest(params)

        expect(config.method).toBe(method)
        expect(config.data).toBe(method === 'GET' ? undefined : body)
      }
    })
  })
})
