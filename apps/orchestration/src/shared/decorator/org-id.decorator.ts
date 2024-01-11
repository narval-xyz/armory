import { REQUEST_HEADER_ORG_ID } from '@app/orchestration/orchestration.constant'
import { BadRequestException, ExecutionContext, createParamDecorator } from '@nestjs/common'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const factory = (value: any, ctx: ExecutionContext) => {
  const headers = ctx.switchToHttp().getRequest().headers
  const orgId = headers[REQUEST_HEADER_ORG_ID]

  if (orgId) {
    return orgId
  }

  throw new BadRequestException(`Missing ${REQUEST_HEADER_ORG_ID} header`)
}

/**
 * Decorator that extracts the organization ID from the request object.
 *
 * @throw BadRequestException
 */
export const OrgId = createParamDecorator(factory)
