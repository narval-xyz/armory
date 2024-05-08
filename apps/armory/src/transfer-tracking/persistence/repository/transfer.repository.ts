import { Injectable } from '@nestjs/common'
import { ApprovedTransfer } from '@prisma/client/armory'
import { v4 as uuid } from 'uuid'
import { z } from 'zod'
import { CreateTransfer, Transfer } from '../../../shared/core/type/transfer-tracking.type'
import { PrismaService } from '../../../shared/module/persistence/service/prisma.service'

const decodeRatesSchema = z.record(z.string(), z.coerce.number())
const encodeRatesSchema = z.record(z.string(), z.coerce.string())

@Injectable()
export class TransferRepository {
  constructor(private prismaService: PrismaService) {}

  async create(input: CreateTransfer): Promise<Transfer> {
    const transfer = this.getDefaults(input)
    const approvedTransfer = this.encode(transfer)
    const model = await this.prismaService.approvedTransfer.create({
      data: {
        ...approvedTransfer,
        // TODO (@wcalderipe, 24/01/24): For some reason, I couldn't make it
        // work with a JSON type.
        //
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        rates: approvedTransfer.rates as any
      }
    })

    return this.decode(model)
  }

  async findByClientId(clientId: string): Promise<Transfer[]> {
    const models = await this.prismaService.approvedTransfer.findMany({
      where: { clientId }
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

  private encode(transfer: Transfer): ApprovedTransfer {
    const rates = encodeRatesSchema.parse(transfer.rates)

    return {
      ...transfer,
      rates,
      amount: transfer.amount.toString()
    }
  }

  private decode(model: ApprovedTransfer): Transfer {
    const rates = decodeRatesSchema.parse(model.rates)

    return {
      ...model,
      rates,
      amount: BigInt(model.amount)
    }
  }
}
