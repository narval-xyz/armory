import { CreateTransfer, Transfer } from '@app/orchestration/shared/core/type/transfer-feed.type'
import { PrismaService } from '@app/orchestration/shared/module/persistence/service/prisma.service'
import { Injectable } from '@nestjs/common'
import { TransferFeed } from '@prisma/client/orchestration'
import { v4 as uuid } from 'uuid'
import { z } from 'zod'

const decodeRatesSchema = z.record(z.string(), z.coerce.number())
const encodeRatesSchema = z.record(z.string(), z.coerce.string())

@Injectable()
export class TransferRepository {
  constructor(private prismaService: PrismaService) {}

  async create(input: CreateTransfer): Promise<Transfer> {
    const transfer = this.getDefaults(input)
    const feed = this.encode(transfer)
    const model = await this.prismaService.transferFeed.create({
      data: {
        ...feed,
        // TODO (@wcalderipe, 24/01/24): For some reason, I couldn't make it
        // work with a JSON type.
        //
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        rates: feed.rates as any
      }
    })

    return this.decode(model)
  }

  async findByOrgId(orgId: string): Promise<Transfer[]> {
    const models = await this.prismaService.transferFeed.findMany({
      where: { orgId }
    })

    return models.map((model) => this.decode(model))
  }

  private getDefaults(input: CreateTransfer): Transfer {
    return {
      ...input,
      id: input.id || uuid(),
      createdAt: input.createdAt || new Date()
    }
  }

  private encode(transfer: Transfer): TransferFeed {
    const rates = encodeRatesSchema.parse(transfer.rates)

    return {
      ...transfer,
      rates,
      amount: transfer.amount.toString()
    }
  }

  private decode(model: TransferFeed): Transfer {
    const rates = decodeRatesSchema.parse(model.rates)

    return {
      ...model,
      rates,
      amount: BigInt(model.amount)
    }
  }
}
