import { LoggerService } from '@narval/nestjs-shared'
import { Alg, privateKeyToJwk } from '@narval/signature'
import { HttpService } from '@nestjs/axios'
import * as nobleEd25519 from '@noble/ed25519'
import { AxiosRequestConfig } from 'axios'
import { mock } from 'jest-mock-extended'
import { UrlParserException } from '../../../../core/exception/url-parser.exception'
import { AnchorageClient } from '../../anchorage.client'

describe(AnchorageClient.name, () => {
  let client: AnchorageClient

  const now = new Date(1234567890)
  const nowTimestamp = Math.floor(now.getTime() / 1000)

  beforeEach(() => {
    const httpServiceMock = mock<HttpService>()
    const loggerServiceMock = mock<LoggerService>()

    client = new AnchorageClient(httpServiceMock, loggerServiceMock)
  })

  describe('parseEndpoint', () => {
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

      for (const { input, expected } of testCases) {
        expect(client.parseEndpoint(input)).toBe(expected)
      }
    })

    it('throws UrlParserException for invalid URLs', () => {
      const invalidUrls = [
        'https://api.anchorage.com/accounts',
        'https://api.anchorage.com/invalidv1/',
        'not-even-an-url'
      ]

      for (const url of invalidUrls) {
        expect(() => client.parseEndpoint(url)).toThrow(UrlParserException)
      }
    })
  })

  describe('buildSignatureMessage', () => {
    it('builds GET requests without data', () => {
      const request: AxiosRequestConfig = {
        method: 'GET',
        url: '/v2/accounts'
      }

      expect(client.buildSignatureMessage(request, nowTimestamp)).toEqual(`${nowTimestamp}GET/v2/accounts`)
    })

    it('builds post requests with data', () => {
      const request: AxiosRequestConfig = {
        method: 'POST',
        url: '/v2/accounts',
        data: {
          foo: 'foo',
          bar: 'bar'
        }
      }

      expect(client.buildSignatureMessage(request, nowTimestamp)).toEqual(
        `${nowTimestamp}POST/v2/accounts${JSON.stringify(request.data)}`
      )
    })

    it('adds params as query string', () => {
      const request: AxiosRequestConfig = {
        method: 'POST',
        url: '/v2/accounts',
        data: undefined,
        params: { foo: 'bar' }
      }

      expect(client.buildSignatureMessage(request, nowTimestamp)).toEqual(`${nowTimestamp}POST/v2/accounts?foo=bar`)
    })

    it('adds params as query string even if the url already has query params', () => {
      const request: AxiosRequestConfig = {
        method: 'POST',
        url: '/v2/accounts?after=first',
        data: undefined,
        params: { foo: 'bar' }
      }

      expect(client.buildSignatureMessage(request, nowTimestamp)).toEqual(
        `${nowTimestamp}POST/v2/accounts?after=first&foo=bar`
      )
    })

    it('does not add ? to the url when params is defined with undefined items', () => {
      const request: AxiosRequestConfig = {
        method: 'POST',
        url: '/v2/accounts',
        data: undefined,
        params: {
          foo: undefined,
          bar: undefined
        }
      }

      expect(client.buildSignatureMessage(request, nowTimestamp)).toEqual(`${nowTimestamp}POST/v2/accounts`)
    })

    it('handles undefined data for non-get requests', () => {
      const request: AxiosRequestConfig = {
        method: 'POST',
        url: '/v2/accounts',
        data: undefined
      }

      expect(client.buildSignatureMessage(request, nowTimestamp)).toEqual(`${nowTimestamp}POST/v2/accounts`)
    })

    it('handles lower case http methods', () => {
      const methods = ['post', 'put', 'patch', 'delete']
      const request: AxiosRequestConfig = {
        url: '/v2/test',
        data: {
          foo: 'foo',
          bar: 'bar'
        }
      }

      for (const method of methods) {
        expect(client.buildSignatureMessage({ ...request, method }, nowTimestamp)).toEqual(
          `${nowTimestamp}${method.toUpperCase()}/v2/test${JSON.stringify(request.data)}`
        )
      }
    })

    it('builds request for all http methods', () => {
      const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
      const request: AxiosRequestConfig = {
        url: '/v2/test',
        data: {
          foo: 'foo',
          bar: 'bar'
        }
      }

      for (const method of methods) {
        expect(client.buildSignatureMessage({ ...request, method }, nowTimestamp)).toEqual(
          `${nowTimestamp}${method}/v2/test${method === 'GET' ? '' : JSON.stringify(request.data)}`
        )
      }
    })
  })

  describe('authorize', () => {
    const ed25519PrivateKeyHex = '0xe6ad32d225c16074bd4a3b62e28c99dd26136ef341e6368ca05227d1e13822d9'
    const signKey = privateKeyToJwk(ed25519PrivateKeyHex, Alg.EDDSA)

    const defaultRequest: AxiosRequestConfig = {
      url: 'https://api.anchorage.com/v2/accounts',
      method: 'GET',
      data: undefined
    }

    const apiKey = 'test-api-key'

    it('builds signed get request', async () => {
      jest.spyOn(nobleEd25519, 'sign')

      const signedRequest = await client.authorize({
        request: defaultRequest,
        signKey,
        apiKey,
        now
      })

      expect(signedRequest).toEqual({
        url: defaultRequest.url,
        method: defaultRequest.method,
        headers: {
          'Api-Access-Key': apiKey,
          'Api-Signature':
            '6b312c48285544422dc7f4bc44a8f094094453d74fb83f5419c99a2ce1ce79133034b561838b1312d257eb7af5ac8582bfdad319f602f3ff81c484c5a147c50e',
          'Api-Timestamp': nowTimestamp,
          'Content-Type': 'application/json'
        },
        data: undefined
      })

      expect(nobleEd25519.sign).toHaveBeenCalledWith(
        expect.any(String),
        // We need to slice the '0x' prefix from the hex key
        ed25519PrivateKeyHex.slice(2)
      )
    })

    it('builds signed post request with data', async () => {
      const request = {
        ...defaultRequest,
        method: 'POST',
        data: { test: 'data' }
      }

      const signedRequest = await client.authorize({
        request,
        signKey,
        apiKey,
        now
      })

      expect(signedRequest).toEqual({
        url: request.url,
        method: request.method,
        headers: {
          'Api-Access-Key': apiKey,
          'Api-Signature':
            '51f1feffab30a8e8bbad75cb85e99a945db0f71ca0e2dfc9b8f7be0f6ec65b9d5274d1e8eac283be9370a4c6d16bbab84049b58feadfcbcbc499bb816195420d',
          'Api-Timestamp': nowTimestamp,
          'Content-Type': 'application/json'
        },
        data: request.data
      })
    })

    it('supports all http methods with appropriate data handling', async () => {
      const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
      const data = { test: 'data' }

      for (const method of methods) {
        const config = await client.authorize({
          request: { ...defaultRequest, method, data },
          signKey,
          apiKey,
          now
        })

        expect(config.method).toBe(method)
        expect(config.data).toBe(method === 'GET' ? undefined : data)
      }
    })
  })
})
