import { z } from 'zod'
import { Provider } from './provider.type'

export const ExternalNetwork = z.object({
  externalId: z.string(),
  provider: z.nativeEnum(Provider)
})
export type ExternalNetwork = z.infer<typeof ExternalNetwork>

export const Network = z.object({
  networkId: z.string(),
  coinType: z.number().nullable(),
  name: z.string(),
  externalNetworks: z.array(ExternalNetwork).default([]),
  createdAt: z.date().optional()
})
export type Network = z.infer<typeof Network>
