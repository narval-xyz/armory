import { ConfigModule } from '@narval/config-module'
import { EncryptionModuleOptionProvider } from '@narval/encryption-module'
import { LoggerModule, REQUEST_HEADER_CLIENT_ID } from '@narval/nestjs-shared'
import { Action, FIXTURE } from '@narval/policy-engine-shared'
import {
  SigningAlg,
  buildSignerEip191,
  hash,
  hexToBase64Url,
  secp256k1PrivateKeyToJwk,
  secp256k1PrivateKeyToPublicJwk,
  secp256k1PublicKeyToJwk,
  signJwsd,
  signJwt,
  type JwsdHeader,
  type Payload
} from '@narval/signature'
import { HttpStatus, INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import request from 'supertest'
import { v4 as uuid } from 'uuid'
import { verifyMessage } from 'viem'
import { ClientService } from '../../../client/core/service/client.service'
import { load } from '../../../main.config'
import { KeyValueRepository } from '../../../shared/module/key-value/core/repository/key-value.repository'
import { InMemoryKeyValueRepository } from '../../../shared/module/key-value/persistence/repository/in-memory-key-value.repository'
import { TestPrismaService } from '../../../shared/module/persistence/service/test-prisma.service'
import { getTestRawAesKeyring } from '../../../shared/testing/encryption.testing'
import { Client, Origin, PrivateAccount } from '../../../shared/type/domain.type'
import { AppService } from '../../core/service/app.service'
import { AccountRepository } from '../../persistence/repository/account.repository'
import { VaultModule } from '../../vault.module'

const PRIVATE_KEY = '0x7cfef3303797cbc7515d9ce22ffe849c701b0f2812f999b0847229c47951fca5'

describe('Sign', () => {
  let app: INestApplication
  let module: TestingModule
  let testPrismaService: TestPrismaService

  const adminApiKey = 'test-admin-api-key'

  const clientId = uuid()
  const clientIdWithoutWildcard = uuid()

  // Engine key used to sign the approval request
  const enginePrivateJwk = secp256k1PrivateKeyToJwk(PRIVATE_KEY)
  const clientPublicJWK = secp256k1PrivateKeyToPublicJwk(PRIVATE_KEY)

  const client: Client = {
    clientId,
    engineJwk: clientPublicJWK,
    createdAt: new Date(),
    updatedAt: new Date(),
    allowWildcard: [
      'path.to.allow',
      'transactionRequest.maxFeePerGas',
      'transactionRequest.maxPriorityFeePerGas',
      'transactionRequest.gas'
    ]
  }

  const clientWithoutWildcard: Client = {
    clientId: clientIdWithoutWildcard,
    engineJwk: clientPublicJWK,
    createdAt: new Date(),
    updatedAt: new Date()
  }

  const account: PrivateAccount = {
    id: 'eip155:eoa:0x2c4895215973CbBd778C32c456C074b99daF8Bf1',
    address: '0x2c4895215973CbBd778C32c456C074b99daF8Bf1',
    privateKey: '0x7cfef3303797cbc7515d9ce22ffe849c701b0f2812f999b0847229c47951fca5',
    publicKey:
      '0x04b314faec9379289567598cb2ef18453543a4e1bbaf3cbadb1251c18a7b85c2660b30bb20796c0e0f70cfe1aa86d73bf1e0b42045fbe6ea4c82bbe64b753a01de',
    origin: Origin.GENERATED
  }

  const getSignTransactionRequest = (nonce?: string) => ({
    action: Action.SIGN_TRANSACTION,
    nonce: nonce || uuid(),
    transactionRequest: {
      from: '0x2c4895215973CbBd778C32c456C074b99daF8Bf1',
      to: '0x04B12F0863b83c7162429f0Ebb0DfdA20E1aA97B',
      chainId: 137,
      value: '0x5af3107a4000',
      data: '0x',
      nonce: 317,
      type: '2',
      gas: '21004',
      maxFeePerGas: '291175227375',
      maxPriorityFeePerGas: '81000000000'
    },
    resourceId: 'eip155:eoa:0x2c4895215973CbBd778C32c456C074b99daF8Bf1'
  })

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

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        LoggerModule.forTest(),
        ConfigModule.forRoot({
          load: [load],
          isGlobal: true
        }),
        VaultModule
      ]
    })
      .overrideProvider(KeyValueRepository)
      .useValue(new InMemoryKeyValueRepository())
      .overrideProvider(EncryptionModuleOptionProvider)
      .useValue({
        keyring: getTestRawAesKeyring()
      })
      .compile()

    app = module.createNestApplication({ logger: false })

    testPrismaService = module.get<TestPrismaService>(TestPrismaService)

    const appService = module.get<AppService>(AppService)
    const clientService = module.get<ClientService>(ClientService)
    const accountRepository = module.get<AccountRepository>(AccountRepository)

    await appService.save({
      id: 'test-app',
      masterKey: 'unsafe-test-master-key',
      adminApiKey
    })

    await clientService.save(client)

    await clientService.save(clientWithoutWildcard)

    await accountRepository.save(clientId, account)

    await accountRepository.save(clientIdWithoutWildcard, account)

    await testPrismaService.truncateAll()

    await app.init()
  })

  afterAll(async () => {
    await testPrismaService.truncateAll()
    await module.close()
    await app.close()
  })

  describe('POST /sign', () => {
    it('validates nested transaction data', async () => {
      const payload = {
        request: {
          action: Action.SIGN_TRANSACTION,
          nonce: 'random-nonce-111',
          transactionRequest: {
            from: '0x2c4895215973CbBd778C32c456C074b99daF8Bf1',
            to: '04B12F0863b83c7162429f0Ebb0DfdA20E1aA97B', // INVALID
            chainId: 137,
            value: '0x5af3107a4000',
            data: '0x',
            nonce: 317,
            type: '2',
            gas: '21004',
            maxFeePerGas: '291175227375',
            maxPriorityFeePerGas: '81000000000'
          },
          resourceId: 'eip155:eoa:0x2c4895215973CbBd778C32c456C074b99daF8Bf1'
        }
      }

      const accessToken = await getAccessToken(payload.request)

      const { status, body } = await request(app.getHttpServer())
        .post('/sign')
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set('authorization', `GNAP ${accessToken}`)
        .send(payload)

      expect(body).toEqual(
        expect.objectContaining({
          context: expect.any(Object),
          message: 'Internal validation error',
          statusCode: HttpStatus.UNPROCESSABLE_ENTITY
        })
      )
      expect(status).toEqual(HttpStatus.UNPROCESSABLE_ENTITY)
    })

    it('signs', async () => {
      const payload = { request: getSignTransactionRequest() }

      const accessToken = await getAccessToken(payload.request)

      const { status, body } = await request(app.getHttpServer())
        .post('/sign')
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set('authorization', `GNAP ${accessToken}`)
        .send(payload)

      expect(status).toEqual(HttpStatus.CREATED)
      expect(body).toEqual({
        signature:
          '0x02f875818982013d8512dbf9ea008543cb655fef82520c9404b12f0863b83c7162429f0ebb0dfda20e1aa97b865af3107a400080c080a00de78cbb96f83ef1b8d6be4d55b4046b2706c7d63ce0a815bae2b1ea4f891e6ba06f7648a9c9710b171d55e056c4abca268857f607a8a4a257d945fc44ace9f076'
      })
    })

    it('signs message', async () => {
      const messageRequest = {
        action: Action.SIGN_MESSAGE,
        nonce: uuid(),
        message: 'My ASCII message',
        resourceId: 'eip155:eoa:0x2c4895215973CbBd778C32c456C074b99daF8Bf1'
      }

      const accessToken = await getAccessToken(messageRequest)
      const { status, body } = await request(app.getHttpServer())
        .post('/sign')
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set('authorization', `GNAP ${accessToken}`)
        .send({ request: messageRequest })

      const isVerified = await verifyMessage({
        address: account.address,
        message: messageRequest.message,
        signature: body.signature
      })

      expect(body).toEqual({
        signature:
          '0x65071b7126abd24fe6b8fa396529e21d22448d23ff1a6c5a0e043a4f641cd11b2a21958127d1b91db4d991f8b33ad6b201637799a95eadbe3a7cf5cee26bd9521b'
      })
      expect(status).toEqual(HttpStatus.CREATED)
      expect(isVerified).toEqual(true)
    })

    it('returns error when nonce is used twice', async () => {
      const messageRequest = {
        action: Action.SIGN_MESSAGE,
        nonce: 'random-nonce-111',
        message: 'My ASCII message',
        resourceId: 'eip155:eoa:0x2c4895215973CbBd778C32c456C074b99daF8Bf1'
      }

      const accessToken = await getAccessToken(messageRequest)

      await request(app.getHttpServer())
        .post('/sign')
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set('authorization', `GNAP ${accessToken}`)
        .send({ request: messageRequest })

      const { status, body } = await request(app.getHttpServer())
        .post('/sign')
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set('authorization', `GNAP ${accessToken}`)
        .send({ request: messageRequest })

      expect(body).toMatchObject({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Nonce already used',
        context: {
          clientId,
          nonce: messageRequest.nonce
        },
        stack: expect.any(String)
      })
      expect(status).toEqual(HttpStatus.FORBIDDEN)
    })
  })

  describe('authorization', () => {
    it('returns error when request does not match authorized request', async () => {
      const payload = getSignTransactionRequest()
      const tamperedPayload = {
        request: {
          ...payload,
          nonce: payload.nonce + 'x'
        }
      }

      const accessToken = await getAccessToken(payload)

      const { status, body } = await request(app.getHttpServer())
        .post('/sign')
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set('authorization', `GNAP ${accessToken}`)
        .send(tamperedPayload)

      expect(body).toEqual({
        message: 'Invalid request hash',
        statusCode: HttpStatus.FORBIDDEN,
        stack: expect.any(String),
        origin: expect.any(Object)
      })
      expect(status).toEqual(HttpStatus.FORBIDDEN)
    })

    it('validates a request with wildcard path configured', async () => {
      const payload = { request: getSignTransactionRequest() }
      const { request: requestWithGas } = payload

      const requestWithoutGas = {
        ...requestWithGas,
        transactionRequest: {
          ...requestWithGas.transactionRequest,
          gas: undefined,
          maxFeePerGas: undefined,
          maxPriorityFeePerGas: undefined
        }
      }

      // Auth Server signs a token with some fields wildcarded
      const accessToken = await getAccessToken(requestWithoutGas, {
        hashWildcard: [
          'transactionRequest.gas',
          'transactionRequest.maxFeePerGas',
          'transactionRequest.maxPriorityFeePerGas'
        ]
      })

      // Vault receives the request with the actual values, and the accessToken that signed the partial transaction saying which fields are wildcarded
      const { status } = await request(app.getHttpServer())
        .post('/sign')
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set('authorization', `GNAP ${accessToken}`)
        .send(payload)

      // Client was configured to allow wildcarding of these fields, so the request is valid
      expect(status).toEqual(HttpStatus.CREATED)
    })

    it('returns unauthorized if no wildcard paths are configured', async () => {
      const payload = { request: getSignTransactionRequest() }
      const { request: requestWithGas } = payload

      const requestWithoutGas = {
        ...requestWithGas,
        transactionRequest: {
          ...requestWithGas.transactionRequest,
          gas: undefined,
          maxFeePerGas: undefined,
          maxPriorityFeePerGas: undefined
        }
      }

      // Auth Server signs a token with some fields wildcarded
      const accessToken = await getAccessToken(requestWithoutGas)

      // Vault receives the request with the actual values, and the accessToken that signed the partial transaction saying which fields are wildcarded
      const { status, body } = await request(app.getHttpServer())
        .post('/sign')
        .set(REQUEST_HEADER_CLIENT_ID, clientIdWithoutWildcard)
        .set('authorization', `GNAP ${accessToken}`)
        .send(payload)

      // Client was not configured to allow wildcarding of these fields, so the request is invalid
      expect(status).toEqual(HttpStatus.FORBIDDEN)
      expect(body).toEqual({
        message: 'Invalid request hash',
        statusCode: HttpStatus.FORBIDDEN,
        stack: expect.any(String),
        origin: expect.any(Object)
      })
    })
    describe('jwsd', () => {
      it('returns error when auth is client-bound but no jwsd header', async () => {
        const payload = { request: getSignTransactionRequest() }

        const clientJwk = secp256k1PublicKeyToJwk(FIXTURE.VIEM_ACCOUNT.Alice.publicKey)
        const accessToken = await getAccessToken(payload.request, { cnf: clientJwk })

        const { status, body } = await request(app.getHttpServer())
          .post('/sign')
          .set(REQUEST_HEADER_CLIENT_ID, clientId)
          .set('authorization', `GNAP ${accessToken}`)
          .send(payload)

        expect(status).toEqual(HttpStatus.FORBIDDEN)
        expect(body.statusCode).toEqual(HttpStatus.FORBIDDEN)
        expect(body.message).toEqual(`Missing detached-jws header`)
      })

      it('verifies jwsd header in a client-bound request', async () => {
        const now = Math.floor(Date.now() / 1000)
        const payload = { request: getSignTransactionRequest() }

        const clientJwk = secp256k1PublicKeyToJwk(FIXTURE.VIEM_ACCOUNT.Alice.publicKey)
        const accessToken = await getAccessToken(payload.request, { cnf: clientJwk })

        const jwsdSigner = buildSignerEip191(FIXTURE.UNSAFE_PRIVATE_KEY.Alice)
        const jwsdHeader: JwsdHeader = {
          alg: SigningAlg.EIP191,
          kid: clientJwk.kid,
          typ: 'gnap-binding-jwsd',
          htm: 'POST',
          uri: 'https://vault-test.narval.xyz/sign',
          created: now,
          ath: hexToBase64Url(hash(accessToken))
        }
        const jwsd = await signJwsd(payload, jwsdHeader, jwsdSigner).then((jws) => {
          // Strip out the middle part for size
          const parts = jws.split('.')
          parts[1] = ''
          return parts.join('.')
        })

        const { status, body } = await request(app.getHttpServer())
          .post('/sign')
          .set(REQUEST_HEADER_CLIENT_ID, clientId)
          .set('authorization', `GNAP ${accessToken}`)
          .set('detached-jws', jwsd)
          .send(payload)

        expect(body).toEqual({
          signature: expect.any(String)
        }) // no message on this response; we're asserting it so we get a nice message on why this failed if it does fail.
        expect(status).toEqual(HttpStatus.CREATED)
      })

      it('returns error when auth is client-bound to a different key', async () => {
        const now = Math.floor(Date.now() / 1000)
        const payload = { request: getSignTransactionRequest() }

        const clientJwk = secp256k1PublicKeyToJwk(FIXTURE.VIEM_ACCOUNT.Alice.publicKey)
        const boundClientJwk = secp256k1PublicKeyToJwk(FIXTURE.VIEM_ACCOUNT.Bob.publicKey)
        // We bind BOB to the access token, but ALICe is the one signing the request, so she has
        // a valid access token but it's not bound to her.
        const accessToken = await getAccessToken(payload.request, { cnf: boundClientJwk })

        const jwsdSigner = buildSignerEip191(FIXTURE.UNSAFE_PRIVATE_KEY.Alice)
        const jwsdHeader: JwsdHeader = {
          alg: SigningAlg.EIP191,
          kid: clientJwk.kid,
          typ: 'gnap-binding-jwsd',
          htm: 'POST',
          uri: 'https://vault-test.narval.xyz/sign',
          created: now,
          ath: ''
        }

        const jwsd = await signJwsd(payload, jwsdHeader, jwsdSigner).then((jws) => {
          // Strip out the middle part for size
          const parts = jws.split('.')
          parts[1] = ''
          return parts.join('.')
        })

        const { status, body } = await request(app.getHttpServer())
          .post('/sign')
          .set(REQUEST_HEADER_CLIENT_ID, clientId)
          .set('authorization', `GNAP ${accessToken}`)
          .set('detached-jws', jwsd)
          .send(payload)

        expect(status).toEqual(HttpStatus.FORBIDDEN)
        expect(body.statusCode).toEqual(HttpStatus.FORBIDDEN)
        expect(body.message).toEqual('Invalid ath field in jws header')
      })
    })
  })
})
