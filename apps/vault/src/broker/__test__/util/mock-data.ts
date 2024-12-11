const privateKey = {
  kty: 'OKP',
  crv: 'Ed25519',
  alg: 'EDDSA',
  kid: '0xaf8dcff8da6aae18c2170f59a0734c8c5c19ca726a1b75993857bd836db00a5f',
  x: 'HrmLI5NH3cYp4-HluFGBOcYvARGti_oz0aZMXMzy8m4',
  d: 'nq2eDJPp9NAqCdTT_dNerIJFJxegTKmFgDAsFkhbJIA'
}

const { d: _d, ...publicKey } = privateKey

export const TEST_CLIENT_ID = 'test-client-id'

export const TEST_CONNECTIONS = [
  {
    id: 'connection-1',
    clientId: TEST_CLIENT_ID,
    provider: 'anchorage',
    url: 'https://api.anchorage.com',
    label: 'Test Connection 1',
    credentials: {
      apiKey: 'test-api-key-1',
      privateKey,
      publicKey
    },
    status: 'active',
    integrity: 'test-integrity-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    revokedAt: null
  },
  {
    id: 'connection-2',
    clientId: TEST_CLIENT_ID,
    provider: 'anchorage',
    url: 'https://api.anchorage.com',
    label: 'Test Connection 2',
    credentials: {
      apiKey: 'test-api-key-1',
      privateKey,
      publicKey
    },
    status: 'active',
    integrity: 'test-integrity-2',
    createdAt: new Date(),
    updatedAt: new Date(),
    revokedAt: null
  }
]

export const TEST_WALLET_CONNECTIONS = [
  {
    clientId: TEST_CLIENT_ID,
    connectionId: 'connection-1',
    walletId: 'wallet-1',
    createdAt: new Date()
  },
  {
    clientId: TEST_CLIENT_ID,
    connectionId: 'connection-2',
    walletId: 'wallet-2',
    createdAt: new Date()
  }
]

export const TEST_WALLETS = [
  {
    id: 'wallet-1',
    clientId: TEST_CLIENT_ID,
    provider: 'anchorage',
    label: 'Test Wallet 1',
    externalId: 'ext-wallet-1',
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z')
  },
  {
    id: 'wallet-2',
    clientId: TEST_CLIENT_ID,
    provider: 'anchorage',
    label: 'Test Wallet 2',
    externalId: 'ext-wallet-2',
    createdAt: new Date('2024-01-01T00:00:01.000Z'), // One second later
    updatedAt: new Date('2024-01-01T00:00:01.000Z')
  }
]

export const TEST_ACCOUNTS = [
  {
    id: 'account-1',
    clientId: TEST_CLIENT_ID,
    provider: 'anchorage',
    label: 'Test Account 1',
    externalId: 'ext-account-1',
    walletId: 'wallet-1', // Linking to wallet-1
    networkId: '1',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'account-2',
    clientId: TEST_CLIENT_ID,
    provider: 'anchorage',
    label: 'Test Account 2',
    externalId: 'ext-account-2',
    walletId: 'wallet-1', // Linking to wallet-1
    networkId: '60',
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

export const TEST_ADDRESSES = [
  {
    id: 'address-1',
    clientId: TEST_CLIENT_ID,
    provider: 'anchorage',
    externalId: 'ext-address-1',
    accountId: 'account-1', // Linking to account-1
    address: '0x1234567890123456789012345678901234567890', // Example ETH address
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'address-2',
    clientId: TEST_CLIENT_ID,
    provider: 'anchorage',
    externalId: 'ext-address-2',
    accountId: 'account-1', // Another address for account-1
    address: '0x0987654321098765432109876543210987654321', // Example ETH address
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'address-3',
    clientId: TEST_CLIENT_ID,
    provider: 'anchorage',
    externalId: 'ext-address-3',
    accountId: 'account-2', // Linking to account-2
    address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', // Example BTC address
    createdAt: new Date(),
    updatedAt: new Date()
  }
]
