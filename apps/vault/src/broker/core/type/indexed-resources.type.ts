import { z } from 'zod'
import { Connection } from './connection.type'
import { Provider } from './provider.type'

export const KnownDestination = z.object({
  knownDestinationId: z.string(),
  clientId: z.string(),
  connections: z.array(Connection),
  provider: z.nativeEnum(Provider),
  label: z.string().nullable().optional(),
  externalId: z.string(),
  externalClassification: z.string().nullable().optional(),
  address: z.string(),
  assetId: z.string().nullable().optional(),
  networkId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date()
})
export type KnownDestination = z.infer<typeof KnownDestination>

export const Address = z.object({
  accountId: z.string(),
  address: z.string(),
  addressId: z.string(),
  clientId: z.string(),
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
  createdAt: z.date(),
  externalId: z.string(),
  label: z.string().nullable().optional(),
  networkId: z.string(),
  provider: z.nativeEnum(Provider),
  updatedAt: z.date(),
  walletId: z.string()
})
export type Account = z.infer<typeof Account>

export const Wallet = z.object({
  accounts: z.array(Account).optional(),
  clientId: z.string(),
  connections: z.array(Connection),
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
  connections: true,
  updatedAt: true
})
export type UpdateWallet = z.infer<typeof UpdateWallet>
