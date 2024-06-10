import { ConfigModule } from '@narval/config-module'
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
      clientSecret: 'test-client-secret',
      name: 'Test client',
      createdAt: new Date(),
      updatedAt: new Date(),
      dataStore: {
        entityPublicKey: getPublicKey(dataStorePrivateKey),
        policyPublicKey: getPublicKey(dataStorePrivateKey)
      },
      policyEngine: {
        nodes: [
          {
            id: 'test-node',
            clientId,
            clientSecret: 'test-client-secret',
            publicKey: getPublicKey(policyEnginePrivateKey),
            url: 'http://mock.test/policy-engine'
          }
        ]
      }
    })

    clusterService = mock<ClusterService>()

    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [load],
          isGlobal: true
        }),
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
    it('responds with empty policy store when client does not exist', async () => {
      const { body, status } = await request(app.getHttpServer())
        .get('/data/policies')
        .query({ clientId: 'does-not-exist' })
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

    it('responds with policy store when client exists', async () => {
      const dataStore = await buildPolicyStore(clientId, dataStorePrivateKey)

      await policyDataStoreRepository.setDataStore(clientId, {
        version: 1,
        data: dataStore
      })

      const { body, status } = await request(app.getHttpServer()).get('/data/policies').query({ clientId }).send()

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
        .send({ policy })

      expect(body).toEqual({
        clientId,
        version: 1,
        data: policy,
        id: expect.any(String),
        createdAt: expect.any(String)
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
    it('responds with empty entity store when client does not exist', async () => {
      const { body, status } = await request(app.getHttpServer())
        .get('/data/entities')
        .query({ clientId: 'does-not-exist' })
        .send()

      expect(body).toEqual({
        entity: {
          data: EntityUtil.empty(),
          signature: ''
        }
      })
      expect(status).toEqual(HttpStatus.OK)
    })

    it('responds with policy data store when client exists', async () => {
      const dataStore = await buildEntityStore(clientId, dataStorePrivateKey)

      await entityDataStoreRepository.setDataStore(clientId, {
        version: 1,
        data: dataStore
      })

      const { body, status } = await request(app.getHttpServer()).get('/data/entities').query({ clientId }).send()

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
        .send({ entity })

      expect(body).toEqual({
        clientId,
        version: 1,
        data: entity,
        id: expect.any(String),
        createdAt: expect.any(String)
      })
      expect(status).toEqual(HttpStatus.CREATED)
    })

    it('syncs the client policy engine nodes', async () => {
      const entity: SetEntityStoreDto = await buildEntityStore(clientId, dataStorePrivateKey)

      await request(app.getHttpServer()).post('/data/entities').query({ clientId }).send({ entity })

      expect(clusterService.sync).toHaveBeenCalledWith(clientId)
    })
  })
})
