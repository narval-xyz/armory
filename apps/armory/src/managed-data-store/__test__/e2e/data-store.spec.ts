import { ConfigModule } from '@narval/config-module'
import {
  LoggerModule,
  OpenTelemetryModule,
  REQUEST_HEADER_CLIENT_ID,
  REQUEST_HEADER_CLIENT_SECRET,
  secret
} from '@narval/nestjs-shared'
import {
  Criterion,
  Entities,
  EntityStore,
  EntityUtil,
  Policy,
  PolicyStore,
  Then,
  UserRole
} from '@narval/policy-engine-shared'
import { Jwk, SigningAlg, getPublicKey, hash, privateKeyToJwk, signJwt } from '@narval/signature'
import { HttpStatus, INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { MockProxy, mock } from 'jest-mock-extended'
import request from 'supertest'
import { generatePrivateKey } from 'viem/accounts'
import { load } from '../../../armory.config'
import { ClientService } from '../../../client/core/service/client.service'
import { ClusterService } from '../../../policy-engine/core/service/cluster.service'
import { TestPrismaService } from '../../../shared/module/persistence/service/test-prisma.service'
import { SetEntityStoreDto } from '../../http/rest/dto/set-entity-store.dto'
import { SetPolicyStoreDto } from '../../http/rest/dto/set-policy-store.dto'
import { ManagedDataStoreModule } from '../../managed-data-store.module'
import { EntityDataStoreRepository } from '../../persistence/repository/entity-data-store.repository'
import { PolicyDataStoreRepository } from '../../persistence/repository/policy-data-store.repository'

describe('Data Store', () => {
  let app: INestApplication
  let module: TestingModule
  let testPrismaService: TestPrismaService
  let policyDataStoreRepository: PolicyDataStoreRepository
  let entityDataStoreRepository: EntityDataStoreRepository
  let clientService: MockProxy<ClientService>
  let clusterService: MockProxy<ClusterService>

  const clientSecret = 'test-client-secret'

  const dataSecret = 'test-data-secret'

  const clientId = 'test-client-id'

  const dataStorePrivateKey = privateKeyToJwk(generatePrivateKey())

  const policyEnginePrivateKey = privateKeyToJwk(generatePrivateKey())

  const signData = (clientId: string, data: unknown, privateKey: Jwk) =>
    signJwt(
      {
        sub: privateKey.kid,
        iss: clientId,
        data: hash(data),
        iat: new Date().getTime()
      },
      privateKey,
      { alg: SigningAlg.ES256K }
    )

  const buildPolicyStore = async (clientId: string, privateKey: Jwk): Promise<PolicyStore> => {
    const policies: Policy[] = [
      {
        id: 'test-permit-policy',
        description: 'test permit policy',
        when: [
          {
            criterion: Criterion.CHECK_PRINCIPAL_ROLE,
            args: [UserRole.ADMIN]
          }
        ],
        then: Then.PERMIT
      }
    ]

    return {
      data: policies,
      signature: await signData(clientId, policies, privateKey)
    }
  }

  const buildEntityStore = async (clientId: string, privateKey: Jwk): Promise<EntityStore> => {
    const entities: Entities = {
      ...EntityUtil.empty(),
      users: [
        {
          id: 'test-user-id',
          role: UserRole.ROOT
        }
      ]
    }

    return {
      data: entities,
      signature: await signData(clientId, entities, privateKey)
    }
  }

  beforeAll(async () => {
    clientService = mock<ClientService>()

    clientService.findById.mockResolvedValue({
      id: clientId,
      clientSecret: secret.hash(clientSecret),
      dataSecret: secret.hash(dataSecret),
      name: 'Test client',
      createdAt: new Date(),
      updatedAt: new Date(),
      dataStore: {
        entityPublicKeys: [getPublicKey(dataStorePrivateKey)],
        policyPublicKeys: [getPublicKey(dataStorePrivateKey)]
      },
      policyEngine: {
        nodes: [
          {
            id: 'test-node',
            clientId,
            clientSecret: 'test-node-secret',
            publicKey: getPublicKey(policyEnginePrivateKey),
            url: 'http://mock.test/policy-engine'
          }
        ]
      }
    })

    clusterService = mock<ClusterService>()

    clusterService.sync.mockResolvedValue(true)

    module = await Test.createTestingModule({
      imports: [
        LoggerModule.forTest(),
        ConfigModule.forRoot({
          load: [load],
          isGlobal: true
        }),
        OpenTelemetryModule.forTest(),
        ManagedDataStoreModule
      ]
    })
      .overrideProvider(ClientService)
      .useValue(clientService)
      .overrideProvider(ClusterService)
      .useValue(clusterService)
      .compile()

    app = module.createNestApplication()

    testPrismaService = module.get<TestPrismaService>(TestPrismaService)
    policyDataStoreRepository = module.get<PolicyDataStoreRepository>(PolicyDataStoreRepository)
    entityDataStoreRepository = module.get<EntityDataStoreRepository>(EntityDataStoreRepository)

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

  describe('GET /data/policies', () => {
    it('responds with empty policy store it does not exist yet', async () => {
      const { body, status } = await request(app.getHttpServer())
        .get('/data/policies')
        .query({ clientId, dataSecret })
        .send()

      expect(body).toEqual({
        policy: {
          data: [
            {
              id: 'admins-full-access',
              description: 'Admins get full access',
              when: [
                {
                  criterion: Criterion.CHECK_PRINCIPAL_ROLE,
                  args: [UserRole.ADMIN]
                }
              ],
              then: Then.PERMIT
            }
          ],
          signature: ''
        }
      })
      expect(status).toEqual(HttpStatus.OK)
    })

    it('responds with policy store when it exists, with dataSecret', async () => {
      const dataStore = await buildPolicyStore(clientId, dataStorePrivateKey)

      await policyDataStoreRepository.setDataStore(clientId, {
        version: 1,
        data: dataStore
      })

      const { body, status } = await request(app.getHttpServer())
        .get('/data/policies')
        .query({ clientId, dataSecret })
        .send()

      expect(body).toEqual({ policy: dataStore })
      expect(status).toEqual(HttpStatus.OK)
    })

    it('responds with policy store when it exists, with clientSecret', async () => {
      const dataStore = await buildPolicyStore(clientId, dataStorePrivateKey)

      await policyDataStoreRepository.setDataStore(clientId, {
        version: 1,
        data: dataStore
      })

      const { body, status } = await request(app.getHttpServer())
        .get('/data/policies')
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set(REQUEST_HEADER_CLIENT_SECRET, clientSecret)
        .send()

      expect(body).toEqual({ policy: dataStore })
      expect(status).toEqual(HttpStatus.OK)
    })
  })

  describe('POST /data/policies', () => {
    it('responds set policy store', async () => {
      const policy: SetPolicyStoreDto = await buildPolicyStore(clientId, dataStorePrivateKey)

      const { body, status } = await request(app.getHttpServer())
        .post('/data/policies')
        .query({ clientId })
        .send(policy)

      expect(body).toEqual({
        policy,
        version: 1,
        latestSync: {
          success: true
        }
      })
      expect(status).toEqual(HttpStatus.CREATED)
    })

    it('syncs the client policy engine nodes', async () => {
      const policy: SetPolicyStoreDto = await buildPolicyStore(clientId, dataStorePrivateKey)

      await request(app.getHttpServer()).post('/data/policies').query({ clientId }).send({ policy })

      expect(clusterService.sync).toHaveBeenCalledWith(clientId)
    })
  })

  describe('GET /data/entities', () => {
    it('responds with empty entity store when it does not exist yet', async () => {
      const { body, status } = await request(app.getHttpServer())
        .get('/data/entities')
        .query({ clientId, dataSecret })
        .send()

      expect(body).toEqual({
        entity: {
          data: EntityUtil.empty(),
          signature: ''
        }
      })
      expect(status).toEqual(HttpStatus.OK)
    })

    it('responds with policy data store when it exists, with dataSecret', async () => {
      const dataStore = await buildEntityStore(clientId, dataStorePrivateKey)

      await entityDataStoreRepository.setDataStore(clientId, {
        version: 1,
        data: dataStore
      })

      const { body, status } = await request(app.getHttpServer())
        .get('/data/entities')
        .query({ clientId, dataSecret })
        .send()

      expect(body).toEqual({ entity: dataStore })
      expect(status).toEqual(HttpStatus.OK)
    })

    it('responds with policy data store when it exists, with clientSecret', async () => {
      const dataStore = await buildEntityStore(clientId, dataStorePrivateKey)

      await entityDataStoreRepository.setDataStore(clientId, {
        version: 1,
        data: dataStore
      })

      const { body, status } = await request(app.getHttpServer())
        .get('/data/entities')
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set(REQUEST_HEADER_CLIENT_SECRET, clientSecret)
        .send()

      expect(body).toEqual({ entity: dataStore })
      expect(status).toEqual(HttpStatus.OK)
    })
  })

  describe('POST /data/entities', () => {
    it('responds set entity store', async () => {
      const entity: SetEntityStoreDto = await buildEntityStore(clientId, dataStorePrivateKey)

      const { body, status } = await request(app.getHttpServer())
        .post('/data/entities')
        .query({ clientId })
        .send(entity)

      expect(body).toEqual({
        entity,
        version: 1,
        latestSync: {
          success: true
        }
      })
      expect(status).toEqual(HttpStatus.CREATED)
    })

    it('syncs the client policy engine nodes', async () => {
      const entity: SetEntityStoreDto = await buildEntityStore(clientId, dataStorePrivateKey)

      await request(app.getHttpServer()).post('/data/entities').query({ clientId }).send({ entity })

      expect(clusterService.sync).toHaveBeenCalledWith(clientId)
    })
  })

  describe('POST /data/sync', () => {
    it('calls the client data store sync', async () => {
      const { status } = await request(app.getHttpServer())
        .post('/data/sync')
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set(REQUEST_HEADER_CLIENT_SECRET, clientSecret)
        .send()

      expect(status).toEqual(HttpStatus.OK)
    })
  })
})
