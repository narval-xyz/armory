import { sign } from '@noble/ed25519'
import { AxiosRequestConfig } from 'axios'

type HttpMethod = 'GET' | 'POST'

export type BuildAnchorageRequestParams = {
  url: string
  method: HttpMethod
  body?: Record<string, unknown>
  endpoint: string
  apiKey: string
  signKey: string
}

export const extractVersion = (url: string): string => '/v2'
export const buildAnchorageSignedRequest = async ({
  url,
  method,
  endpoint,
  body,
  apiKey,
  signKey
}: BuildAnchorageRequestParams): Promise<AxiosRequestConfig> => {
  const time = Math.floor(new Date().getTime() / 1000)
  const version = extractVersion(url)
  const serializedPayload = body
    ? `${time}${method}${version}${endpoint}${JSON.stringify(body)}`
    : `${time}${method}${version}${endpoint}`

  const signatureRequest = Buffer.from(serializedPayload, 'utf8').toString('hex')
  const hexSignature = await sign(signatureRequest, signKey.slice(2))

  const signature = Buffer.from(hexSignature).toString('hex')

  const finalUrl = `${url}/v2${endpoint}`
  const headers = {
    'Api-Access-Key': apiKey,
    'Api-Signature': signature,
    'Api-Timestamp': time,
    'Content-Type': 'application/json'
  }

  const config: AxiosRequestConfig = {
    url: finalUrl,
    method,
    headers,
    data: body
  }

  return config
}
