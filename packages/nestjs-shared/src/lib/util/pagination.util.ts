import { z } from 'zod'
import { PaginatedResult, PaginationOptions, PrismaPagination } from '../type/pagination.type'

export function getPaginatedResult<T extends { id: string; createdAt: Date }>({
  items,
  options
}: {
  items: T[]
  options?: PrismaPagination
}): PaginatedResult<T> {
  if (!items || items.length === 0) {
    return {
      data: [],
      page: { next: undefined }
    }
  }

  // limit was increased by one to determine if there's more data
  // if limit === items.length, then there's at least one more item
  // if limit > items.length, then there's no more data
  // if limit === 0, pagination is disabled
  const hasNextPage = options?.take && options?.take > 1 && items.length === options.take

  // If there's more data, remove the last item from the list (which is the first item of the next page)
  const data = hasNextPage ? items.slice(0, items.length - 1) : items

  return {
    data,
    page: {
      // cursor is the id of the last item that is actually returned
      // we can safely access the last item because we know for sure there's at least one more item
      next: hasNextPage ? items[items.length - 2]?.id : undefined
    }
  }
}

export function getPaginationQuery({
  options,
  cursorOrderColumns
}: {
  options?: PaginationOptions
  cursorOrderColumns: string[]
}): PrismaPagination {
  // If no valid fields are provided, default to createdAt
  // If someone tries createdAt on a model that doesn't have it, we will throw a 500

  const validOrderBySchema = z.string().refine(
    (value) => cursorOrderColumns.includes(value),
    (value) => ({ message: `Invalid orderBy field: ${value}. Valid fields are: ${cursorOrderColumns.join(', ')}` })
  )

  const key = options?.orderBy && Object.keys(options.orderBy)[0]

  if (key) {
    validOrderBySchema.parse(key)
  }

  return {
    // if limit is enabled (meaning pagination), limit is increased by one to determine if there's more data
    // if limit == 0, pagination is disabled
    take: typeof options?.limit === 'number' && options.limit > 0 ? options.limit + 1 : undefined,
    ...(options?.cursor && {
      cursor: {
        id: options.cursor
      },
      // Skip the cursor record if it was provided
      skip: options.cursor ? 1 : undefined
    }),
    orderBy: options?.orderBy
  }
}
