import { SourceType } from '@narval/policy-engine-shared'
import { extendTailwindMerge } from 'tailwind-merge'

export const classNames = (...classes: Array<string | undefined | null>) => {
  const twMerge = extendTailwindMerge({ prefix: 'nv-' })
  return twMerge(...classes)
}

export const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.toLowerCase().slice(1)

export const formatAddress = (address?: string, splitLength = 5): string =>
  address ? `${address.substring(0, splitLength)}...${address.substring(address.length - splitLength)}` : ''

export const getUrlProtocol = (url: string) => url.split(':')[0].toUpperCase() as SourceType

export const extractErrorMessage = (error: any): string => {
  const data = error?.response?.data

  if (Array.isArray(data?.message)) {
    return data?.message.join(', ')
  }

  return data?.message || error.message
}

export const getHost = (url: string): string => new URL(url).origin

export const isValidUrl = (url: string | undefined) => {
  if (!url) return false

  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function ensurePrefix<T = string>(str = '', prefix = '0x'): T {
  return (str.startsWith(prefix) ? str : prefix + str) as T
}

type BackoffOptions = {
  maxRetries?: number
  delay?: number
  exponential?: boolean
}

export const backOff = async <T>(request: () => Promise<T>, options: BackoffOptions): Promise<T> => {
  let retries = 0

  let { delay = 1000 } = options
  const { maxRetries = 3, exponential = false } = options

  while (retries < maxRetries) {
    try {
      return await request()
    } catch (error) {
      retries++
      await new Promise((resolve) => setTimeout(resolve, delay))
      if (exponential) {
        delay *= 2
      }
    }
  }

  const res = await request()
  return res
}
