import { POLYGON } from '@app/orchestration/orchestration.constant'
import { Logger } from '@nestjs/common'
import { PrismaClient } from '@prisma/client/orchestration'
import { getTime, subHours } from 'date-fns'

export const germinate = async (prisma: PrismaClient): Promise<void> => {
  const logger = new Logger('TransferFeedSeed')

  logger.log('Germinating the Transfer Feed module database')

  const now = getTime(new Date())
  const twentyHoursAgo = subHours(now, 20)
  const orgId = '7d704a62-d15e-4382-a826-1eb41563043b'
  const rates = {
    'fiat:usd': '0.99',
    'fiat:eur': '1.10'
  }

  await prisma.transferFeed.createMany({
    data: [
      {
        orgId,
        rates,
        id: '107b07ec-3e8d-440f-9e4a-d145dcd53324',
        amount: '3000000000',
        from: 'eip155:137:0x90d03a8971a2faa19a9d7ffdcbca28fe826a289b',
        to: 'eip155:137:0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4',
        chainId: 137,
        token: POLYGON.coin.id,
        initiatedBy: 'matt@narval.xyz',
        createdAt: twentyHoursAgo
      },
      {
        orgId,
        rates,
        id: '2b697c4b-4675-4762-b68d-89baaa1b5cb8',
        amount: '2000000000',
        from: 'eip155:137:0x90d03a8971a2faa19a9d7ffdcbca28fe826a289b',
        to: 'eip155:137:0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4',
        chainId: 137,
        token: POLYGON.coin.id,
        initiatedBy: 'matt@narval.xyz',
        createdAt: twentyHoursAgo
      },
      {
        orgId,
        rates,
        id: '4810c9de-ebc6-4788-ba5c-e9a899273c86',
        amount: '1500000000',
        from: 'eip155:137:0x90d03a8971a2faa19a9d7ffdcbca28fe826a289b',
        to: 'eip155:137:0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4',
        chainId: 137,
        token: POLYGON.coin.id,
        initiatedBy: 'matt@narval.xyz',
        createdAt: twentyHoursAgo
      },
      {
        orgId,
        rates,
        amount: '1000000000',
        from: 'eip155:137:0x90d03a8971a2faa19a9d7ffdcbca28fe826a289b',
        to: 'eip155:137:0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4',
        chainId: 137,
        token: POLYGON.coin.id,
        initiatedBy: 'matt@narval.xyz',
        createdAt: twentyHoursAgo
      }
    ]
  })
}
