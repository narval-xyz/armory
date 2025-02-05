import { privateKeyToHex, secp256k1PrivateKeyToJwk, secp256k1PrivateKeyToPublicJwk } from '@narval/signature'
import { TestingModule } from '@nestjs/testing'
import { randomUUID } from 'crypto'
import { ClientService } from '../../../client/core/service/client.service'
import { Client } from '../../../shared/type/domain.type'
import { ANCHORAGE_TEST_API_BASE_URL } from '../../core/provider/anchorage/__test__/server-mock/server'
import { AnchorageCredentials } from '../../core/provider/anchorage/anchorage.type'
import { ConnectionService } from '../../core/service/connection.service'
import { ConnectionStatus, ConnectionWithCredentials } from '../../core/type/connection.type'
import { Account, Address, Wallet } from '../../core/type/indexed-resources.type'
import { Provider } from '../../core/type/provider.type'
import { AccountRepository } from '../../persistence/repository/account.repository'
import { AddressRepository } from '../../persistence/repository/address.repository'
import { WalletRepository } from '../../persistence/repository/wallet.repository'

export const clientId = randomUUID()

const now = new Date()

const USER_PRIVATE_KEY = '0x7cfef3303797cbc7515d9ce22ffe849c701b0f2812f999b0847229c47951fca5'

export const userPrivateKey = secp256k1PrivateKeyToJwk(USER_PRIVATE_KEY)
export const userPublicKey = secp256k1PrivateKeyToPublicJwk(USER_PRIVATE_KEY)

export const client: Client = {
  clientId,
  auth: {
    disabled: false,
    local: {
      jwsd: {
        maxAge: 600,
        requiredComponents: ['htm', 'uri', 'created', 'ath']
      },
      allowedUsersJwksUrl: null,
      allowedUsers: [
        {
          userId: 'user-1',
          publicKey: userPublicKey
        }
      ]
    },
    tokenValidation: {
      disabled: true,
      url: null,
      jwksUrl: null,
      verification: {
        audience: null,
        issuer: 'https://armory.narval.xyz',
        maxTokenAge: 300,
        requireBoundTokens: false, // DO NOT REQUIRE BOUND TOKENS; we're testing both payload.cnf bound tokens and unbound here.
        allowBearerTokens: false,
        allowWildcard: []
      },
      pinnedPublicKey: null
    }
  },
  name: 'test-client',
  configurationSource: 'dynamic',
  backupPublicKey: null,
  baseUrl: null,
  createdAt: now,
  updatedAt: now
}

export const anchorageConnectionOneCredentials: AnchorageCredentials = {
  apiKey: 'test-anchorage-api-key-one',
  privateKey: {
    kty: 'OKP',
    crv: 'Ed25519',
    alg: 'EDDSA',
    kid: '0x50802454e9997ac331334bdfbc3a2f15826980d39e5ce5292353402dcd21d6f5',
    x: 'BLEYbYCvYvA90guTeqCfIXMKdgcO2LiG9u-0h0lnqi4',
    d: 'HXNx_HoOCxEbcTLjMY-dbL9psOuE3WFQ68zkd9oeeHw'
  },
  publicKey: {
    kty: 'OKP',
    alg: 'EDDSA',
    kid: '0x50802454e9997ac331334bdfbc3a2f15826980d39e5ce5292353402dcd21d6f5',
    crv: 'Ed25519',
    x: 'BLEYbYCvYvA90guTeqCfIXMKdgcO2LiG9u-0h0lnqi4'
  }
}

export const anchorageConnectionOne: ConnectionWithCredentials = {
  clientId,
  connectionId: randomUUID(),
  provider: Provider.ANCHORAGE,
  label: 'Anchorage test connection one',
  url: ANCHORAGE_TEST_API_BASE_URL,
  status: ConnectionStatus.ACTIVE,
  revokedAt: undefined,
  createdAt: now,
  updatedAt: now,
  credentials: anchorageConnectionOneCredentials
}

