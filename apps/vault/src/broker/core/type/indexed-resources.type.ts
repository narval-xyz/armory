import { z } from 'zod'
import { Provider } from './provider.type'

export const Address = z.object({
  accountId: z.string(),
  address: z.string(),
  addressId: z.string(),
  clientId: z.string(),
  connectionId: z.string(),
  createdAt: z.date(),
  externalId: z.string(),
  provider: z.nativeEnum(Provider),
  updatedAt: z.date()
})
export type Address = z.infer<typeof Address>

export const Account = z.object({
  accountId: z.string(),
  addresses: z.array(Address).optional(),
  clientId: z.string(),
  connectionId: z.string(),
  createdAt: z.date(),
  externalId: z.string(),
  label: z.string().nullable().optional(),
  networkId: z.string(),
  provider: z.nativeEnum(Provider),
  updatedAt: z.date(),
  walletId: z.string().nullable()
})
export type Account = z.infer<typeof Account>

export const Wallet = z.object({
  accounts: z.array(Account).optional(),
  clientId: z.string(),
  connectionId: z.string(),
  createdAt: z.date(),
  externalId: z.string(),
  label: z.string().nullable().optional(),
  provider: z.nativeEnum(Provider),
  updatedAt: z.date(),
  walletId: z.string()
})
export type Wallet = z.infer<typeof Wallet>

export const UpdateWallet = Wallet.pick({
  walletId: true,
  clientId: true,
  label: true,
  updatedAt: true
})
export type UpdateWallet = z.infer<typeof UpdateWallet>
