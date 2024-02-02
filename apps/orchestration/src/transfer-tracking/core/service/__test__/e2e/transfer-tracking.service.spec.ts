import { load } from '@app/orchestration/orchestration.config'
import { Transfer } from '@app/orchestration/shared/core/type/transfer-tracking.type'
import { PersistenceModule } from '@app/orchestration/shared/module/persistence/persistence.module'
import { TestPrismaService } from '@app/orchestration/shared/module/persistence/service/test-prisma.service'
import { QueueModule } from '@app/orchestration/shared/module/queue/queue.module'
import { TransferTrackingService } from '@app/orchestration/transfer-tracking/core/service/transfer-tracking.service'
import { TransferTrackingModule } from '@app/orchestration/transfer-tracking/transfer-tracking.module'
import { INestApplication } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { first, map, omit, uniq } from 'lodash/fp'

describe(TransferTrackingService.name, () => {
  let app: INestApplication
  let module: TestingModule
  let testPrismaService: TestPrismaService
  let service: TransferTrackingService

  const transfer: Transfer = {
    id: '0e9a6d80-7d44-4baa-935f-977e3c71ee49',
    orgId: 'a659321f-e304-406a-b020-cf97a2d01876',
    rates: {
      'fiat:usd': 0.99,
      'fiat:eur': 1.1
    },
    amount: BigInt('3000000000'),
    from: 'eip155:137:0x90d03a8971a2faa19a9d7ffdcbca28fe826a289b',
    to: 'eip155:137:0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4',
    chainId: 137,
    token: 'eip155:137/slip44/966',
    initiatedBy: 'matt@narval.xyz',
    createdAt: new Date()
  }

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
    it('creates a new transfer feed', async () => {
      await service.track(transfer)

      const models = await testPrismaService.getClient().transferFeed.findMany()

      expect(models.length).toEqual(1)
      expect(first(models)).toEqual({
        ...transfer,
        amount: transfer.amount.toString(),
        rates: {
          'fiat:usd': '0.99',
          'fiat:eur': '1.1'
        }
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
