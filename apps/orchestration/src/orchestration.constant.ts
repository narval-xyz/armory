import { BackoffOptions } from 'bull'

export const QUEUE_PREFIX = 'orchestration'

export const AUTHORIZATION_REQUEST_PROCESSING_QUEUE = 'authorization-request:processing'
export const AUTHORIZATION_REQUEST_PROCESSING_QUEUE_ATTEMPTS = 0
export const AUTHORIZATION_REQUEST_PROCESSING_QUEUE_BACKOFF: BackoffOptions = {
  type: 'exponential',
  delay: 1_000
}

export const REQUEST_HEADER_ORG_ID = 'x-org-id'
