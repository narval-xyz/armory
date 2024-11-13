import { REQUEST_HEADER_CLIENT_ID } from '@narval/nestjs-shared'
import { ExecutionContext } from '@nestjs/common'
import { factory } from '../../client-id.decorator'

describe('ClientId Decorator', () => {
  it(`returns ${REQUEST_HEADER_CLIENT_ID} if it exists in the headers`, () => {
    const clientId = '123456'
    const headers = {
      [REQUEST_HEADER_CLIENT_ID]: clientId
    }
    const request = { headers }
    const context = {
      switchToHttp: () => ({
        getRequest: () => request
      })
    } as ExecutionContext

    const result = factory(null, context)

    expect(result).toBe(clientId)
  })

  it(`throws BadRequestException if ${REQUEST_HEADER_CLIENT_ID} is missing in the headers`, () => {
    const headers = {}
    const request = { headers }
    const context = {
      switchToHttp: () => ({
        getRequest: () => request
      })
    } as ExecutionContext

    expect(() => factory(null, context)).toThrow(`Missing or invalid ${REQUEST_HEADER_CLIENT_ID} header`)
  })
})
