import { RsaPrivateKey } from '@narval/signature'
import axios from 'axios'
import { mockReset } from 'jest-mock-extended'
import { BrokerException } from '../../../../core/exception/broker.exception'
import { UrlParserException } from '../../../../core/exception/url-parser.exception'
import { FireblocksClient } from '../../fireblocks.client'

jest.mock('axios')

describe(FireblocksClient.name, () => {
  let client: FireblocksClient
  const mockedAxios = axios as jest.MockedFunction<typeof axios>

  const mockSignKey: RsaPrivateKey = {
    kty: 'RSA',
    alg: 'RS256',
    kid: '0x52920ad0d19d7779106bd9d9d600d26c4b976cdb3cbc49decb7fdc29db00b8e9',
    n: 'xNdTjWL9hGa4bz4tLKbmFZ4yjQsQzW35-CMS0kno3403jEqg5y2Cs6sLVyPBX4N2hdK5ERPytpf1PrThHqB-eEO6LtEWpENBgFuNIf8DRHrv0tne7dLNxf7sx1aocGRrkgIk4Ws6Is4Ot3whm3-WihmDGnHoogE-EPwVkkSc2FYPXYlNq4htCZXC8_MUI3LuXry2Gn4tna5HsYSehYhfKDD-nfSajeWxdNUv_3wOeSCr9ICm9Udlo7hpIUHQgnX3Nz6kvfGYuweLGoj_ot-oEUCIdlbQqmrfStAclugbM5NI6tY__6wD0z_4ZBjToupXCBlXbYsde6_ZG9xPmYSykw',
    e: 'AQAB',
    d: 'QU4rIzpXX8jwob-gHzNUHJH6tX6ZWX6GM0P3p5rrztc8Oag8z9XyigdSYNu0-SpVdTqfOcJDgT7TF7XNBms66k2WBJhMCb1iiuJU5ZWEkQC0dmDgLEkHCgx0pAHlKjy2z580ezEm_YsdqNRfFgbze-fQ7kIiazU8UUhBI-DtpHv7baBgsfqEfQ5nCTiURUPmmpiIU74-ZIJWZjBXTOoJNH0EIsJK9IpZzxpeC9mTMTsWTcHKiR3acze1qf-9I97v461TTZ8e33N6YINyr9I4HZuvxlCJdV_lOM3fLvYM9gPvgkPozhVWL3VKR6xa9JpGGHrCRgH92INuviBB_SmF8Q',
    p: '9BNku_-t4Df9Dg7M2yjiNgZgcTNKrDnNqexliIUAt67q0tGmSBubjxeI5unDJZ_giXWUR3q-02v7HT5GYx-ZVgKk2lWnbrrm_F7UZW-ueHzeVvQcjDXTk0z8taXzrDJgnIwZIaZ2XSG3P-VPOrXCaMba8GzSq38Gpzi4g3lTO9s',
    q: 'znUtwrqdnVew14_aFjNTRgzOQNN8JhkjzJy3aTSLBScK5NbiuUUZBWs5dQ7Nv7aAoDss1-o9XVQZ1DVV-o9UufJtyrPNcvTnC0cWRrtJrSN5YiuUbECU3Uj3OvGxnhx9tsmhDHnMTo50ObPYUbHcIkNaXkf2FVgL84y1JRWdPak',
    dp: 'UNDrFeS-6fMf8zurURXkcQcDf_f_za8GDjGcHOwNJMTiNBP-_vlFNMgSKINWfmrFqj4obtKRxOeIKlKoc8HOv8_4TeL2oY95VC8CHOQx3Otbo2cI3NQlziw7sNnWKTo1CyDIYYAAyS2Uw69l4Ia2bIMLk3g0-VwCE_SQA9h0Wuk',
    dq: 'VBe6ieSFKn97UnIPfJdvRcsVf6YknUgEIuV6d2mlbnXWpBs6wgf5BxIDl0BuYbYuchVoUJHiaM9Grf8DhEk5U3wBaF0QQ9CpAxjzY-AJRHJ8kJX7oJQ1jmSX_vRPSn2EXx2FcZVyuFSh1pcAd1YgufwBJQHepBb21z7q0a4aG_E',
    qi: 'KhZpFs6xfyRIjbJV8Q9gWxqF37ONayIzBpgio5mdAQlZ-FUmaWZ2_2VWP2xvsP48BmwFXydHqewHBqGnZYCQ1ZHXJgD_-KKEejoqS5AJN1pdI0ZKjs7UCfZ4RJ4DH5p0_35gpuKRzzdvcIhl1CjIC5W8o7nhwmLBJ_QAo9e4t9U'
  }

  beforeEach(() => {
    client = new FireblocksClient()
    mockReset(mockedAxios)
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

  describe('validateRequest', () => {
    it('throws BrokerException when URL is missing', async () => {
      const request: any = { method: 'GET' }

      await expect(
        client.authorize({
          request,
          apiKey: 'test-api-key',
          signKey: mockSignKey
        })
      ).rejects.toThrow(BrokerException)
    })

    it('throws BrokerException when method is missing', async () => {
      const request: any = { url: 'https://api.fireblocks.com/v1/test' }

      await expect(
        client.authorize({
          request,
          apiKey: 'test-api-key',
          signKey: mockSignKey
        })
      ).rejects.toThrow(BrokerException)
    })
  })

  describe('authorize', () => {
    const mockDate = new Date('2024-01-01T00:00:00Z')

    it('creates valid authorization headers for GET request', async () => {
      const request = {
        url: 'https://api.fireblocks.com/v1/test',
        method: 'GET'
      }

      const result = await client.authorize({
        request,
        apiKey: 'test-api-key',
        signKey: mockSignKey,
        now: mockDate
      })

      // Check header structure
      expect(result.headers).toHaveProperty('X-API-Key', 'test-api-key')
      expect(result.headers).toHaveProperty('Authorization')

      // Verify the Bearer token format
      const authHeader = result.headers?.Authorization
      expect(authHeader).toMatch(/^Bearer [A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.[A-Za-z0-9-_.+/=]+$/)
    })

    it('creates valid authorization headers for POST request with data', async () => {
      const requestData = { test: 'data' }
      const request = {
        url: 'https://api.fireblocks.com/v1/test',
        method: 'POST',
        data: requestData
      }

      const result = await client.authorize({
        request,
        apiKey: 'test-api-key',
        signKey: mockSignKey,
        now: mockDate
      })

      // Verify the basic structure stays the same for POST
      expect(result.headers).toHaveProperty('X-API-Key', 'test-api-key')
      expect(result.headers?.Authorization).toMatch(/^Bearer [A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.[A-Za-z0-9-_.+/=]+$/)

      // Verify the data is properly set in the request
      expect(result.data).toEqual(requestData)
    })
  })

  describe('forward', () => {
    it('forwards authorized request to Fireblocks API', async () => {
      const mockResponse = { data: 'test-response', status: 200 }
      mockedAxios.mockResolvedValue(mockResponse)

      const result = await client.forward({
        url: 'https://api.fireblocks.com/v1/test',
        method: 'GET',
        apiKey: 'test-api-key',
        signKey: mockSignKey,
        nonce: 'test-nonce'
      })

      expect(result).toBe(mockResponse)
      expect(mockedAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'https://api.fireblocks.com/v1/test',
          method: 'GET',
          responseType: 'stream',
          validateStatus: null
        })
      )
    })

    it('forwards POST request with data', async () => {
      const mockResponse = { data: 'test-response', status: 200 }
      mockedAxios.mockResolvedValue(mockResponse)

      const requestData = { test: 'data' }

      await client.forward({
        url: 'https://api.fireblocks.com/v1/test',
        method: 'POST',
        data: requestData,
        apiKey: 'test-api-key',
        signKey: mockSignKey,
        nonce: 'test-nonce'
      })

      expect(mockedAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          data: requestData,
          method: 'POST'
        })
      )
    })
  })
})
