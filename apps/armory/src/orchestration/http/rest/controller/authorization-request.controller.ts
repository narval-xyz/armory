import { Body, Controller, Get, HttpStatus, NotFoundException, Param, Post } from '@nestjs/common'
import { ApiHeader, ApiOperation, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger'
import { REQUEST_HEADER_CLIENT_ID } from '../../../../../src/armory.constant'
import { ClientId } from '../../../../shared/decorator/client-id.decorator'
import { ErrorResponseDto } from '../../../../shared/dto/error-response.dto'
import { AuthorizationRequestService } from '../../../core/service/authorization-request.service'
import { AuthorizationRequestDto } from '../../../http/rest/dto/authorization-request.dto'
import { AuthorizationResponseDto } from '../../../http/rest/dto/authorization-response.dto'
import { toCreateAuthorizationRequest } from '../../../http/rest/util'

@Controller('/authorization-requests')
@ApiTags('Authorization')
export class AuthorizationRequestController {
  constructor(private authorizationRequestService: AuthorizationRequestService) {}

  @Post('/')
  @ApiSecurity('CLIENT_ID')
  @ApiOperation({
    summary: 'Submits a new authorization request for evaluation by the policy engine'
  })
  @ApiHeader({
    name: REQUEST_HEADER_CLIENT_ID,
    required: true
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
  @ApiOperation({
    summary: 'Approves an authorization request'
  })
  @ApiResponse({
    description: 'The authorization request including the newly added approval',
    status: HttpStatus.CREATED,
    type: AuthorizationResponseDto
  })
  async approve(@Param('id') id: string, @Body() body: string): Promise<AuthorizationResponseDto> {
    const authzRequest = await this.authorizationRequestService.approve(id, body)

    return AuthorizationResponseDto.create(authzRequest)
  }
}
