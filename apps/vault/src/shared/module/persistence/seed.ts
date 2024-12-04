/* eslint-disable */
import { LoggerService } from '@narval/nestjs-shared'
import { PrismaClient, Vault } from '@prisma/client/vault'
import { v4 } from 'uuid'

const prisma = new PrismaClient()

const vault: Vault = {
  id: '7d704a62-d15e-4382-a826-1eb41563043b',
  adminApiKey: 'admin-api-key-xxx',
  masterKey: 'master-key-xxx'
}

const ANCHORAGE_SEED_DATA = {
  // Basic client setup
  client: {
    id: v4(),
    provider: 'anchorage' as const
  },

  // Connection details
  connection: {
    id: v4(),
    url: 'https://api.anchorage-staging.com/v2',
    label: 'Anchorage Staging',
    credentials: {
      apiKey: 'sample-api-key',
      secretKey: 'sample-secret-key'
    }
  },

  // Workspaces represent different organizations.
  workspaces: [
    {
      wallet: {
        id: 'wallet-1',
        externalId: 'vault_1',
        label: 'Wallet for org1'
      },
      accounts: [
        {
          // BTC Account
          account: {
            id: 'account-1',
            externalId: 'wallet_1',
            label: 'Bitcoin Mainnet',
            networkId: '1'
          },
          // Multiple addresses for BTC (UTXO)
          addresses: [
            {
              id: 'address-1',
              externalId: 'btc_address_1',
              address: 'b1742d35Cc6634C0532925a3b844Bc454e4438f44e'
            },
            {
              id: 'address-2',
              externalId: 'btc_address_2',
              address: 'b1123d35Cc6634C0532925a3b844Bc454e4438f789'
            }
          ]
        },
        {
          // ETH Account
          account: {
            id: 'account-2',
            externalId: 'wallet_2',
            label: 'Ethereum Mainnet',
            networkId: '60'
          },
          // Single address for ETH (account-based)
          addresses: [
            {
              id: 'address-3',
              externalId: 'eth_addr',
              address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
            }
          ]
        }
      ]
    },
    {
      wallet: {
        id: 'wallet-2',
        externalId: 'vault_2',
        label: 'walletForOrg2'
      },
      accounts: [
        {
          account: {
            id: 'account-vault2-1',
            externalId: 'wallet_3',
            label: 'Trading BTC',
            networkId: 'BTC'
          },
          addresses: [
            {
              id: 'address-vault2-1',
              externalId: 'btc_trading_addr_1',
              address: 'bt12NGZrVvZG92qGYqzTLjCAewvPZ7JE8S8VxE'
            }
          ]
        }
      ]
    }
  ],

  // Address book entries
  knownDestinations: [
    {
      id: v4(),
      externalId: 'dest1',
      address: 'bt12NGZrVvZG92qGYqzTLjCAewvPZ7JE8S8VxE',
      networkId: 'BTC',
      externalClassification: 'trusted'
    }
  ]
}

async function main() {
  const logger = new LoggerService()
  logger.log('Seeding Vault database with Anchorage provider data')

  await prisma.$transaction(async (txn) => {
    // 1. Create the connection

    const connection = await txn.providerConnection.create({
      data: {
        id: ANCHORAGE_SEED_DATA.connection.id,
        clientId: ANCHORAGE_SEED_DATA.client.id,
        provider: ANCHORAGE_SEED_DATA.client.provider,
        url: ANCHORAGE_SEED_DATA.connection.url,
        label: ANCHORAGE_SEED_DATA.connection.label,
        credentials: ANCHORAGE_SEED_DATA.connection.credentials,
        status: 'active',
        integrity: 'sample-integrity-hash',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    // 2. Create each vault (provider wallet) and its contents
    for (const workspace of ANCHORAGE_SEED_DATA.workspaces) {
      // Create the provider wallet record
      const providerWallet = await txn.providerWallet.create({
        data: {
          id: workspace.wallet.id,
          clientId: ANCHORAGE_SEED_DATA.client.id,
          provider: ANCHORAGE_SEED_DATA.client.provider,
          label: workspace.wallet.label,
          externalId: workspace.wallet.externalId
        }
      })

      // Link wallet to connection
      await txn.providerWalletConnection.create({
        data: {
          clientId: ANCHORAGE_SEED_DATA.client.id,
          connectionId: connection.id,
          walletId: providerWallet.id
        }
      })

      // Create accounts and addresses
      for (const accountData of workspace.accounts) {
        const account = await txn.providerAccount.create({
          data: {
            id: accountData.account.id,
            clientId: ANCHORAGE_SEED_DATA.client.id,
            provider: ANCHORAGE_SEED_DATA.client.provider,
            label: accountData.account.label,
            externalId: accountData.account.externalId,
            walletId: providerWallet.id,
            networkId: accountData.account.networkId
          }
        })

        // Create addresses for this account
        for (const addrData of accountData.addresses) {
          await txn.providerAddress.create({
            data: {
              id: addrData.id,
              clientId: ANCHORAGE_SEED_DATA.client.id,
              provider: ANCHORAGE_SEED_DATA.client.provider,
              externalId: addrData.externalId,
              accountId: account.id,
              address: addrData.address
            }
          })
        }
      }
    }

    for (const destData of ANCHORAGE_SEED_DATA.knownDestinations) {
      await txn.providerKnownDestination.create({
        data: {
          id: destData.id,
          clientId: ANCHORAGE_SEED_DATA.client.id,
          connectionId: connection.id,
          provider: ANCHORAGE_SEED_DATA.client.provider,
          externalId: destData.externalId,
          externalClassification: destData.externalClassification,
          address: destData.address,
          networkId: destData.networkId
        }
      })
    }

    // 4. Create initial sync record
    await txn.providerSync.create({
      data: {
        id: v4(),
        clientId: ANCHORAGE_SEED_DATA.client.id,
        connectionId: connection.id,
        status: 'success'
      }
    })
  })

  logger.log('Vault database germinated with Anchorage provider data 🌱')
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
