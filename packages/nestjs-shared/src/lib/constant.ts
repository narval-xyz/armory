//
// Headers
//

export const REQUEST_HEADER_CLIENT_ID = 'x-client-id'
export const REQUEST_HEADER_CLIENT_SECRET = 'x-client-secret'

//
// OpenTelemetry
//

export const OTEL_ATTR_CLIENT_ID = 'domain.client.id'


//
// Pagination
//

export const MIN_QUERY_PAGINATION_LIMIT = 1
export const DEFAULT_QUERY_PAGINATION_LIMIT = 25
export const MAX_QUERY_PAGINATION_LIMIT = 100
export const DEFAULT_SERVICE_PAGINATION_LIMIT = 100
export const DEFAULT_ORDER_BY = [
  {
      createdAt: 'desc' as const,
  },
  {
      id: 'desc' as const,
  },
] as {[key: string]: 'asc' | 'desc'}[]
