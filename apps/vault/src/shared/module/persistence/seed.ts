/* eslint-disable */
import { ConfigService } from '@narval/config-module'
import { LoggerService } from '@narval/nestjs-shared'
import { ed25519PrivateKeySchema, ed25519PublicKeySchema } from '@narval/signature'
import { PrismaClient } from '@prisma/client/vault'
import { ConnectionSeedService } from 'apps/vault/src/broker/persistence/connection.seed'
import { Config, load } from 'apps/vault/src/main.config'
import { v4 } from 'uuid'
import { ConnectionStatus } from '../../../broker/core/type/connection.type'
import { Provider } from '../../../broker/core/type/provider.type'
import { ConnectionRepository } from '../../../broker/persistence/repository/connection.repository'
import { PrismaService } from './service/prisma.service'

const prisma = new PrismaClient()

const clientId = 'client-1'

const privateKey = ed25519PrivateKeySchema.parse({
  kty: 'OKP',
  crv: 'Ed25519',
  alg: 'EDDSA',
  kid: '0x64c3fa0c628c59c5795782356161bbe5bde6507f92d17256c174bfd19ed9a9bb',
  x: 'wl2BAebjqX4_tvZcZo_VK3ZSxWZ-9-CGKe-3E9rlvB0',
  d: 'A3imDr5aM3N1Iy2AMqn46PUsiiM2R4mRyj42yt3OAXM'
})
const publicKey = ed25519PublicKeySchema.parse(privateKey)

const privateKey2 = ed25519PrivateKeySchema.parse({
  kty: 'OKP',
  crv: 'Ed25519',
  alg: 'EDDSA',
  kid: '0x5594dd8a27608b37a496787df068bc7843ec55322f54c8cd0d32ac4361caba58',
  x: 'qQoqY2hWQ9c2CgnTE7TALK8ogWe2PBl3SrEH_ADihMY',
  d: '4VBMwn8ZPV8c9E9Evv6yx_b71HjESKMaElXmbOcfMtU'
})

const publicKey2 = ed25519PublicKeySchema.parse(privateKey2)
// Organize all data by connection
const ANCHORAGE_CONNECTIONS = [
  {
    connection: {
      connectionId: 'connection-1',
      clientId,
      provider: Provider.ANCHORAGE,
      integrity: 'sample-integrity-hash',
      url: 'https://api.anchorage-staging.com',
      label: 'Anchorage Staging - SubCustomer 1',
      credentials: {
        apiKey: 'sample-api-key',
        privateKey,
        publicKey
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      status: ConnectionStatus.ACTIVE
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
        label: 'Destination 1',
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
      connectionId: 'connection-2',
      clientId,
      provider: Provider.ANCHORAGE,
      integrity: 'sample-integrity-hash-2',
      url: 'https://api.anchorage-staging.com',
      label: 'Anchorage Staging - SubCustomer 2',
      credentials: {
        apiKey: 'sample-api-key-2',
        privateKey: privateKey2,
        publicKey: publicKey2
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      status: ConnectionStatus.ACTIVE
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
  const config = new ConfigService<Config>(load())
  const prismaService = new PrismaService(config, logger)
  const connRepository = new ConnectionRepository(prismaService)
  const connSeed = new ConnectionSeedService(connRepository)

  logger.log('Seeding Vault database with Anchorage provider data')

  if (process.env.NODE_ENV === 'development') {
    await connSeed.createNarvalDevConnection()
  }

  await prisma.$transaction(async (txn) => {
    // Process each connection group
    for (const group of ANCHORAGE_CONNECTIONS) {
      // Create connection
      const connection = await connSeed.createConnection(group.connection)

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
        connectionId: connection.connectionId,
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
        ...dest
      }))

      const knownDestinationConnection = knownDestinations.map((dest) => ({
        clientId: dest.clientId,
        connectionId: connection.connectionId,
        knownDestinationId: dest.id
      }))

      const sync = {
        id: v4(),
        clientId,
        connectionId: group.connection.connectionId,
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

      await txn.providerKnownDestinationConnection.createMany({
        data: knownDestinationConnection
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
