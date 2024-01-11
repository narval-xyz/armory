import {
  AuthorizationRequest,
  AuthorizationRequestStatus,
  CreateAuthorizationRequest
} from '@app/orchestration/policy-engine/core/type/domain.type'
import {
  decodeAuthorizationRequest,
  isDecodeError,
  isDecodeSuccess
} from '@app/orchestration/policy-engine/persistence/decode/decode-authorization-request.strategy'
import { PrismaService } from '@app/orchestration/shared/module/persistence/service/prisma.service'
import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common'

@Injectable()
export class AuthorizationRequestRepository {
  constructor(private prismaService: PrismaService) {}

  async create({
    id,
    action,
    request,
    orgId,
    initiatorId,
    hash,
    status,
    idempotencyKey,
    createdAt,
    updatedAt
  }: CreateAuthorizationRequest): Promise<AuthorizationRequest> {
    const model = await this.prismaService.authorizationRequest.create({
      data: {
        status: status || AuthorizationRequestStatus.CREATED,
        id,
        orgId,
        initiatorId,
        action,
        request,
        hash,
        idempotencyKey,
        createdAt,
        updatedAt
      }
    })

    const decode = decodeAuthorizationRequest(model)

    if (decode.success) {
      return decode.authorizationRequest
    }

    // TODO (@wcalderipe, 11/01/24): Get rid of implict error throwing.
    throw new BadRequestException('Invalid authorization request', {
      description: decode.reason
    })
  }

  async findById(id: string): Promise<AuthorizationRequest | null> {
    const model = await this.prismaService.authorizationRequest.findUnique({
      where: { id }
    })

    if (model) {
      const decode = decodeAuthorizationRequest(model)

      if (decode.success) {
        return decode.authorizationRequest
      }

      // TODO (@wcalderipe, 11/01/24): Get rid of implict error throwing.
      throw new InternalServerErrorException('Invalid stored authorization request', {
        description: decode.reason
      })
    }

    return null
  }

  async findByStatus(
    statusOrStatuses: AuthorizationRequestStatus | AuthorizationRequestStatus[]
  ): Promise<AuthorizationRequest[]> {
    const models = await this.prismaService.authorizationRequest.findMany({
      where: {
        status: Array.isArray(statusOrStatuses) ? { in: statusOrStatuses } : statusOrStatuses
      }
    })

    const decodes = models.map(decodeAuthorizationRequest)
    const errors = decodes.filter(isDecodeError)

    if (errors.length) {
      // TODO (@wcalderipe, 11/01/24): Get rid of implict error throwing.
      throw new InternalServerErrorException('Invalid stored authorization request', {
        description: errors.map(({ reason }) => reason).join(', ')
      })
    }

    return decodes.filter(isDecodeSuccess).map(({ authorizationRequest }) => authorizationRequest)
  }

  async changeStatus(id: string, status: AuthorizationRequestStatus): Promise<AuthorizationRequest> {
    const model = await this.prismaService.authorizationRequest.update({
      where: { id },
      data: { status }
    })

    const decode = decodeAuthorizationRequest(model)

    if (decode.success) {
      return decode.authorizationRequest
    }

    // TODO (@wcalderipe, 11/01/24): Get rid of implict error throwing.
    throw new InternalServerErrorException('Invalid stored authorization request', {
      description: decode.reason
    })
  }
}
