import { EncryptionModuleOptionProvider } from '@narval/encryption-module'
import { Action } from '@narval/policy-engine-shared'
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
import { ConfigModule } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { ACCOUNT, UNSAFE_PRIVATE_KEY } from 'packages/policy-engine-shared/src/lib/dev.fixture'
import request from 'supertest'
import { v4 as uuid } from 'uuid'
import { verifyMessage } from 'viem'
import { ClientModule } from '../../../client/client.module'
import { ClientService } from '../../../client/core/service/client.service'
import { load } from '../../../main.config'
import { REQUEST_HEADER_CLIENT_ID } from '../../../main.constant'
import { KeyValueRepository } from '../../../shared/module/key-value/core/repository/key-value.repository'
import { InMemoryKeyValueRepository } from '../../../shared/module/key-value/persistence/repository/in-memory-key-value.repository'
import { getTestRawAesKeyring } from '../../../shared/testing/encryption.testing'
import { Client, Wallet } from '../../../shared/type/domain.type'
import { WalletRepository } from '../../persistence/repository/wallet.repository'

describe('Sign', () => {
  let app: INestApplication
  let module: TestingModule

  const adminApiKey = 'test-admin-api-key'
  const clientId = uuid()

  const PRIVATE_KEY = '0x7cfef3303797cbc7515d9ce22ffe849c701b0f2812f999b0847229c47951fca5'
  // Engine key used to sign the approval request
  const enginePrivateJwk = secp256k1PrivateKeyToJwk(PRIVATE_KEY)
  const clientPublicJWK = secp256k1PrivateKeyToPublicJwk(PRIVATE_KEY)

  const client: Client = {
    clientId,
    clientSecret: adminApiKey,
    engineJwk: clientPublicJWK,
    createdAt: new Date(),
    updatedAt: new Date()
  }

  const wallet: Wallet = {
    id: 'eip155:eoa:0x2c4895215973CbBd778C32c456C074b99daF8Bf1',
    address: '0x2c4895215973CbBd778C32c456C074b99daF8Bf1',
    privateKey: '0x7cfef3303797cbc7515d9ce22ffe849c701b0f2812f999b0847229c47951fca5'
  }

  const defaultRequest = {
    action: 'signTransaction',
    nonce: 'random-nonce-111',
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
  }

  const getAccessToken = async (request?: unknown, opts: object = {}) => {
    const payload: Payload = {
      requestHash: hash(request || defaultRequest),
      sub: 'test-root-user-uid',
      iss: 'https://armory.narval.xyz',
      iat: Math.floor(Date.now() / 1000),
      ...opts
    }

    const signer = buildSignerEip191(PRIVATE_KEY)
    const jwt = await signJwt(payload, enginePrivateJwk, { alg: SigningAlg.EIP191 }, signer)

    return jwt
  }

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [load],
          isGlobal: true
        }),
        ClientModule
      ]
    })
      .overrideProvider(KeyValueRepository)
      .useValue(new InMemoryKeyValueRepository())
      .overrideProvider(EncryptionModuleOptionProvider)
      .useValue({
        keyring: getTestRawAesKeyring()
      })
      .overrideProvider(ClientService)
      .useValue({
        findAll: jest.fn().mockResolvedValue([client]),
        findByClientId: jest.fn().mockResolvedValue(client)
      })
      .overrideProvider(WalletRepository)
      .useValue({
        findById: jest.fn().mockResolvedValue(wallet)
      })
      .compile()

    app = module.createNestApplication({ logger: false })

    await app.init()
  })

  afterAll(async () => {
    // await testPrismaService.truncateAll()
    await module.close()
    await app.close()
  })

  describe('POST /sign', () => {
    it('has client secret guard', async () => {
      const { status } = await request(app.getHttpServer())
        .post('/sign')
        // .set(REQUEST_HEADER_CLIENT_ID, clientId)  NO CLIENT SECRET
        .send({})

      expect(status).toEqual(HttpStatus.UNPROCESSABLE_ENTITY)
    })

    it('validates nested txn data', async () => {
      // ValidationPipe & Transforms can easily be implemented incorrectly, so make sure this is running.

      const payload = {
        request: {
          action: 'signTransaction',
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
      const bodyPayload = { request: defaultRequest }

      const accessToken = await getAccessToken()

      const { status, body } = await request(app.getHttpServer())
        .post('/sign')
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set('authorization', `GNAP ${accessToken}`)
        .send(bodyPayload)

      expect(status).toEqual(HttpStatus.CREATED)

      expect(body).toEqual({
        signature:
          '0x02f875818982013d8512dbf9ea008543cb655fef82520c9404b12f0863b83c7162429f0ebb0dfda20e1aa97b865af3107a400080c080a00de78cbb96f83ef1b8d6be4d55b4046b2706c7d63ce0a815bae2b1ea4f891e6ba06f7648a9c9710b171d55e056c4abca268857f607a8a4a257d945fc44ace9f076'
      })
    })

    it('signs Message', async () => {
      const messageRequest = {
        action: Action.SIGN_MESSAGE,
        nonce: 'random-nonce-111',
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
        address: wallet.address,
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
  })

  describe('AuthorizationGuard', () => {
    it('returns error when request does not match authorized request', async () => {
      const bodyPayload = {
        request: {
          ...defaultRequest,
          nonce: defaultRequest.nonce + 'x' // CHANGE THE NONCE SO IT DOES NOT MATCH ACCESS TOKEN
        }
      }

      const accessToken = await getAccessToken(defaultRequest)

      const { status, body } = await request(app.getHttpServer())
        .post('/sign')
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set('authorization', `GNAP ${accessToken}`)
        .send(bodyPayload)

      expect(body).toEqual({
        message: 'Invalid request hash',
        statusCode: HttpStatus.FORBIDDEN,
        stack: expect.any(String),
        origin: expect.any(Object)
      })
      expect(status).toEqual(HttpStatus.FORBIDDEN)
    })

    describe('jwsd', () => {
      it('returns error when auth is client-bound but no jwsd header', async () => {
        const bodyPayload = { request: defaultRequest }

        const clientJwk = secp256k1PublicKeyToJwk(ACCOUNT.Alice.publicKey)
        const accessToken = await getAccessToken(defaultRequest, { cnf: clientJwk })

        const { status, body } = await request(app.getHttpServer())
          .post('/sign')
          .set(REQUEST_HEADER_CLIENT_ID, clientId)
          .set('authorization', `GNAP ${accessToken}`)
          .send(bodyPayload)

        expect(status).toEqual(HttpStatus.FORBIDDEN)
        expect(body.statusCode).toEqual(HttpStatus.FORBIDDEN)
        expect(body.message).toEqual(`Missing detached-jws header`)
      })

      it('verifies jwsd header in a client-bound request', async () => {
        const now = Math.floor(Date.now() / 1000)
        const bodyPayload = { request: defaultRequest }

        const clientJwk = secp256k1PublicKeyToJwk(ACCOUNT.Alice.publicKey)
        const accessToken = await getAccessToken(defaultRequest, { cnf: clientJwk })

        const jwsdSigner = buildSignerEip191(UNSAFE_PRIVATE_KEY.Alice)
        const jwsdHeader: JwsdHeader = {
          alg: SigningAlg.EIP191,
          kid: clientJwk.kid,
          typ: 'gnap-binding-jwsd',
          htm: 'POST',
          uri: 'https://armory.narval.xyz/sign',
          created: now,
          ath: hexToBase64Url(hash(accessToken))
        }
        const jwsd = await signJwsd(bodyPayload, jwsdHeader, jwsdSigner).then((jws) => {
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
          .send(bodyPayload)

        expect(body).toEqual({
          signature: expect.any(String)
        }) // no message on this response; we're asserting it so we get a nice message on why this failed if it does fail.
        expect(status).toEqual(HttpStatus.CREATED)
      })

      it('returns error when auth is client-bound to a different key', async () => {
        const now = Math.floor(Date.now() / 1000)
        const bodyPayload = { request: defaultRequest }

        const clientJwk = secp256k1PublicKeyToJwk(ACCOUNT.Alice.publicKey)
        const boundClientJwk = secp256k1PublicKeyToJwk(ACCOUNT.Bob.publicKey)
        // We bind BOB to the access token, but ALICe is the one signing the request, so she has
        // a valid access token but it's not bound to her.
        const accessToken = await getAccessToken(defaultRequest, { cnf: boundClientJwk })

        const jwsdSigner = buildSignerEip191(UNSAFE_PRIVATE_KEY.Alice)
        const jwsdHeader: JwsdHeader = {
          alg: SigningAlg.EIP191,
          kid: clientJwk.kid,
          typ: 'gnap-binding-jwsd',
          htm: 'POST',
          uri: 'https://armory.narval.xyz/sign',
          created: now,
          ath: ''
        }

        const jwsd = await signJwsd(bodyPayload, jwsdHeader, jwsdSigner).then((jws) => {
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
          .send(bodyPayload)

        expect(status).toEqual(HttpStatus.FORBIDDEN)
        expect(body.statusCode).toEqual(HttpStatus.FORBIDDEN)
        expect(body.message).toEqual('Invalid ath field in jws header')
      })
    })
  })
})
