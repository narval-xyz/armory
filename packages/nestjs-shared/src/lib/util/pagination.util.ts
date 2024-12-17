import { DEFAULT_ORDER_BY, DEFAULT_QUERY_PAGINATION_LIMIT, DEFAULT_SERVICE_PAGINATION_LIMIT } from '../constant'
import {
  PageCursorDecoder,
  PageCursorEncoder,
  PaginatedResult,
  PaginationOptions,
  PaginationQuery
} from '../type/pagination.type'

export function getPaginatedResult<T extends { id: string; createdAt: Date }>({
  items,
  pagination
}: {
  items: T[]
  pagination?: PaginationOptions
}): PaginatedResult<T> {
  // If there are no items, return an empty array
  // If theres only one item, return an empty array:
  //  - getPaginatedResult expect take to be incremented by one. Take = 1 || -1 means a request for 0 item.
  const take = pagination?.take ? Math.abs(pagination.take) : undefined

  if (!items || items.length === 0 || (take && take < 1)) {
    return {
      data: [],
      page: { next: null }
    }
  }

  const hasNextPage = items.length === take

  // If there's more data and more than one item, remove the last item from the list, it is the first item of the next page
  const data =
    hasNextPage && items.length > 1
      ? pagination?.take && pagination.take < 0
        ? items.slice(1) // For prev direction: take last N items
        : items.slice(0, -1) // For next direction: take first N items
      : items

  let next = null

  // we can safely access processedItems[processedItems.length - 2] because we know for sure:
  // - take > 1
  // - processedItems.length > 1
  if (hasNextPage) {
    // here protecting against an edge case where take = 1
    // in this case, we return the last item as the next cursor because we didn't took one more item
    const lastItem = take === 1 ? items[items.length - 1] : items[items.length - 2]
    next = PageCursorEncoder.parse({ id: lastItem.id, createdAt: lastItem.createdAt })
  }

  return {
    data,
    page: {
      next
    }
  }
}

export function getPaginationQuery({ options }: { options?: PaginationQuery }): PaginationOptions {
  const cursor = options?.cursor ? PageCursorDecoder.parse(options.cursor) : undefined
  const multiplier = options?.direction === 'prev' ? -1 : 1

  let take = DEFAULT_QUERY_PAGINATION_LIMIT

  if (options?.limit && options?.limit > 0) {
    take = options.limit * multiplier
  }

  return {
    take,
    cursor,
    sortOrder: options?.sortOrder,
    skip: options?.cursor ? 1 : undefined,
    orderBy: undefined
  }
}

export const applyPagination = (
  pagination?: PaginationOptions
): {
  skip?: number
  cursor?: { id: string; createdAt: Date }
  take: number
  orderBy: { [key: string]: 'asc' | 'desc' }[]
} => {
  const multiplier = pagination?.take && pagination?.take < 0 ? -1 : 1
  const skip = pagination?.cursor ? 1 : undefined
  const take = (Math.abs(pagination?.take || DEFAULT_SERVICE_PAGINATION_LIMIT) + 1) * multiplier

  let orderBy = DEFAULT_ORDER_BY

  if (pagination?.orderBy) {
    orderBy = pagination.orderBy
  } else if (pagination?.sortOrder) {
    orderBy = [{ createdAt: pagination.sortOrder }, { id: pagination.sortOrder }]
  }

  const ret = { take, orderBy, skip, cursor: pagination?.cursor }
  return ret
}
