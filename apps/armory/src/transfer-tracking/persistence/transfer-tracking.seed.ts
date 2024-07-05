import { Injectable } from '@nestjs/common'
import { getTime, subHours } from 'date-fns'
import { POLYGON } from '../../armory.constant'
import { PrismaService } from '../../shared/module/persistence/service/prisma.service'
import { SeedService } from '../../shared/module/persistence/service/seed.service'

@Injectable()
export class TransferTrackingSeed extends SeedService {
  constructor(private prismaService: PrismaService) {
    super()
  }

  override async germinate(): Promise<void> {
    const now = getTime(new Date())
    const twentyHoursAgo = subHours(now, 20)
    const clientId = '7d704a62-d15e-4382-a826-1eb41563043b'
    const rates = {
      'fiat:usd': '0.99',
      'fiat:eur': '1.10'
    }

    // TODO (@wcalderipe, 19/02/24): Refactor to use the repository instead of
    // writing directly through the model.
    await this.prismaService.approvedTransfer.createMany({
      data: [
        {
          clientId,
          rates,
          id: '107b07ec-3e8d-440f-9e4a-d145dcd53324',
          requestId: '623121f4-439c-42ac-aee3-d38f94f6f886',
          amount: '3000000000',
          resourceId: 'eip155:eoa:0x90d03a8971a2faa19a9d7ffdcbca28fe826a289b',
          from: 'eip155:137:0x90d03a8971a2faa19a9d7ffdcbca28fe826a289b',
          to: 'eip155:137:0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4',
          chainId: 137,
          token: POLYGON.coin.id,
          initiatedBy: 'matt@narval.xyz',
          createdAt: twentyHoursAgo
        },
        {
          clientId,
          rates,
          id: '2b697c4b-4675-4762-b68d-89baaa1b5cb8',
          requestId: 'e615f495-fa7b-4ee8-b4c6-927ce72a9107',
          amount: '2000000000',
          resourceId: 'eip155:eoa:0x90d03a8971a2faa19a9d7ffdcbca28fe826a289b',
          from: 'eip155:137:0x90d03a8971a2faa19a9d7ffdcbca28fe826a289b',
          to: 'eip155:137:0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4',
          chainId: 137,
          token: POLYGON.coin.id,
          initiatedBy: 'matt@narval.xyz',
          createdAt: twentyHoursAgo
        },
        {
          clientId,
          rates,
          id: '4810c9de-ebc6-4788-ba5c-e9a899273c86',
          requestId: '1d88e7e4-49ab-4f83-9e55-c3e089a4a252',
          amount: '1500000000',
          resourceId: 'eip155:eoa:0x90d03a8971a2faa19a9d7ffdcbca28fe826a289b',
          from: 'eip155:137:0x90d03a8971a2faa19a9d7ffdcbca28fe826a289b',
          to: 'eip155:137:0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4',
          chainId: 137,
          token: POLYGON.coin.id,
          initiatedBy: 'matt@narval.xyz',
          createdAt: twentyHoursAgo
        },
        {
          clientId,
          rates,
          id: 'a8116490-2c0e-4315-892f-f4795ff7eda9',
          requestId: 'c91393e3-1cbb-49e6-888c-50f188f22f7e',
          amount: '1000000000',
          resourceId: 'eip155:eoa:0x90d03a8971a2faa19a9d7ffdcbca28fe826a289b',
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
}
