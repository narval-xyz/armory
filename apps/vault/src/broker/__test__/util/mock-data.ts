import {
  buildSignerForAlg,
  hash,
  hexToBase64Url,
  JwsdHeader,
  PrivateKey,
  secp256k1PrivateKeyToJwk,
  secp256k1PrivateKeyToPublicJwk,
  signJwsd
} from '@narval/signature'
import { Client } from '../../../shared/type/domain.type'

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
export const TEST_DIFFERENT_CLIENT_ID = 'different-client-id'

const now = new Date()
const PRIVATE_KEY = '0x7cfef3303797cbc7515d9ce22ffe849c701b0f2812f999b0847229c47951fca5'
export const testUserPrivateJwk = secp256k1PrivateKeyToJwk(PRIVATE_KEY)
export const testUserPublicJWK = secp256k1PrivateKeyToPublicJwk(PRIVATE_KEY)
/* Here's a variant of using an eddsa key to sign it too; just to prove it works with other alg*/
// const PRIVATE_KEY = '0x0101010101010101010101010101010101010101010101010101010101010101'
// export const testUserPrivateJwk = ed25519PrivateKeyToJwk(PRIVATE_KEY)
// export const testUserPublicJWK = ed25519PrivateKeyToPublicJwk(PRIVATE_KEY)

export const testClient: Client = {
  clientId: TEST_CLIENT_ID,
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
          publicKey: testUserPublicJWK
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

export const testDifferentClient: Client = {
  clientId: TEST_DIFFERENT_CLIENT_ID,
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
          publicKey: testUserPublicJWK
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
    createdAt: now,
    updatedAt: now,
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
    createdAt: now,
    updatedAt: now,
    revokedAt: null
  }
]

export const TEST_WALLET_CONNECTIONS = [
  {
    clientId: TEST_CLIENT_ID,
    connectionId: 'connection-1',
    walletId: 'wallet-1',
    createdAt: now
  },
  {
    clientId: TEST_CLIENT_ID,
    connectionId: 'connection-2',
    walletId: 'wallet-2',
    createdAt: now
  }
]

export const TEST_WALLETS_WITH_SAME_TIMESTAMP = [
  {
    id: 'wallet-6',
    clientId: TEST_DIFFERENT_CLIENT_ID,
    provider: 'anchorage',
    label: 'Test Wallet 1',
    externalId: 'ext-wallet-1',
    createdAt: now,
    updatedAt: now
  },
  {
    id: 'wallet-7',
    clientId: TEST_DIFFERENT_CLIENT_ID,
    provider: 'anchorage',
    label: 'Test Wallet 2',
    externalId: 'ext-wallet-2',
    createdAt: now,
    updatedAt: now
  },
  {
    id: 'wallet-8',
    clientId: TEST_DIFFERENT_CLIENT_ID,
    provider: 'anchorage',
    label: 'Test Wallet 3',
    externalId: 'ext-wallet-3',
    createdAt: now,
    updatedAt: now
  }
]

export const TEST_WALLETS = [
  {
    id: 'wallet-1',
    clientId: TEST_CLIENT_ID,
    provider: 'anchorage',
    label: 'Test Wallet 1',
    externalId: 'ext-wallet-1',
    createdAt: now,
    updatedAt: now
  },
  {
    id: 'wallet-2',
    clientId: TEST_CLIENT_ID,
    provider: 'anchorage',
    label: 'Test Wallet 2',
    externalId: 'ext-wallet-2',
    createdAt: new Date(now.getTime() + 1000),
    updatedAt: new Date(now.getTime() + 1000)
  },
  {
    id: 'wallet-3',
    clientId: TEST_CLIENT_ID,
    provider: 'anchorage',
    label: 'Test Wallet 3',
    externalId: 'ext-wallet-3',
    createdAt: new Date(now.getTime() + 2000),
    updatedAt: new Date(now.getTime() + 2000)
  },
  {
    id: 'wallet-4',
    clientId: TEST_CLIENT_ID,
    provider: 'anchorage',
    label: 'Test Wallet 4',
    externalId: 'ext-wallet-4',
    createdAt: new Date(now.getTime() + 3000),
    updatedAt: new Date(now.getTime() + 3000)
  },
  {
    id: 'wallet-5',
    clientId: TEST_CLIENT_ID,
    provider: 'anchorage',
    label: 'Test Wallet 5',
    externalId: 'ext-wallet-5',
    createdAt: new Date(now.getTime() + 4000),
    updatedAt: new Date(now.getTime() + 4000)
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
    createdAt: now,
    updatedAt: now
  },
  {
    id: 'account-2',
    clientId: TEST_CLIENT_ID,
    provider: 'anchorage',
    label: 'Test Account 2',
    externalId: 'ext-account-2',
    walletId: 'wallet-1', // Linking to wallet-1
    networkId: '60',
    createdAt: now,
    updatedAt: now
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
    createdAt: now,
    updatedAt: now
  },
  {
    id: 'address-2',
    clientId: TEST_CLIENT_ID,
    provider: 'anchorage',
    externalId: 'ext-address-2',
    accountId: 'account-1', // Another address for account-1
    address: '0x0987654321098765432109876543210987654321', // Example ETH address
    createdAt: now,
    updatedAt: now
  },
  {
    id: 'address-3',
    clientId: TEST_CLIENT_ID,
    provider: 'anchorage',
    externalId: 'ext-address-3',
    accountId: 'account-2', // Linking to account-2
    address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', // Example BTC address
    createdAt: now,
    updatedAt: now
  }
]

export const getJwsd = async ({
  userPrivateJwk,
  baseUrl,
  requestUrl,
  accessToken,
  payload,
  htm
}: {
  userPrivateJwk: PrivateKey
  baseUrl?: string
  requestUrl: string
  accessToken?: string
  payload: object | string
  htm?: string
}) => {
  const now = Math.floor(Date.now() / 1000)

  const jwsdSigner = await buildSignerForAlg(userPrivateJwk)
  const jwsdHeader: JwsdHeader = {
    alg: userPrivateJwk.alg,
    kid: userPrivateJwk.kid,
    typ: 'gnap-binding-jwsd',
    htm: htm || 'POST',
    uri: `${baseUrl || 'https://vault-test.narval.xyz'}${requestUrl}`, // matches the client baseUrl + request url
    created: now,
    ath: accessToken ? hexToBase64Url(hash(accessToken)) : undefined
  }

  const jwsd = await signJwsd(payload, jwsdHeader, jwsdSigner).then((jws) => {
    // Strip out the middle part for size
    const parts = jws.split('.')
    parts[1] = ''
    return parts.join('.')
  })

  return jwsd
}
