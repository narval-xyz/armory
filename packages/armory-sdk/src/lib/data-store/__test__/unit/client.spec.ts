import { AxiosHeaders, InternalAxiosRequestConfig } from 'axios'
import { promisify } from 'util'
import * as zlib from 'zlib'
import { compressRequestInterceptor } from '../../client'

const gunzip = promisify(zlib.gunzip)

describe('SDK Compression Interceptors', () => {
  describe('Request Interceptor', () => {
    it('compresses POST request data', async () => {
      const config: InternalAxiosRequestConfig = {
        method: 'post',
        data: JSON.stringify({ test: 'data' }),
        headers: {} as unknown as AxiosHeaders,
        url: '/test'
      }

      const result = await compressRequestInterceptor(config)

      expect(result.headers['Content-Encoding']).toBe('gzip')

      const decompressed = await gunzip(result.data)
      expect(JSON.parse(decompressed.toString())).toEqual({ test: 'data' })
    })

    it('handles empty request body', async () => {
      const config = {
        method: 'post',
        headers: {} as unknown as AxiosHeaders,
        url: '/test'
      }

      const result = await compressRequestInterceptor(config)
      expect(result.data).toBeUndefined()
    })
  })
})
