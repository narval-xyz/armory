import { FIXTURE, OrganizationEntity } from '@narval/policy-engine-shared'
import { HttpStatus, INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import request from 'supertest'
import { REQUEST_HEADER_ORG_ID } from '../../../armory.constant'
// import { TestPrismaService } from '../../../shared/module/persistence/service/test-prisma.service'
import { EntityRepository } from '../../core/repository/entity.repository'
import { StorageModule } from '../../storage.module'

const ENDPOINT = '/storage/entities'

describe('Entity Storage', () => {
  let app: INestApplication
  let module: TestingModule
  let entityRepository: EntityRepository
  // let testPrismaService: TestPrismaService

  const organization: OrganizationEntity = {
    uid: 'ac1374c2-fd62-4b6e-bd49-a4afcdcb91cc'
  }

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [StorageModule]
    }).compile()

    // testPrismaService = module.get<TestPrismaService>(TestPrismaService)

    entityRepository = module.get<EntityRepository>(EntityRepository)

    app = module.createNestApplication()

    await app.init()
  })

  afterAll(async () => {
    // await testPrismaService.truncateAll()
    await module.close()
    await app.close()
  })

  beforeEach(async () => {})

  afterEach(async () => {
    // await testPrismaService.truncateAll()
  })

  describe(`PUT ${ENDPOINT}`, () => {
    it('puts a new entities set for the organization', async () => {
      const payload = {
        entities: FIXTURE.ENTITIES
      }

      const { status, body } = await request(app.getHttpServer())
        .put(ENDPOINT)
        .set(REQUEST_HEADER_ORG_ID, organization.uid)
        .send(payload)

      console.log(payload)

      expect(body).toEqual(payload)
      expect(status).toEqual(HttpStatus.OK)
    })
  })

  describe(`GET ${ENDPOINT}`, () => {
    it('responds with the organization entities', async () => {
      await entityRepository.put(organization.uid, FIXTURE.ENTITIES)

      console.log(entityRepository)

      const { status, body } = await request(app.getHttpServer())
        .get(ENDPOINT)
        .set(REQUEST_HEADER_ORG_ID, organization.uid)

      expect(body).toEqual({
        entities: FIXTURE.ENTITIES
      })
      expect(status).toEqual(HttpStatus.OK)
    })
  })
})
