import { createConfig, http } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { z } from 'zod'

export const config = createConfig({
  chains: [mainnet, sepolia],
  ssr: true,
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http()
  }
})

export const env = z
  .object({
    profile: z.enum(['devtool', 'manager']).default('devtool')
  })
  .parse({
    profile: process.env.NEXT_PUBLIC_APP_PROFILE
  })
