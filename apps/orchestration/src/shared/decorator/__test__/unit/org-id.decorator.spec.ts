import { ExecutionContext } from '@nestjs/common'
import { REQUEST_HEADER_ORG_ID } from '../../../../orchestration.constant'
import { factory } from '../../../decorator/org-id.decorator'

describe('OrgId Decorator', () => {
  it(`returns ${REQUEST_HEADER_ORG_ID} if it exists in the headers`, () => {
    const orgId = '123456'
    const headers = {
      [REQUEST_HEADER_ORG_ID]: orgId
    }
    const request = { headers }
    const context = {
      switchToHttp: () => ({
        getRequest: () => request
      })
    } as ExecutionContext

    const result = factory(null, context)

    expect(result).toBe(orgId)
  })

  it(`throws BadRequestException if ${REQUEST_HEADER_ORG_ID} is missing in the headers`, () => {
    const headers = {}
    const request = { headers }
    const context = {
      switchToHttp: () => ({
        getRequest: () => request
      })
    } as ExecutionContext

    expect(() => factory(null, context)).toThrow(`Missing ${REQUEST_HEADER_ORG_ID} header`)
  })
})
