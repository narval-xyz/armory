import { AxiosError } from 'axios'
import { extendTailwindMerge } from 'tailwind-merge'

export const classNames = (...classes: Array<string | undefined | null>) => {
  const twMerge = extendTailwindMerge({ prefix: 'nv-' })
  return twMerge(...classes)
}

export const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.toLowerCase().slice(1)

export const getUrlProtocol = (url: string) => url.split(':')[0]

export const extractErrorMessage = (err: unknown): string => {
  const error = err as AxiosError
  const data = error.response?.data as any
  if (Array.isArray(data?.message)) {
    return data?.message.join(', ')
  }
  return data?.message || error.message
}
