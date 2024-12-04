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

      // Process wallets and their hierarchies
      for (const wallet of group.wallets) {
        // Create wallet
        const createdWallet = await txn.providerWallet.create({
          data: {
            id: wallet.id,
            clientId: wallet.clientId,
            provider: wallet.provider,
            label: wallet.label,
            externalId: wallet.externalId,
            createdAt: wallet.createdAt,
            updatedAt: wallet.updatedAt
          }
        })

        // Link wallet to connection
        await txn.providerWalletConnection.create({
          data: {
            clientId: wallet.clientId,
            connectionId: connection.id,
            walletId: createdWallet.id
          }
        })

        // Create accounts and addresses
        for (const account of wallet.accounts) {
          const createdAccount = await txn.providerAccount.create({
            data: {
              id: account.id,
              clientId: account.clientId,
              provider: account.provider,
              label: account.label,
              externalId: account.externalId,
              walletId: createdWallet.id,
              networkId: account.networkId,
              createdAt: account.createdAt,
              updatedAt: account.updatedAt
            }
          })

          // Create addresses for this account
          for (const address of account.addresses) {
            await txn.providerAddress.create({
              data: {
                id: address.id,
                clientId: address.clientId,
                provider: address.provider,
                externalId: address.externalId,
                accountId: createdAccount.id,
                address: address.address,
                createdAt: address.createdAt,
                updatedAt: address.updatedAt
              }
            })
          }
        }
      }

      // Create known destinations
      for (const dest of group.knownDestinations) {
        await txn.providerKnownDestination.create({
          data: {
            ...dest,
            connectionId: connection.id
          }
        })
      }

      // Create sync record for this connection
      await txn.providerSync.create({
        data: {
          id: v4(),
          clientId,
          connectionId: connection.id,
          status: 'success'
        }
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
