import { z } from 'zod'
import { BaseConnection, Provider, PublicConnection } from './connection.type'

export const KnownDestination = z.object({
  knownDestinationId: z.string(),
  clientId: z.string(),
  connections: z.array(BaseConnection),
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
  addressId: z.string(),
  clientId: z.string(),
  provider: z.nativeEnum(Provider),
  externalId: z.string(),
  accountId: z.string(),
  address: z.string(),
  createdAt: z.date(),
  updatedAt: z.date()
})
export type Address = z.infer<typeof Address>

export const Account = z.object({
  accountId: z.string(),
  label: z.string().nullable().optional(),
  addresses: z.array(Address).optional(),
  clientId: z.string(),
  provider: z.nativeEnum(Provider),
  externalId: z.string(),
  walletId: z.string(),
  networkId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date()
})
export type Account = z.infer<typeof Account>

export const Wallet = z.object({
  walletId: z.string(),
  accounts: z.array(Account).optional(),
  connections: z.array(BaseConnection),
  label: z.string().nullable().optional(),
  clientId: z.string(),
  provider: z.nativeEnum(Provider),
  externalId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date()
})
export type Wallet = z.infer<typeof Wallet>

export const PublicWallet = Wallet.extend({
  connections: z.array(PublicConnection)
})
export type PublicWallet = z.infer<typeof PublicWallet>
