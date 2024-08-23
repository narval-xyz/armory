import { Body, Controller, Get, HttpStatus, NotFoundException, Param, Post, VERSION_NEUTRAL } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ApiClientIdGuard } from '../../../../shared/decorator/api-client-id-guard.decorator'
import { ClientId } from '../../../../shared/decorator/client-id.decorator'
import { ErrorResponseDto } from '../../../../shared/dto/error-response.dto'
import { AuthorizationRequestService } from '../../../core/service/authorization-request.service'
import { ApprovalDto, AuthorizationRequestDto } from '../../../http/rest/dto/authorization-request.dto'
import { AuthorizationResponseDto } from '../../../http/rest/dto/authorization-response.dto'
import { toCreateAuthorizationRequest } from '../../../http/rest/util'

@Controller({
  path: '/authorization-requests',
  version: VERSION_NEUTRAL
})
@ApiTags('Authorization')
export class AuthorizationRequestController {
  constructor(private authorizationRequestService: AuthorizationRequestService) {}

  @Post('/')
  @ApiClientIdGuard()
  @ApiOperation({
    summary: 'Submits a new authorization request for evaluation by the policy engine'
  })
  @ApiResponse({
    description: 'The authorization request has been successfully submitted for evaluation',
    status: HttpStatus.CREATED,
    type: AuthorizationResponseDto
  })
  async evaluate(
    @ClientId() clientId: string,
    @Body() body: AuthorizationRequestDto
  ): Promise<AuthorizationResponseDto> {
    const authzRequest = await this.authorizationRequestService.create(toCreateAuthorizationRequest(clientId, body))

    return AuthorizationResponseDto.create(authzRequest)
  }

  @Get('/:id')
  @ApiClientIdGuard()
  @ApiOperation({
    summary: 'Gets an authorization request by ID'
  })
  @ApiResponse({
    description: 'The authorization request',
    status: HttpStatus.OK,
    type: AuthorizationResponseDto
  })
  @ApiResponse({
    description: 'The authorization request was not found',
    status: HttpStatus.NOT_FOUND,
    type: ErrorResponseDto
  })
  async getById(@Param('id') id: string): Promise<AuthorizationResponseDto> {
    const authzRequest = await this.authorizationRequestService.findById(id)

    if (authzRequest) {
      return AuthorizationResponseDto.create(authzRequest)
    }

    throw new NotFoundException('Authorization request not found')
  }

  @Post('/:id/approvals')
  @ApiClientIdGuard()
  @ApiOperation({
    summary: 'Approves an authorization request'
  })
  @ApiResponse({
    description: 'The authorization request including the newly added approval',
    status: HttpStatus.CREATED,
    type: AuthorizationResponseDto
  })
  async approve(@Param('id') id: string, @Body() body: ApprovalDto): Promise<AuthorizationResponseDto> {
    const authzRequest = await this.authorizationRequestService.approve(id, body.signature)
    return AuthorizationResponseDto.create(authzRequest)
  }
}