export const anchorageWalletOne: Wallet = {
  accounts: [],
  clientId,
  connectionId: anchorageConnectionOne.connectionId,
  createdAt: new Date('2024-01-01T00:00:00Z'),
  externalId: 'external-id-one',
  label: 'wallet 1',
  provider: anchorageConnectionOne.provider,
  updatedAt: now,
  walletId: randomUUID()
}

export const anchorageWalletTwo: Wallet = {
  clientId,
  accounts: [],
  connectionId: anchorageConnectionOne.connectionId,
  createdAt: new Date('2024-01-02T00:00:00Z'),
  externalId: 'external-id-two',
  label: 'wallet 2',
  provider: anchorageConnectionOne.provider,
  updatedAt: now,
  walletId: randomUUID()
}

export const anchorageWalletThree: Wallet = {
  clientId,
  accounts: [],
  connectionId: anchorageConnectionOne.connectionId,
  createdAt: new Date('2024-01-03T00:00:00Z'),
  externalId: 'external-id-three',
  label: 'wallet 3',
  provider: anchorageConnectionOne.provider,
  updatedAt: now,
  walletId: randomUUID()
}

export const anchorageAccountOne: Account = {
  clientId,
  accountId: randomUUID(),
  addresses: [],
  createdAt: new Date('2024-01-01T00:00:00Z'),
  externalId: 'account-external-id-one',
  connectionId: anchorageConnectionOne.connectionId,
  label: 'wallet 1 account 1',
  networkId: 'BTC',
  provider: anchorageConnectionOne.provider,
  updatedAt: now,
  walletId: anchorageWalletOne.walletId
}

export const anchorageAccountTwo: Account = {
  clientId,
  accountId: randomUUID(),
  addresses: [],
  createdAt: new Date('2024-01-02T00:00:00Z'),
  connectionId: anchorageConnectionOne.connectionId,
  externalId: 'account-external-id-two',
  label: 'wallet 1 account 2',
  networkId: 'BTC',
  provider: anchorageConnectionOne.provider,
  updatedAt: now,
  walletId: anchorageWalletOne.walletId
}

export const anchorageAddressOne: Address = {
  clientId,
  accountId: anchorageAccountOne.accountId,
  address: 'address-one',
  addressId: randomUUID(),
  connectionId: anchorageConnectionOne.connectionId,
  createdAt: new Date('2024-01-01T00:00:00Z'),
  externalId: 'address-external-id-one',
  provider: anchorageConnectionOne.provider,
  updatedAt: now
}

export const anchorageAddressTwo: Address = {
  clientId,
  accountId: anchorageAccountOne.accountId,
  address: 'address-two',
  addressId: randomUUID(),
  connectionId: anchorageConnectionOne.connectionId,
  createdAt: new Date('2024-01-02T00:00:00Z'),
  externalId: 'address-external-id-two',
  provider: anchorageConnectionOne.provider,
  updatedAt: now
}

export const seed = async (module: TestingModule) => {
  const clientService = module.get(ClientService)
  const connectionService = module.get(ConnectionService)
  const walletRepository = module.get(WalletRepository)
  const accountRepository = module.get(AccountRepository)
  const addressRepository = module.get(AddressRepository)

  await clientService.save(client)

  await connectionService.create(client.clientId, {
    connectionId: anchorageConnectionOne.connectionId,
    createdAt: anchorageConnectionOne.updatedAt,
    label: anchorageConnectionOne.label,
    provider: anchorageConnectionOne.provider,
    url: anchorageConnectionOne.url as string,
    credentials: {
      apiKey: anchorageConnectionOneCredentials.apiKey,
      privateKey: await privateKeyToHex(anchorageConnectionOneCredentials.privateKey)
    }
  })

  await walletRepository.bulkCreate([anchorageWalletOne, anchorageWalletTwo, anchorageWalletThree])
  await accountRepository.bulkCreate([anchorageAccountOne, anchorageAccountTwo])
  await addressRepository.bulkCreate([anchorageAddressOne, anchorageAddressTwo])
}
