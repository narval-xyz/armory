import { AxiosError } from 'axios'
import { extendTailwindMerge } from 'tailwind-merge'

export const classNames = (...classes: Array<string | undefined | null>) => {
  const twMerge = extendTailwindMerge({ prefix: 'nv-' })
  return twMerge(...classes)
}

export const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.toLowerCase().slice(1)

export const extractErrorMessage = (err: unknown) => {
  const error = err as AxiosError
  const data = error.response?.data as any
  return data?.message || error.message
}
