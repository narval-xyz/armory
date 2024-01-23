import { AuthorizationRequestService } from '@app/orchestration/policy-engine/core/service/authorization-request.service'
import { AuthorizationRequestDto } from '@app/orchestration/policy-engine/http/rest/dto/authorization-request.dto'
import { AuthorizationResponseDto } from '@app/orchestration/policy-engine/http/rest/dto/authorization-response.dto'
import { toCreateAuthorizationRequest } from '@app/orchestration/policy-engine/http/rest/util'
import { OrgId } from '@app/orchestration/shared/decorator/org-id.decorator'
import { Body, Controller, Get, HttpCode, HttpStatus, NotFoundException, Param, Post } from '@nestjs/common'
import { ApiResponse, ApiTags } from '@nestjs/swagger'

@Controller('/policy-engine')
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
    const authzRequest = await this.authorizationRequestService.create(toCreateAuthorizationRequest(orgId, body))

    // TODO (@wcalderipe, 23/01/24): Validate if the signed hash is the same
    // hash used internally.

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
