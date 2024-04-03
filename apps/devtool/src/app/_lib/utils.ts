import { extendTailwindMerge } from 'tailwind-merge'

export const classNames = (...classes: Array<string | undefined | null>) => {
  const twMerge = extendTailwindMerge({ prefix: 'nv-' })
  return twMerge(...classes)
}
