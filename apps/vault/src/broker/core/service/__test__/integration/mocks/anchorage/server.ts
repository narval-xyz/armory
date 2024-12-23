import { afterAll, afterEach, beforeAll, jest } from '@jest/globals'
import { SetupServerApi, setupServer } from 'msw/node'
import { disableNockProtection, restoreNockProtection } from '../../../../../../../../test/nock.util'
import { getHandlers } from './handlers'

export const ANCHORAGE_TEST_API_BASE_URL = 'https://test-mock-api.anchorage.com'

export const getMockServer = () => setupServer(...getHandlers(ANCHORAGE_TEST_API_BASE_URL))

export const useRequestSpy = (server: SetupServerApi): [jest.Mock, SetupServerApi] => {
  const spy = jest.fn()

  server.events.on('request:start', async ({ request }) => {
    // Clone the request to avoid draining any data stream on reads.
    const clone = request.clone()
    const body = await clone.json()

    spy({
      method: clone.method,
      url: clone.url,
      headers: Object.fromEntries(request.headers),
      body
    })
  })

  // NOTE: Use `spy.mock.calls` to debug the calls recorded by the spy.
  return [spy, server]
}

const attachToJestTestLifecycle = (server: SetupServerApi): SetupServerApi => {
  beforeAll(() => {
    // Disable nock net protection to allow requests to the mock server.
    disableNockProtection()
    server.listen({
      // IMPORTANT: Allow requests to 127.0.0.1 to pass through to support
      // end-to-end testing with supertest because it boots a local server and
      // helps send requests from the test to the server.
      onUnhandledRequest: (req) => {
        if (req.url.includes('127.0.0.1')) {
          return 'bypass'
        }

        return 'error'
      }
    })
  })

  afterEach(() => server.resetHandlers())

  afterAll(() => {
    restoreNockProtection()
    server.close()
  })

  return server
}

/**
 * Sets up a mock server and integrates it with Jest's test lifecycle.
 *
 * - The server starts on `beforeAll`.
 * - HTTP handlers are reset on `afterEach`
 * - The server is closed on `afterAll`
 *
 * IMPORTANT: This function should be used within a test block, such as
 * `describe` or `it`. If you only need the server instance without attaching
 * it to the test lifecycle, use `getMockServer` instead.
 */
export const setupMockServer = (server?: SetupServerApi): SetupServerApi => {
  if (server) {
    return attachToJestTestLifecycle(server)
  }

  return attachToJestTestLifecycle(getMockServer())
}
