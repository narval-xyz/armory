import { IncomingMessage } from 'http'
import { Socket } from 'net'
import { ignoreIncomingRequestHook } from '../../open-telemetry'

const buildIncomingMessage = (url: string, method = 'GET') => {
  const socket = new Socket()
  const message = new IncomingMessage(socket)

  message.url = url
  message.method = method
  message.headers = {
    host: 'localhost:3000',
    'user-agent': 'Mozilla/5.0',
    accept: '*/*'
  }

  return message
}

describe('ignoreIncomingRequestHook', () => {
  const rootTestCases = [
    buildIncomingMessage('/'),
    buildIncomingMessage('/?foo='),
    buildIncomingMessage('/?foo=bar'),
    buildIncomingMessage('/?'),
    buildIncomingMessage('/&')
  ]

  const pingTestCases = [
    buildIncomingMessage('/ping'),
    buildIncomingMessage('/ping?foo='),
    buildIncomingMessage('/ping?foo=bar'),
    buildIncomingMessage('/ping?'),
    buildIncomingMessage('/ping&')
  ]

  const ignoreTestCases = [...rootTestCases, ...pingTestCases]

  for (const request of ignoreTestCases) {
    it(`ignores ${request.url}`, () => {
      expect(ignoreIncomingRequestHook(request)).toEqual(true)
    })
  }

  const doNotIgnoreTestCases = [
    buildIncomingMessage('/foo'),
    buildIncomingMessage('/ready'),
    buildIncomingMessage('/bar'),
    buildIncomingMessage('/client')
  ]

  for (const request of doNotIgnoreTestCases) {
    it(`does not ignore ${request.url}`, () => {
      expect(ignoreIncomingRequestHook(request)).toEqual(false)
    })
  }
})
