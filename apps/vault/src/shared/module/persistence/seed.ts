/* eslint-disable */
import { LoggerService } from '@narval/nestjs-shared'
import { PrismaClient } from '@prisma/client/vault'
import { v4 } from 'uuid'

const prisma = new PrismaClient()

const clientId = 'client-1'

// Organize all data by connection
const ANCHORAGE_CONNECTIONS = [
  {
    connection: {
      id: 'connection-1',
      clientId,
      provider: 'anchorage',
      integrity: 'sample-integrity-hash',
      url: 'https://api.anchorage-staging.com/v2',
      label: 'Anchorage Staging - SubCustomer 1',
      credentials: {
        apiKey: 'sample-api-key',
        secretKey: 'sample-secret-key'
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      revokedAt: null,
      status: 'active'
    },
    wallets: [
      {
        id: 'wallet-1',
        clientId,
        provider: 'anchorage',
        label: 'Wallet for SubCustomer 1',
        externalId: 'vault_1',
        createdAt: new Date(),
        updatedAt: new Date(),
        accounts: [
          {
            id: 'accountWallet1Btc',
            clientId,
            provider: 'anchorage',
            label: 'Bitcoin Mainnet',
            externalId: 'wallet_1',
            networkId: '1',
            createdAt: new Date(),
            updatedAt: new Date(),
            addresses: [
              {
                id: 'address-acc-wallet-1-btc-1',
                clientId,
                provider: 'anchorage',
                externalId: 'btc_address_1',
                address: 'b1742d35Cc6634C0532925a3b844Bc454e4438f44e',
                createdAt: new Date(),
                updatedAt: new Date()
              },
              {
                id: 'address-acc-wallet-1-btc-2',
                clientId,
                provider: 'anchorage',
                externalId: 'btc_address_2',
                address: 'b1123d35Cc6634C0532925a3b844Bc454e4438f789',
                createdAt: new Date(),
                updatedAt: new Date()
              }
            ]
          },
          {
            id: 'accountWallet1Eth',
            clientId,
            provider: 'anchorage',
            label: 'Trading BTC',
            externalId: 'wallet_3',
            networkId: '60',
            createdAt: new Date(),
            updatedAt: new Date(),
            addresses: [
              {
                id: 'address-account-wallet-1-eth',
                clientId,
                provider: 'anchorage',
                externalId: 'eth_addr',
                address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
                createdAt: new Date(),
                updatedAt: new Date()
              }
            ]
          }
        ]
      }
    ],
    knownDestinations: [
      {
        id: 'dest1',
        clientId,
        provider: 'anchorage',
        assetId: 'BTC',
        externalId: 'dest1',
        address: 'bt12NGZrVvZG92qGYqzTLjCAewvPZ7JE8S8VxE',
        networkId: 'BTC',
        externalClassification: 'trusted',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
  },
  {
    connection: {
      id: 'connection-2',
      clientId,
      provider: 'anchorage',
      integrity: 'sample-integrity-hash-2',
      url: 'https://api.anchorage-staging.com/v2',
      label: 'Anchorage Staging - SubCustomer 2',
      credentials: {
        apiKey: 'sample-api-key-2',
        secretKey: 'sample-secret-key-2'
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      revokedAt: null,
      status: 'active'
    },
    wallets: [
      {
        id: 'wallet-2',
        clientId,
        provider: 'anchorage',
        label: 'Wallet for SubCustomer 2',
        externalId: 'vault_2',
        createdAt: new Date(),
        updatedAt: new Date(),
        accounts: [
          {
            id: 'accountWallet2Eth',
            clientId,
            provider: 'anchorage',
            label: 'Ethereum Mainnet',
            externalId: 'wallet_2',
            networkId: '60',
            createdAt: new Date(),
            updatedAt: new Date(),
            addresses: [
              {
                id: 'address-account-wallet-2-eth',
                clientId,
                provider: 'anchorage',
                externalId: 'btc_trading_addr_1',
                address: 'bt12NGZrVvZG92qGYqzTLjCAewvPZ7JE8S8VxE',
                createdAt: new Date(),
                updatedAt: new Date()
              }
            ]
          }
        ]
      }
    ],
    knownDestinations: []
  }
]

async function main() {
  const logger = new LoggerService()
  logger.log('Seeding Vault database with Anchorage provider data')

  await prisma.$transaction(async (txn) => {
    // Process each connection group
    for (const group of ANCHORAGE_CONNECTIONS) {
      // Create connection
      const connection = await txn.providerConnection.create({
        data: {
          ...group.connection,
          credentials: group.connection.credentials as any
        }
      })

      const wallets = group.wallets.map((wallet) => ({
        id: wallet.id,
        clientId: wallet.clientId,
        provider: wallet.provider,
        label: wallet.label,
        externalId: wallet.externalId,
        createdAt: wallet.createdAt,
        updatedAt: wallet.updatedAt
      }))

      const providerWalletConnection = wallets.map((wallet) => ({
        clientId: wallet.clientId,
        connectionId: connection.id,
        walletId: wallet.id
      }))

      const accounts = group.wallets.flatMap((wallet) =>
        wallet.accounts.map((account) => ({
          id: account.id,
          clientId: account.clientId,
          provider: account.provider,
          label: account.label,
          externalId: account.externalId,
          walletId: wallet.id,
          networkId: account.networkId,
          createdAt: account.createdAt,
          updatedAt: account.updatedAt
        }))
      )

      const addresses = group.wallets.flatMap((wallet) =>
        wallet.accounts.flatMap((acc) =>
          acc.addresses.map((address) => ({
            id: address.id,
            clientId: address.clientId,
            provider: address.provider,
            externalId: address.externalId,
            accountId: acc.id,
            address: address.address,
            createdAt: address.createdAt,
            updatedAt: address.updatedAt
          }))
        )
      )

      const knownDestinations = group.knownDestinations.map((dest) => ({
        ...dest,
        connectionId: group.connection.id
      }))

      const sync = {
        id: v4(),
        clientId,
        connectionId: group.connection.id,
        status: 'success'
      }

      await txn.providerWallet.createMany({
        data: wallets
      })

      await txn.providerWalletConnection.createMany({
        data: providerWalletConnection
      })

      await txn.providerAccount.createMany({
        data: accounts
      })

      await txn.providerAddress.createMany({
        data: addresses
      })

      await txn.providerKnownDestination.createMany({
        data: knownDestinations
      })

      await txn.providerSync.create({
        data: sync
      })
    }
  })

  logger.log('Vault database germinated 🌱')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
