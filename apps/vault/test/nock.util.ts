import nock from 'nock'

type Matcher = string | RegExp | ((host: string) => boolean)

// Enable outbound HTTP requests to 127.0.0.1 to allow E2E tests with
// supertestwith supertest to work.
let allowedOutboundHttp: Matcher = '127.0.0.1'

let originalAllowedOutboundHttp: Matcher

// Store the original state to restore it later.
let originalNetConnect: boolean

export const getAllowedOutboundHttp = () => allowedOutboundHttp

export const setAllowedOutboundHttp = (matcher: Matcher) => (allowedOutboundHttp = matcher)

export const setupNock = () => {
  // Disable outgoing HTTP requests to avoid flaky tests.
  nock.disableNetConnect()

  nock.enableNetConnect(getAllowedOutboundHttp())

  // Jest sometimes translates unmatched errors into obscure JSON circular
  // dependency without a proper stack trace. This can lead to hours of
  // debugging. To save time, this emitter will consistently log an unmatched
  // event allowing engineers to quickly identify the source of the error.
  nock.emitter.on('no match', (request) => {
    if (request.host && request.host.includes(getAllowedOutboundHttp())) {
      return
    }

    if (request.hostname && request.hostname.includes(getAllowedOutboundHttp())) {
      return
    }

    // eslint-disable-next-line no-console
    console.error('Nock: no match for request', request)
  })
}

export const disableNockProtection = () => {
  // Store original state
  originalNetConnect = nock.isActive()
  originalAllowedOutboundHttp = getAllowedOutboundHttp()

  // Disable nock restrictions
  nock.cleanAll()
  nock.restore()
  nock.enableNetConnect()
}

export const restoreNockProtection = () => {
  // Clean up any pending nocks
  nock.cleanAll()

  // Restore original state
  if (originalNetConnect) {
    nock.activate()
    nock.disableNetConnect()
    nock.enableNetConnect(originalAllowedOutboundHttp)
  }

  // Re-run the original setup
  setupNock()
}
