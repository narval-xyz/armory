import { z } from 'zod'
import { Provider } from './provider.type'

export const NetworkFeeAttribution = {
  ON_TOP: 'on_top',
  DEDUCT: 'deduct'
} as const
export type NetworkFeeAttribution = (typeof NetworkFeeAttribution)[keyof typeof NetworkFeeAttribution]

export const TransferPartyType = {
  WALLET: 'wallet',
  ACCOUNT: 'account',
  ADDRESS: 'address'
} as const
export type TransferPartyType = (typeof TransferPartyType)[keyof typeof TransferPartyType]

export const TransferParty = z.object({
  id: z.string(),
  type: z.nativeEnum(TransferPartyType)
})
export type TransferParty = z.infer<typeof TransferParty>

export const Source = TransferParty
export type Source = z.infer<typeof Source>

export const AddressDestination = z.object({
  address: z.string()
})
export type AddressDestination = z.infer<typeof AddressDestination>

export const Destination = z.union([TransferParty, AddressDestination])
export type Destination = z.infer<typeof Destination>

export const SendTransfer = z.object({
  source: Source,
  destination: Destination,
  amount: z.string(),
  assetId: z.string(),
  // This is optional on the base transfer and always default on the
  // provider-specific transfer service.
  networkFeeAttribution: z.nativeEnum(NetworkFeeAttribution).optional(),
  customerRefId: z.string().optional(),
  idempotenceId: z.string().optional(),
  memo: z.string().optional(),
  provider: z.nativeEnum(Provider).optional(),
  // Requires `provider` to be set.
  providerSpecific: z.unknown().optional()
})
export type SendTransfer = z.infer<typeof SendTransfer>

export const Fee = z.object({
  type: z.string(),
  attribution: z.string(),
  amount: z.string(),
  assetId: z.string()
})
export type Fee = z.infer<typeof Fee>

export const TransferStatus = {
  PROCESSING: 'processing',
  SUCCESS: 'success',
  FAILED: 'failed'
} as const
export type TransferStatus = (typeof TransferStatus)[keyof typeof TransferStatus]

export const InternalTransfer = z.object({
  assetId: z.string(),
  clientId: z.string(),
  createdAt: z.date(),
  customerRefId: z.string().nullable(),
  destination: Destination,
  externalId: z.string(),
  grossAmount: z.string(),
  idempotenceId: z.string().nullable(),
  memo: z.string().nullable(),
  networkFeeAttribution: z.nativeEnum(NetworkFeeAttribution),
  provider: z.nativeEnum(Provider),
  providerSpecific: z.unknown().nullable(),
  source: Source,
  // The status is optional for an internal transfer because we query the
  // provider to get the most recent status on reads.
  //
  // If we stored it, it would complicate our system by trying to keep
  // distributed systems state in sync – an indexing problem. The Vault **is
  // not an indexing solution**.
  //
  // NOTE: The status is not persisted in the database.
  status: z.nativeEnum(TransferStatus).default(TransferStatus.PROCESSING).optional(),
  transferId: z.string()
})
export type InternalTransfer = z.infer<typeof InternalTransfer>

export const Transfer = InternalTransfer.extend({
  // A transfer always has a status because we check with the provider to
  // combine the information from the API and the database.
  status: z.nativeEnum(TransferStatus),
  fees: z.array(Fee)
})
export type Transfer = z.infer<typeof Transfer>

export const isAddressDestination = (destination: Destination): destination is AddressDestination => {
  return 'address' in destination
}

/**
 * Ensures the provider specific is an object.
 */
export const isProviderSpecific = (value?: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null
}
