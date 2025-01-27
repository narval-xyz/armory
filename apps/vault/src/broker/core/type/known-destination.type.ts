import { z } from 'zod'
import { Provider } from './provider.type'

export const KnownDestination = z.object({
  clientId: z.string(),
  connectionId: z.string(),
  provider: z.nativeEnum(Provider),
  label: z.string().nullable().optional(),
  externalId: z.string(),
  externalClassification: z.string().nullable().optional(),
  address: z.string().toLowerCase(),
  assetId: z.string().nullable().optional(),
  networkId: z.string()
})
export type KnownDestination = z.infer<typeof KnownDestination>
