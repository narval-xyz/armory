/* eslint-disable @typescript-eslint/no-unused-vars */

import { ProviderAccount, ProviderAddress, ProviderConnection, ProviderWallet } from '@prisma/client/vault'
import { ConnectionRepository } from '../../persistence/repository/connection.repository'
import { TEST_ACCOUNTS, TEST_ADDRESSES, TEST_CONNECTIONS } from './mock-data'

// Helper function to get expected connection format for API response
export const getExpectedConnection = (model: ProviderConnection) => {
  const entity = ConnectionRepository.parseModel(model)

  return {
    clientId: entity.clientId,
    connectionId: entity.connectionId,
    createdAt: entity.createdAt.toISOString(),
    label: entity.label,
    provider: entity.provider,
    status: entity.status,
    updatedAt: entity.updatedAt.toISOString(),
    url: entity.url
  }
}

// Helper function to get expected address format
export const getExpectedAddress = (address: ProviderAddress) => {
  const { id, ...addressWithoutId } = address
  return {
    ...addressWithoutId,
    addressId: address.id,
    createdAt: new Date(address.createdAt).toISOString(),
    updatedAt: new Date(address.updatedAt).toISOString(),
    connectionId: address.connectionId
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
    createdAt: account.createdAt.toISOString(),
    updatedAt: account.updatedAt.toISOString()
  }
}

// Helper function to get expected wallet format with accounts and connections
export const getExpectedWallet = (wallet: ProviderWallet) => {
  const accounts = TEST_ACCOUNTS.filter((acc) => acc.walletId === wallet.id)
  const connections = TEST_CONNECTIONS.filter((conn) => conn.id === wallet.connectionId).map((c) => ({
    ...c,
    credentials: c.credentials ? JSON.stringify(c.credentials) : null,
    integrity: null
  }))
  const { id, connectionId, ...walletWithoutId } = wallet

  const exp = {
    ...walletWithoutId,
    walletId: wallet.id,
    connections: connections.map(getExpectedConnection),
    createdAt: wallet.createdAt.toISOString(),
    updatedAt: wallet.updatedAt.toISOString(),
    accounts: accounts.map(getExpectedAccount)
  }

  return exp
}
