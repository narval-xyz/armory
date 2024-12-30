import { EncryptionModuleOptionProvider } from '@narval/encryption-module'
import { LoggerModule, REQUEST_HEADER_CLIENT_ID } from '@narval/nestjs-shared'
import { Ed25519PrivateKey, getPublicKey } from '@narval/signature'
import { HttpStatus, INestApplication } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { Test, TestingModule } from '@nestjs/testing'
import { mock } from 'jest-mock-extended'
import { HttpResponse, http } from 'msw'
import request from 'supertest'
import { v4 as uuid } from 'uuid'
import { ClientService } from '../../../client/core/service/client.service'
import { MainModule } from '../../../main.module'
import { ProvisionService } from '../../../provision.service'
import { KeyValueRepository } from '../../../shared/module/key-value/core/repository/key-value.repository'
import { InMemoryKeyValueRepository } from '../../../shared/module/key-value/persistence/repository/in-memory-key-value.repository'
import { TestPrismaService } from '../../../shared/module/persistence/service/test-prisma.service'
import { getTestRawAesKeyring } from '../../../shared/testing/encryption.testing'
import postAnchorageTransferBadRequest from '../../core/provider/anchorage/__test__/server-mock/response/post-transfer-400.json'
import { ANCHORAGE_TEST_API_BASE_URL, getHandlers } from '../../core/provider/anchorage/__test__/server-mock/server'
import { ActiveConnectionWithCredentials, ConnectionStatus, Provider } from '../../core/type/connection.type'
import { Account, Wallet } from '../../core/type/indexed-resources.type'
import {
  InternalTransfer,
  NetworkFeeAttribution,
  TransferPartyType,
  TransferStatus
} from '../../core/type/transfer.type'
import { AccountRepository } from '../../persistence/repository/account.repository'
import { ConnectionRepository } from '../../persistence/repository/connection.repository'
import { TransferRepository } from '../../persistence/repository/transfer.repository'
import { WalletRepository } from '../../persistence/repository/wallet.repository'
import { setupMockServer } from '../../shared/__test__/mock-server'
import { getJwsd, testClient, testUserPrivateJwk } from '../util/mock-data'

const ENDPOINT = '/provider/transfers'

