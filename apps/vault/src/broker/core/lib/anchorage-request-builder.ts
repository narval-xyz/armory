import { Ed25519PrivateKey, privateKeyToHex } from '@narval/signature'
import { sign } from '@noble/ed25519'
import { AxiosRequestConfig } from 'axios'
import { z } from 'zod'
import { UrlParserException } from '../exception/url-parser.exception'

export const HttpMethod = z.union([
  z.literal('GET'),
  z.literal('POST'),
  z.literal('PATCH'),
  z.literal('PUT'),
  z.literal('DELETE')
])
export type HttpMethod = z.infer<typeof HttpMethod>

export type BuildAnchorageRequestParams = {
  url: string
  method: HttpMethod
  body?: unknown
  apiKey: string
  signKey: Ed25519PrivateKey
  now?: Date
}

export const parseUrl = (url: string): string => {
  const regex = /(\/v\d+(?:\/.*)?)$/
  const match = url.match(regex)

  if (!match) {
    throw new UrlParserException({
      message: 'No version pattern found in the URL',
      url
    })
  }

  return match[1]
}

export const serializePayload = (time: number, method: HttpMethod, endpoint: string, body: unknown): string => {
  return `${time}${method}${endpoint}${body && method !== 'GET' ? JSON.stringify(body) : ''}`
}

export const buildAnchorageSignedRequest = async ({
  url,
  method,
  body,
  apiKey,
  signKey,
  now
}: BuildAnchorageRequestParams): Promise<AxiosRequestConfig> => {
  const timestamp = now ? now.getTime() : new Date().getTime()
  const time = Math.floor(timestamp / 1000)

  const endpoint = parseUrl(url)
  const serializedPayload = serializePayload(time, method, endpoint, body)

  const signatureRequest = Buffer.from(serializedPayload, 'utf8').toString('hex')

  const signHexKey = await privateKeyToHex(signKey)
  const hexSignature = await sign(signatureRequest, signHexKey.slice(2))
  const signature = Buffer.from(hexSignature).toString('hex')

  const headers = {
    'Api-Access-Key': apiKey,
    'Api-Signature': signature,
    'Api-Timestamp': time,
    'Content-Type': 'application/json'
  }

  const data = body && method !== 'GET' ? body : undefined

  const config: AxiosRequestConfig = {
    url,
    method,
    headers,
    data
  }

  return config
}
