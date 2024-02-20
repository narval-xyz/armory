import { AssetType, Namespace, isAccountId, isAssetId } from '@narval/policy-engine-shared'
import { z } from 'zod'

const nonCollectableAssetIdSchema = z.custom<`${Namespace}:${number}/${AssetType}:${string}`>((value) => {
  const parse = z.string().safeParse(value)

  if (parse.success) {
    return isAssetId(parse.data)
  }

  return false
})

const collectableAssetIdSchema = z.custom<`${Namespace}:${number}/${AssetType}:${string}/${string}`>((value) => {
  const parse = z.string().safeParse(value)

  if (parse.success) {
    return isAssetId(parse.data)
  }

  return false
})

const coinAssetIdSchema = z.custom<`${Namespace}:${number}/${AssetType.SLIP44}:${number}`>((value) => {
  const parse = z.string().safeParse(value)

  if (parse.success) {
    return isAssetId(parse.data)
  }

  return false
})

export const accountIdSchema = z.custom<`${Namespace}:${number}/${string}`>((value) => {
  const parse = z.string().safeParse(value)

  if (parse.success) {
    return isAccountId(parse.data)
  }

  return false
})

export const assetIdSchema = z.union([nonCollectableAssetIdSchema, collectableAssetIdSchema, coinAssetIdSchema])