describe('Transfer', () => {
  let app: INestApplication
  let module: TestingModule
  let testPrismaService: TestPrismaService
  let provisionService: ProvisionService
  let clientService: ClientService

  let transferRepository: TransferRepository
  let connectionRepository: ConnectionRepository
  let accountRepository: AccountRepository
  let walletRepository: WalletRepository

  const clientId = testClient.clientId

  const externalId = '008d3ec72558ce907571886df63ef51594b5bd8cf106a0b7fa8f12a30dfc867f'

  const walletId = uuid()

  const eddsaPrivateKey: Ed25519PrivateKey = {
    kty: 'OKP',
    crv: 'Ed25519',
    alg: 'EDDSA',
    kid: '0xa6fe705025aa4c48abbb3a1ed679d7dc7d18e7994b4d5cb1884479fddeb2e706',
    x: 'U4WSOMzD7gor6jiVz42jT22JGBcfGfzMomt8PFC_-_U',
    d: 'evo-fY2BX60V1n3Z690LadH5BvizcM9bESaYk0LsxyQ'
  }

  const connection: ActiveConnectionWithCredentials = {
    clientId,
    connectionId: uuid(),
    createdAt: new Date(),
    provider: Provider.ANCHORAGE,
    status: ConnectionStatus.ACTIVE,
    updatedAt: new Date(),
    url: ANCHORAGE_TEST_API_BASE_URL,
    credentials: {
      privateKey: eddsaPrivateKey,
      publicKey: getPublicKey(eddsaPrivateKey),
      apiKey: 'test-api-key'
    }
  }

  const accountOne: Account = {
    accountId: uuid(),
    addresses: [],
    clientId,
    createdAt: new Date(),
    externalId: uuid(),
    label: 'Account 1',
    networkId: 'BTC',
    provider: Provider.ANCHORAGE,
    updatedAt: new Date(),
    walletId
  }

  const accountTwo: Account = {
    accountId: uuid(),
    addresses: [],
    clientId,
    createdAt: new Date(),
    externalId: uuid(),
    label: 'Account 2',
    networkId: 'BTC',
    provider: Provider.ANCHORAGE,
    updatedAt: new Date(),
    walletId
  }

  const wallet: Wallet = {
    clientId,
    connections: [connection],
    createdAt: new Date(),
    externalId: uuid(),
    label: null,
    provider: Provider.ANCHORAGE,
    updatedAt: new Date(),
    walletId
  }

  const internalTransfer: InternalTransfer = {
    clientId,
    assetId: 'BTC',
    createdAt: new Date(),
    customerRefId: null,
    destination: {
      type: TransferPartyType.ACCOUNT,
      id: accountTwo.accountId
    },
    externalId: uuid(),
    grossAmount: '0.00001',
    idempotenceId: null,
    memo: 'Test transfer',
    networkFeeAttribution: NetworkFeeAttribution.DEDUCT,
    provider: Provider.ANCHORAGE,
    source: {
      type: TransferPartyType.ACCOUNT,
      id: accountOne.accountId
    },
    status: TransferStatus.SUCCESS,
    transferId: uuid()
  }

  const mockServer = setupMockServer(getHandlers())

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [MainModule]
    })
      .overrideModule(LoggerModule)
      .useModule(LoggerModule.forTest())
      .overrideProvider(KeyValueRepository)
      .useValue(new InMemoryKeyValueRepository())
      .overrideProvider(EncryptionModuleOptionProvider)
      .useValue({
        keyring: getTestRawAesKeyring()
      })
      // Mock the event emitter because we don't want to send a
      // connection.activated event after the creation.
      .overrideProvider(EventEmitter2)
      .useValue(mock<EventEmitter2>())
      .compile()

    app = module.createNestApplication()

    testPrismaService = module.get(TestPrismaService)
    provisionService = module.get<ProvisionService>(ProvisionService)
    clientService = module.get<ClientService>(ClientService)

    transferRepository = module.get(TransferRepository)
    connectionRepository = module.get(ConnectionRepository)
    walletRepository = module.get(WalletRepository)
    accountRepository = module.get(AccountRepository)

    await testPrismaService.truncateAll()
  })

  afterAll(async () => {
    await testPrismaService.truncateAll()
    await module.close()
    await app.close()
  })

  beforeEach(async () => {
    await testPrismaService.truncateAll()

    await provisionService.provision()
    await clientService.save(testClient)

    await connectionRepository.create(connection)
    await walletRepository.bulkCreate([wallet])
    await accountRepository.bulkCreate([accountOne, accountTwo])
    await transferRepository.bulkCreate([internalTransfer])

    await app.init()
  })

  describe(`POST ${ENDPOINT}`, () => {
    const requiredPayload = {
      source: {
        type: TransferPartyType.ACCOUNT,
        id: accountOne.accountId
      },
      destination: {
        type: TransferPartyType.ACCOUNT,
        id: accountTwo.accountId
      },
      amount: '0.0001',
      assetId: 'BTC_S'
    }

    it('sends transfer to anchorage', async () => {
      const { status, body } = await request(app.getHttpServer())
        .post(ENDPOINT)
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set(
          'detached-jws',
          await getJwsd({
            payload: requiredPayload,
            userPrivateJwk: testUserPrivateJwk,
            requestUrl: ENDPOINT,
            htm: 'POST'
          })
        )
        .send(requiredPayload)

      expect(body).toEqual({
        data: {
          clientId,
          externalId,
          assetId: requiredPayload.assetId,
          createdAt: expect.any(String),
          customerRefId: null,
          destination: requiredPayload.destination,
          grossAmount: requiredPayload.amount,
          idempotenceId: null,
          memo: null,
          networkFeeAttribution: NetworkFeeAttribution.ON_TOP,
          provider: accountOne.provider,
          providerSpecific: null,
          source: requiredPayload.source,
          status: TransferStatus.PROCESSING,
          transferId: expect.any(String)
        }
      })

      expect(status).toEqual(HttpStatus.CREATED)
    })

    it('sends transfer with optional properties', async () => {
      const payload = {
        ...requiredPayload,
        memo: 'Test transfer',
        networkFeeAttribution: NetworkFeeAttribution.DEDUCT,
        customerRefId: uuid(),
        idempotenceId: uuid()
      }

      const { body } = await request(app.getHttpServer())
        .post(ENDPOINT)
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set(
          'detached-jws',
          await getJwsd({
            payload,
            userPrivateJwk: testUserPrivateJwk,
            requestUrl: ENDPOINT,
            htm: 'POST'
          })
        )
        .send(payload)

      const actualTransfer = await transferRepository.findById(clientId, body.data.transferId)

      expect(actualTransfer.memo).toEqual(payload.memo)
      expect(body.data.memo).toEqual(payload.memo)

      expect(actualTransfer.networkFeeAttribution).toEqual(payload.networkFeeAttribution)
      expect(body.data.networkFeeAttribution).toEqual(payload.networkFeeAttribution)

      expect(actualTransfer.customerRefId).toEqual(payload.customerRefId)
      expect(body.data.customerRefId).toEqual(payload.customerRefId)

      expect(actualTransfer.idempotenceId).toEqual(payload.idempotenceId)
      expect(body.data.idempotenceId).toEqual(payload.idempotenceId)
    })

    it('propagates provider http errors', async () => {
      mockServer.use(
        http.post(`${ANCHORAGE_TEST_API_BASE_URL}/v2/transfers`, () => {
          return new HttpResponse(JSON.stringify(postAnchorageTransferBadRequest), {
            status: HttpStatus.BAD_REQUEST
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as unknown as any)
        })
      )

      const { status, body } = await request(app.getHttpServer())
        .post(ENDPOINT)
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set(
          'detached-jws',
          await getJwsd({
            payload: requiredPayload,
            userPrivateJwk: testUserPrivateJwk,
            requestUrl: ENDPOINT,
            htm: 'POST'
          })
        )
        .send(requiredPayload)

      expect(body).toMatchObject({
        statusCode: 400,
        message: 'Provider ANCHORAGE responded with 400 error',
        context: {
          provider: 'anchorage',
          error: {
            errorType: 'InternalError',
            message: "Missing required field 'amount'."
          }
        }
      })

      expect(status).toEqual(HttpStatus.BAD_REQUEST)
    })
  })

  describe(`GET ${ENDPOINT}/:transferId`, () => {
    const transfer = {
      assetId: 'BTC',
      clientId: connection.clientId,
      createdAt: new Date(),
      customerRefId: uuid(),
      destination: {
        type: TransferPartyType.ACCOUNT,
        id: accountTwo.accountId
      },
      externalId: uuid(),
      grossAmount: '0.1',
      idempotenceId: uuid(),
      memo: 'Test transfer',
      networkFeeAttribution: NetworkFeeAttribution.DEDUCT,
      provider: Provider.ANCHORAGE,
      providerSpecific: null,
      source: {
        type: TransferPartyType.ACCOUNT,
        id: accountOne.accountId
      },
      status: TransferStatus.PROCESSING,
      transferId: uuid()
    }

    beforeEach(async () => {
      await transferRepository.bulkCreate([transfer])
    })

    it('responds with the specific transfer', async () => {
      const { status, body } = await request(app.getHttpServer())
        .get(`${ENDPOINT}/${transfer.transferId}`)
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set(
          'detached-jws',
          await getJwsd({
            payload: {},
            userPrivateJwk: testUserPrivateJwk,
            requestUrl: `${ENDPOINT}/${transfer.transferId}`,
            htm: 'GET'
          })
        )
        .send()

      expect(body).toEqual({
        data: {
          ...transfer,
          createdAt: transfer.createdAt.toISOString()
        }
      })

      expect(status).toEqual(HttpStatus.OK)
    })
  })
})
