import { HistoricalTransferFeedService } from '@app/orchestration/data-feed/core/service/historical-transfer-feed.service'
import { PriceFeedService } from '@app/orchestration/data-feed/core/service/price-feed.service'
import { AuthorizationRequest } from '@app/orchestration/policy-engine/core/type/domain.type'
import { DataFeedException } from '@app/orchestration/shared/core/exception/data-feed.exception'
import { PrismaService } from '@app/orchestration/shared/module/persistence/service/prisma.service'
import { Feed } from '@narval/authz-shared'
import { HttpStatus, Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client/orchestration'
import { v4 as uuid } from 'uuid'

const isJsonObject = (value: unknown): boolean => typeof value === 'object' && value !== null && !Array.isArray(value)

@Injectable()
export class FeedService {
  constructor(
    private prismaService: PrismaService,
    private price: PriceFeedService,
    private historicalTransfer: HistoricalTransferFeedService
  ) {}

  async gather(input: AuthorizationRequest): Promise<Feed<unknown>[]> {
    try {
      const feeds = await Promise.all([this.price.getFeed(input), this.historicalTransfer.getFeed(input)])

      // Exploring a low-hanging fruit idea of building an audit trail.
      await this.save(input.orgId, input.id, feeds)

      return feeds
    } catch (error) {
      throw new DataFeedException({
        message: 'Data feed gather failed',
        suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        originalError: error,
        context: {
          orgId: input.orgId,
          requestId: input.id
        }
      })
    }
  }

  private async save(orgId: string, requestId: string, feeds: Feed<unknown>[]) {
    return this.prismaService.feed.createMany({
      data: feeds.map((feed) => ({
        id: uuid(),
        orgId,
        requestId,
        source: feed.source,
        sig: feed.sig?.sig,
        alg: feed.sig?.alg,
        pubKey: feed.sig?.pubKey,
        data: this.getPersistableJson(feed.data),
        createdAt: new Date()
      }))
    })
  }

  private getPersistableJson(value: unknown) {
    if (isJsonObject(value)) {
      return value as Prisma.InputJsonObject
    }

    return value as Prisma.InputJsonArray
  }
}
