import { Body, Controller, HttpStatus, Post } from '@nestjs/common'
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { REQUEST_HEADER_ORG_ID } from '../../../../../armory.constant'
import { OrgId } from '../../../../../shared/decorator/org-id.decorator'
import { CredentialService } from '../../../core/service/credential.service'
import { API_PREFIX, API_TAG } from '../../../entity-store.constant'
import { CreateCredentialRequestDto } from '../dto/create-credential-request.dto'
import { CreateCredentialResponseDto } from '../dto/create-credential-response.dto'

@Controller(`${API_PREFIX}/credentials`)
@ApiTags(API_TAG)
export class CredentialController {
  constructor(private credentialService: CredentialService) {}

  @Post()
  @ApiOperation({
    summary: 'Registers a new user credential'
  })
  @ApiHeader({
    name: REQUEST_HEADER_ORG_ID
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: CreateCredentialResponseDto
  })
  async create(@OrgId() orgId: string, @Body() body: CreateCredentialRequestDto): Promise<CreateCredentialResponseDto> {
    const credential = await this.credentialService.create(orgId, body)

    return new CreateCredentialResponseDto({ credential })
  }
}
