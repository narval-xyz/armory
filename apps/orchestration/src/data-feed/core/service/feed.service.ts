import { Feed } from '@narval/authz-shared'
import { HttpStatus, Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client/orchestration'
import { v4 as uuid } from 'uuid'
import { HistoricalTransferFeedService } from '../../../data-feed/core/service/historical-transfer-feed.service'
import { PriceFeedService } from '../../../data-feed/core/service/price-feed.service'
import { AuthorizationRequest } from '../../../policy-engine/core/type/domain.type'
import { DataFeedException } from '../../../shared/core/exception/data-feed.exception'
import { PrismaService } from '../../../shared/module/persistence/service/prisma.service'

const isJsonObject = (value: unknown): boolean => typeof value === 'object' && value !== null && !Array.isArray(value)

@Injectable()
export class FeedService {
  constructor(
    private prismaService: PrismaService,
    private price: PriceFeedService,
    private historicalTransfer: HistoricalTransferFeedService
  ) {}

  async gather(authzRequest: AuthorizationRequest): Promise<Feed<unknown>[]> {
    try {
      const feeds = await Promise.all([this.price.getFeed(authzRequest), this.historicalTransfer.getFeed(authzRequest)])

      // Exploring a low-hanging fruit idea of building an audit trail.
      await this.save(authzRequest.orgId, authzRequest.id, feeds)

      return feeds
    } catch (error) {
      throw new DataFeedException({
        message: 'Failed to gather authorization request feeds',
        suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        originalError: error,
        context: {
          orgId: authzRequest.orgId,
          requestId: authzRequest.id
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
