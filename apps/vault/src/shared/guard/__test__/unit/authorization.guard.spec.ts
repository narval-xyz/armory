import { ConfigService } from '@narval/config-module'
import { LoggerService } from '@narval/nestjs-shared'
import { FIXTURE } from '@narval/policy-engine-shared'
import {
  buildSignerEip191,
  hash,
  hexToBase64Url,
  JwsdHeader,
  Payload,
  PrivateKey,
  privateKeyToHex,
  secp256k1PrivateKeyToJwk,
  secp256k1PrivateKeyToPublicJwk,
  secp256k1PublicKeyToJwk,
  SigningAlg,
  signJwsd,
  signJwt
} from '@narval/signature'
import { ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { mock } from 'jest-mock-extended'
import { ZodError } from 'zod'
import { ClientService } from '../../../../client/core/service/client.service'
import { Config } from '../../../../main.config'
import { Client } from '../../../type/domain.type'
import { AuthorizationGuard } from '../../authorization.guard'

const PRIVATE_KEY = '0x7cfef3303797cbc7515d9ce22ffe849c701b0f2812f999b0847229c47951fca5'
// Engine key used to sign the approval request
const enginePrivateJwk = secp256k1PrivateKeyToJwk(PRIVATE_KEY)
const pinnedPublicJWK = secp256k1PrivateKeyToPublicJwk(PRIVATE_KEY)

const getBaseClient = (): Client => ({
  clientId: 'test-client',
  auth: {
    disabled: false,
    local: {
      jwsd: {
        maxAge: 600,
        requiredComponents: ['htm', 'uri', 'created', 'ath']
      },
      allowedUsersJwksUrl: null,
      allowedUsers: null
    },
    tokenValidation: {
      disabled: false,
      url: null,
      jwksUrl: null,
      verification: {
        audience: null,
        issuer: 'https://armory.narval.xyz',
        maxTokenAge: 300,
        requireBoundTokens: true,
        allowBearerTokens: false,
        allowWildcard: [
          'path.to.allow',
          'transactionRequest.maxFeePerGas',
          'transactionRequest.maxPriorityFeePerGas',
          'transactionRequest.gas'
        ]
      },
      pinnedPublicKey: pinnedPublicJWK
    }
  },
  name: 'test-client',
  configurationSource: 'dynamic',
  backupPublicKey: null,
  baseUrl: 'https://vault-test.narval.xyz',
  createdAt: new Date(),
  updatedAt: new Date()
})

const getJwsd = async ({
  userPrivateJwk,
  baseUrl,
  requestUrl,
  accessToken,
  payload
}: {
  userPrivateJwk: PrivateKey
  baseUrl?: string
  requestUrl: string
  accessToken?: string
  payload: object | string
}) => {
  const now = Math.floor(Date.now() / 1000)

  const jwsdSigner = buildSignerEip191(await privateKeyToHex(userPrivateJwk))
  const jwsdHeader: JwsdHeader = {
    alg: SigningAlg.EIP191,
    kid: userPrivateJwk.kid,
    typ: 'gnap-binding-jwsd',
    htm: 'POST',
    uri: `${baseUrl || getBaseClient().baseUrl}${requestUrl}`, // matches the client baseUrl + request url
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

const getAccessToken = async (request: unknown, opts: object = {}) => {
  const payload: Payload = {
    requestHash: hash(request),
    sub: 'test-root-user-uid',
    iss: 'https://armory.narval.xyz',
    iat: Math.floor(Date.now() / 1000),
    ...opts
  }
  const signer = buildSignerEip191(PRIVATE_KEY)

  return signJwt(payload, enginePrivateJwk, { alg: SigningAlg.EIP191 }, signer)
}

describe('AuthorizationGuard', () => {
  let mockClientService = mock<ClientService>()
  let mockConfigService = mock<ConfigService<Config>>()

  let mockLogger = mock<LoggerService>()
  let mockReflector = mock<Reflector>()

  beforeEach(() => {
    jest.resetAllMocks()
    mockClientService = mock<ClientService>()
    mockConfigService = mock<ConfigService<Config>>()
    mockLogger = mock<LoggerService>()
    mockReflector = mock<Reflector>()
  })

  it('should be defined', () => {
    const guard = new AuthorizationGuard(mockClientService, mockConfigService, mockReflector, mockLogger)
    expect(guard).toBeDefined()
  })

  describe('canActivate', () => {
    const mockExecutionContext = ({ request }: { request?: unknown } = {}) => {
      const mockRequest = request || {
        headers: {},
        body: {},
        url: '/test',
        method: 'GET'
      }
      return {
        switchToHttp: () => ({
          getRequest: () => mockRequest
        }),
        getHandler: jest.fn()
      } as unknown as ExecutionContext
    }

    it('should throw when client-id header is missing', async () => {
      const guard = new AuthorizationGuard(mockClientService, mockConfigService, mockReflector, mockLogger)
      await expect(guard.canActivate(mockExecutionContext())).rejects.toThrow('Missing or invalid x-client-id header')
    })

    it('should throw when client is not found', async () => {
      const guard = new AuthorizationGuard(mockClientService, mockConfigService, mockReflector, mockLogger)
      const mockRequest = {
        headers: { 'x-client-id': 'client-that-does-not-exist' },
        body: {},
        url: '/test',
        method: 'GET'
      }
      const context = mockExecutionContext({ request: mockRequest })

      await expect(guard.canActivate(context)).rejects.toThrow('Client not found')
    })

    it('should pass when client auth is disabled', async () => {
      const client = getBaseClient()
      client.auth.disabled = true
      mockClientService.findById.mockResolvedValue(client)
      const guard = new AuthorizationGuard(mockClientService, mockConfigService, mockReflector, mockLogger)

      const mockRequest = {
        headers: { 'x-client-id': 'test-client' },
        body: {},
        url: '/test',
        method: 'GET'
      }
      const context = mockExecutionContext({ request: mockRequest })

      await expect(guard.canActivate(context)).resolves.toEqual(true)
      expect(mockLogger.warn).toHaveBeenCalled()
    })

    // For this scenario, we don't yet support JWKS, so if you disable tokenValidation you must pin the allowed users
    it('should throw when client auth is enabled AND token validation is disabled AND no allowed users are configured', async () => {
      const client = getBaseClient()
      client.auth.tokenValidation.disabled = true
      mockClientService.findById.mockResolvedValue(client)
      const guard = new AuthorizationGuard(mockClientService, mockConfigService, mockReflector, mockLogger)

      const mockRequest = {
        headers: { 'x-client-id': 'test-client' },
        body: {},
        url: '/test',
        method: 'GET'
      }
      const context = mockExecutionContext({ request: mockRequest })

      await expect(guard.canActivate(context)).rejects.toThrow('No allowed users configured for client')
      expect(mockLogger.warn).toHaveBeenCalled()
    })

    it('should throw when client auth is enabled AND token validation is disabled AND invalid jwsd for allowedUsers', async () => {
      const client = getBaseClient()
      client.auth.tokenValidation.disabled = true
      client.auth.local = {
        jwsd: client.auth.local?.jwsd || { maxAge: 0, requiredComponents: [] }, // default needed to pass TS validation
        allowedUsers: [
          {
            userId: 'user-1',
            publicKey: pinnedPublicJWK
          }
        ],
        allowedUsersJwksUrl: null
      }
      mockClientService.findById.mockResolvedValue(client)
      const guard = new AuthorizationGuard(mockClientService, mockConfigService, mockReflector, mockLogger)

      const mockRequest = {
        headers: { 'x-client-id': 'test-client' },
        body: {},
        url: '/test',
        method: 'GET'
      }
      const context = mockExecutionContext({ request: mockRequest })

      await expect(guard.canActivate(context)).rejects.toThrow('Invalid request signature')
      expect(mockLogger.warn).toHaveBeenCalled()
    })

    it('should pass when client auth is enabled AND token validation is disabled AND jwsd is valid for allowedUsers', async () => {
      const userPrivateJwk = secp256k1PrivateKeyToJwk(FIXTURE.UNSAFE_PRIVATE_KEY.Alice)
      const userJwk = secp256k1PublicKeyToJwk(FIXTURE.VIEM_ACCOUNT.Alice.publicKey)
      const client = getBaseClient()
      client.auth.tokenValidation.disabled = true
      client.auth.local = {
        jwsd: client.auth.local?.jwsd || { maxAge: 0, requiredComponents: [] }, // default needed to pass TS validation
        allowedUsers: [
          {
            userId: 'user-1',
            publicKey: userJwk
          }
        ],
        allowedUsersJwksUrl: null
      }
      mockClientService.findById.mockResolvedValue(client)
      const guard = new AuthorizationGuard(mockClientService, mockConfigService, mockReflector, mockLogger)
      const payload = {
        value: 'test-value'
      }

      const jwsd = await getJwsd({
        userPrivateJwk,
        requestUrl: '/test',
        payload
      })

      const mockRequest = {
        headers: { 'x-client-id': 'test-client', 'detached-jws': jwsd },
        body: payload,
        url: '/test',
        method: 'POST'
      }
      const context = mockExecutionContext({ request: mockRequest })

      await expect(guard.canActivate(context)).resolves.toEqual(true)
    })

    it('should throw when token validation is enabled and missing accessToken', async () => {
      expect.assertions(2)
      const client = getBaseClient()
      mockClientService.findById.mockResolvedValue(client)
      const guard = new AuthorizationGuard(mockClientService, mockConfigService, mockReflector, mockLogger)
      const payload = {
        value: 'test-value'
      }

      const mockRequest = {
        headers: { 'x-client-id': 'test-client' },
        body: payload,
        url: '/test',
        method: 'POST'
      }
      const context = mockExecutionContext({ request: mockRequest })

      await expect(guard.canActivate(context)).rejects.toThrow(ZodError)

      const mockRequest2 = {
        headers: { 'x-client-id': 'test-client', authorization: 'bearer 0000' },
        body: payload,
        url: '/test',
        method: 'POST'
      }
      const context2 = mockExecutionContext({ request: mockRequest2 })

      await expect(guard.canActivate(context2)).rejects.toThrow(
        'Missing or invalid Access Token in Authorization header'
      )
    })

    // JWT Validation
    it('should throw when no pinnedPublicKey is configured', async () => {
      const client = getBaseClient()
      client.auth.tokenValidation.pinnedPublicKey = null
      mockClientService.findById.mockResolvedValue(client)
      const guard = new AuthorizationGuard(mockClientService, mockConfigService, mockReflector, mockLogger)
      const payload = {
        value: 'test-value'
      }

      const accessToken = await getAccessToken(payload)

      const mockRequest = {
        headers: { 'x-client-id': 'test-client', authorization: `GNAP ${accessToken}` },
        body: payload,
        url: '/test',
        method: 'POST'
      }
      const context = mockExecutionContext({ request: mockRequest })

      await expect(guard.canActivate(context)).rejects.toThrow('No engine key configured')
    })

    it('should throw when requieBoundTokens is true and token is not bound', async () => {
      const userPrivateJwk = secp256k1PrivateKeyToJwk(FIXTURE.UNSAFE_PRIVATE_KEY.Alice)
      const client = getBaseClient()
      mockClientService.findById.mockResolvedValue(client)
      const guard = new AuthorizationGuard(mockClientService, mockConfigService, mockReflector, mockLogger)
      const payload = {
        value: 'test-value'
      }

      const accessToken = await getAccessToken(payload, { sub: 'user-1' })
      const jwsd = await getJwsd({
        userPrivateJwk,
        requestUrl: '/test',
        payload,
        accessToken
      })

      const mockRequest = {
        headers: { 'x-client-id': 'test-client', authorization: `GNAP ${accessToken}`, 'detached-jws': jwsd },
        body: payload,
        url: '/test',
        method: 'POST'
      }
      const context = mockExecutionContext({ request: mockRequest })

      await expect(guard.canActivate(context)).rejects.toThrow(
        'Access Token must be bound to a key referenced in the cnf claim'
      )
    })

    it('should pass when token is bound but used by a different user', async () => {
      const userJwk = secp256k1PublicKeyToJwk(FIXTURE.VIEM_ACCOUNT.Alice.publicKey)
      const client = getBaseClient()
      mockClientService.findById.mockResolvedValue(client)
      const guard = new AuthorizationGuard(mockClientService, mockConfigService, mockReflector, mockLogger)
      const payload = {
        value: 'test-value'
      }

      const accessToken = await getAccessToken(payload, { sub: 'user-1', cnf: userJwk })
      const jwsd = await getJwsd({
        userPrivateJwk: secp256k1PrivateKeyToJwk(FIXTURE.UNSAFE_PRIVATE_KEY.Bob), // DIFFERENT user key
        requestUrl: '/test',
        payload,
        accessToken
      })

      const mockRequest = {
        headers: { 'x-client-id': 'test-client', authorization: `GNAP ${accessToken}`, 'detached-jws': jwsd },
        body: payload,
        url: '/test',
        method: 'POST'
      }
      const context = mockExecutionContext({ request: mockRequest })

      await expect(guard.canActivate(context)).rejects.toThrow('Invalid signature')
    })

    it('should pass when token is valid & request is bound with jwsd', async () => {
      const userPrivateJwk = secp256k1PrivateKeyToJwk(FIXTURE.UNSAFE_PRIVATE_KEY.Alice)
      const userJwk = secp256k1PublicKeyToJwk(FIXTURE.VIEM_ACCOUNT.Alice.publicKey)
      const client = getBaseClient()
      mockClientService.findById.mockResolvedValue(client)
      const guard = new AuthorizationGuard(mockClientService, mockConfigService, mockReflector, mockLogger)
      const payload = {
        value: 'test-value'
      }

      const accessToken = await getAccessToken(payload, { sub: 'user-1', cnf: userJwk })
      const jwsd = await getJwsd({
        userPrivateJwk,
        requestUrl: '/test',
        payload,
        accessToken
      })

      const mockRequest = {
        headers: { 'x-client-id': 'test-client', authorization: `GNAP ${accessToken}`, 'detached-jws': jwsd },
        body: payload,
        url: '/test',
        method: 'POST'
      }
      const context = mockExecutionContext({ request: mockRequest })

      await expect(guard.canActivate(context)).resolves.toEqual(true)
    })
  })
})
