import { ProviderAccount, ProviderAddress, ProviderConnection, ProviderWallet } from '@prisma/client/vault'
import { PublicConnection } from '../../core/type/connection.type'
import { TEST_ACCOUNTS, TEST_ADDRESSES, TEST_CONNECTIONS, TEST_WALLET_CONNECTIONS } from './mock-data'

// Helper function to get expected connection format for API response
export const getExpectedConnection = (connection: ProviderConnection): PublicConnection => {
  const {
    credentials,
    revokedAt,
    clientId,
    createdAt,
    updatedAt,
    url,
    integrity,
    id,
    ...connectionWithoutPrivateData
  } = connection
  return PublicConnection.parse({
    ...connectionWithoutPrivateData,
    connectionId: connection.id
  })
}

// Helper function to get expected address format
export const getExpectedAddress = (address: ProviderAddress) => {
  const { id, ...addressWithoutId } = address
  return {
    ...addressWithoutId,
    addressId: address.id,
    createdAt: new Date(address.createdAt).toISOString(),
    updatedAt: new Date(address.updatedAt).toISOString()
  }
}

// Helper function to get expected account format with addresses
export const getExpectedAccount = (account: ProviderAccount) => {
  const addresses = TEST_ADDRESSES.filter((addr) => addr.accountId === account.id)
  const { id, walletId, ...accountWithoutId } = account
  return {
    ...accountWithoutId,
    walletId,
    accountId: account.id,
    addresses: addresses.map(getExpectedAddress),
    createdAt: new Date(account.createdAt).toISOString(),
    updatedAt: new Date(account.updatedAt).toISOString()
  }
}

// Helper function to get expected wallet format with accounts and connections
export const getExpectedWallet = (wallet: ProviderWallet) => {
  const accounts = TEST_ACCOUNTS.filter((acc) => acc.walletId === wallet.id)
  const walletConnections = TEST_WALLET_CONNECTIONS.filter((conn) => conn.walletId === wallet.id)
  const connections = TEST_CONNECTIONS.filter((conn) => walletConnections.some((wc) => wc.connectionId === conn.id))
  const { id, ...walletWithoutId } = wallet

  return {
    ...walletWithoutId,
    walletId: wallet.id,
    accounts: accounts.map(getExpectedAccount),
    connections: connections.map(getExpectedConnection),
    createdAt: new Date(wallet.createdAt).toISOString(),
    updatedAt: new Date(wallet.updatedAt).toISOString()
  }
}
