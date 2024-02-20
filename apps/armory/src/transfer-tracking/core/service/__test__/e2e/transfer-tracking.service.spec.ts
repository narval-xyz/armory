import { INestApplication } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { first, map, mapValues, omit, uniq } from 'lodash/fp'
import { generateTransfer } from '../../../../../__test__/fixture/transfer-tracking.fixture'
import { load } from '../../../../../orchestration.config'
import { Transfer } from '../../../../../shared/core/type/transfer-tracking.type'
import { PersistenceModule } from '../../../../../shared/module/persistence/persistence.module'
import { TestPrismaService } from '../../../../../shared/module/persistence/service/test-prisma.service'
import { QueueModule } from '../../../../../shared/module/queue/queue.module'
import { TransferTrackingService } from '../../../../core/service/transfer-tracking.service'
import { TransferTrackingModule } from '../../../../transfer-tracking.module'

describe(TransferTrackingService.name, () => {
  let app: INestApplication
  let module: TestingModule
  let testPrismaService: TestPrismaService
  let service: TransferTrackingService

  const transfer: Transfer = generateTransfer()

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [load],
          isGlobal: true
        }),
        QueueModule.forRoot(),
        PersistenceModule,
        TransferTrackingModule
      ]
    }).compile()

    testPrismaService = module.get<TestPrismaService>(TestPrismaService)
    service = module.get<TransferTrackingService>(TransferTrackingService)

    app = module.createNestApplication()

    await app.init()
  })

  afterAll(async () => {
    await testPrismaService.truncateAll()
    await module.close()
    await app.close()
  })

  afterEach(async () => {
    await testPrismaService.truncateAll()
  })

  describe('track', () => {
    it('creates a new approved transfer', async () => {
      await service.track(transfer)

      const models = await testPrismaService.getClient().approvedTransfer.findMany()

      expect(models.length).toEqual(1)
      expect(first(models)).toEqual({
        ...transfer,
        amount: transfer.amount.toString(),
        rates: mapValues((value) => value.toString(), transfer.rates)
      })
    })

    it('decodes created transfer', async () => {
      const createdTransfer = await service.track(transfer)

      expect(createdTransfer).toEqual(transfer)
    })
  })

  describe('findByOrgId', () => {
    const orgA = 'be382fa4-59e1-4622-ae5e-78ba4287a060'
    const orgB = '908d0299-dab2-4adc-a603-9508b4a84e8d'

    beforeEach(async () => {
      await Promise.all([
        service.track({
          ...transfer,
          id: '2f68d6e1-f76c-44c8-a86f-e57c8352cf93',
          orgId: orgA
        }),
        service.track({
          ...transfer,
          id: '6deafaf3-13fe-4817-ac7e-589dfc097aa0',
          orgId: orgA
        }),
        service.track({
          ...transfer,
          id: 'b2100c63-3ee3-4044-b3da-169a3fc43d52',
          orgId: orgB
        })
      ])
    })

    it('finds org transfers', async () => {
      const transfers = await service.findByOrgId(orgA)

      expect(transfers.length).toEqual(2)
      expect(uniq(map('orgId', transfers))).toEqual([orgA])
      expect(first(transfers)).toMatchObject(omit(['id', 'orgId'], transfer))
    })

    it('decodes transfers', async () => {
      const transfers = await service.findByOrgId(orgA)

      expect(first(transfers)).toMatchObject(omit(['id', 'orgId'], transfer))
    })
  })
})
