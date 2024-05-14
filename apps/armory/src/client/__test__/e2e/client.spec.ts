import { ConfigModule } from '@narval/config-module'
import { getPublicKey, privateKeyToJwk } from '@narval/signature'
import { HttpStatus, INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import request from 'supertest'
import { generatePrivateKey } from 'viem/accounts'
import { load } from '../../../armory.config'
import { TestPrismaService } from '../../../shared/module/persistence/service/test-prisma.service'
import { ClientModule } from '../../client.module'
import { ClientService } from '../../core/service/client.service'

describe('Client', () => {
  let app: INestApplication
  let module: TestingModule
  let clientService: ClientService
  let testPrismaService: TestPrismaService

  const publicKey = getPublicKey(privateKeyToJwk(generatePrivateKey()))

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [load],
          isGlobal: true
        }),
        ClientModule
      ]
    }).compile()

    app = module.createNestApplication()

    clientService = module.get<ClientService>(ClientService)
    testPrismaService = module.get<TestPrismaService>(TestPrismaService)

    await app.init()
  })

  afterAll(async () => {
    await testPrismaService.truncateAll()
    await module.close()
    await app.close()
  })

  beforeEach(async () => {
    await testPrismaService.truncateAll()
  })

  describe('POST /clients', () => {
    const createClientPayload = {
      clientName: 'Acme',
      policyStorePublicKey: publicKey,
      entityStorePublicKey: publicKey
    }

    it('creates a new client with a default policy engines', async () => {
      const { status, body } = await request(app.getHttpServer()).post('/clients').send(createClientPayload)

      const actualClient = await clientService.findById(body.id)

      expect(body).toEqual({
        ...actualClient,
        createdAt: actualClient?.createdAt.toISOString(),
        updatedAt: actualClient?.updatedAt.toISOString()
      })
      expect(status).toEqual(HttpStatus.CREATED)
    })

    it('responds with bad request when payload is invalid', async () => {
      const { status } = await request(app.getHttpServer()).post('/clients').send({})

      expect(status).toEqual(HttpStatus.BAD_REQUEST)
    })

    it.todo('responds with forbidden when admin api key is missing')
    it.todo('responds with forbidden when admin api key is invalid')
    it.todo('creates a new client with given policy engines')
  })
})
