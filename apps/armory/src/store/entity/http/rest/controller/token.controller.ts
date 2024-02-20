import { Body, Controller, HttpStatus, Post } from '@nestjs/common'
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { REQUEST_HEADER_ORG_ID } from '../../../../../orchestration.constant'
import { OrgId } from '../../../../../shared/decorator/org-id.decorator'
import { TokenService } from '../../../core/service/token.service'
import { API_PREFIX, API_TAG } from '../../../entity-store.constant'
import { RegisterTokensRequestDto } from '../dto/register-tokens-request.dto'
import { RegisterTokensResponseDto } from '../dto/register-tokens-response.dto'

@Controller(`${API_PREFIX}/tokens`)
@ApiTags(API_TAG)
export class TokenController {
  constructor(private tokenService: TokenService) {}

  @Post()
  @ApiOperation({
    summary: 'Registers a token entity.'
  })
  @ApiHeader({
    name: REQUEST_HEADER_ORG_ID
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: RegisterTokensResponseDto
  })
  async register(@OrgId() orgId: string, @Body() body: RegisterTokensRequestDto): Promise<RegisterTokensResponseDto> {
    const tokens = await this.tokenService.register(orgId, body)

    return new RegisterTokensResponseDto({ tokens })
  }
}
