import { AuthorizationRequestService } from '@app/orchestration/policy-engine/core/service/authorization-request.service'
import { Action, CreateAuthorizationRequest } from '@app/orchestration/policy-engine/core/type/domain.type'
import { AuthorizationRequestDto } from '@app/orchestration/policy-engine/http/rest/dto/authorization-request.dto'
import { AuthorizationResponseDto } from '@app/orchestration/policy-engine/http/rest/dto/authorization-response.dto'
import { OrgId } from '@app/orchestration/shared/decorator/org-id.decorator'
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  UsePipes,
  ValidationPipe
} from '@nestjs/common'
import { ApiResponse, ApiTags } from '@nestjs/swagger'
import { plainToInstance } from 'class-transformer'

// Not in love with the gymnastics required to bend a DTO to a domain object.
// Most of the complexity came from the discriminated union type.
// It's fine for now to keep it ugly here but I'll look at the problem later
const toDomainType = (orgId: string, body: AuthorizationRequestDto): CreateAuthorizationRequest => {
  const dto = plainToInstance(AuthorizationRequestDto, body)
  const shared = {
    orgId,
    initiatorId: '97389cac-20f0-4d02-a3a9-b27c564ffd18',
    hash: dto.hash
  }

  if (dto.isSignMessage(dto.request)) {
    return {
      ...shared,
      action: Action.SIGN_MESSAGE,
      request: {
        message: dto.request.message
      }
    }
  }

  return {
    ...shared,
    action: Action.SIGN_TRANSACTION,
    request: {
      from: dto.request.from,
      to: dto.request.to,
      data: dto.request.data
    }
  }
}

@Controller('/policy-engine')
@UsePipes(new ValidationPipe())
@ApiTags('Policy Engine')
export class FacadeController {
  constructor(private authorizationRequestService: AuthorizationRequestService) {}

  @Post('/evaluations')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The authorization evaluation has been successfully submit',
    type: AuthorizationResponseDto
  })
  async evaluation(@OrgId() orgId: string, @Body() body: AuthorizationRequestDto): Promise<AuthorizationResponseDto> {
    const authzRequest = await this.authorizationRequestService.create(toDomainType(orgId, body))

    return new AuthorizationResponseDto(authzRequest)
  }

  @Get('/evaluations/:id')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The authorization evaluation request',
    type: AuthorizationResponseDto
  })
  async getBydId(@Param('id') id: string): Promise<AuthorizationResponseDto> {
    const authzRequest = await this.authorizationRequestService.findById(id)

    if (authzRequest) {
      return new AuthorizationResponseDto(authzRequest)
    }

    throw new NotFoundException('Authorization request not found')
  }
}
