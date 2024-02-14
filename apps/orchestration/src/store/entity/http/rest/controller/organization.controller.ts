import { Body, Controller, HttpStatus, Post } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { OrganizationService } from '../../../core/service/organization.service'
import { API_PREFIX, API_TAG } from '../../../entity-store.constant'
import { CreateOrganizationRequestDto } from '../dto/create-organization-request.dto'
import { CreateOrganizationResponseDto } from '../dto/create-organization-response.dto'

@Controller(`${API_PREFIX}/organizations`)
@ApiTags(API_TAG)
export class OrganizationController {
  constructor(private orgService: OrganizationService) {}

  @Post()
  @ApiOperation({
    summary: 'Creates a new organization and root user.'
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: CreateOrganizationResponseDto
  })
  async create(@Body() body: CreateOrganizationRequestDto): Promise<CreateOrganizationResponseDto> {
    const { organization, rootCredential, rootUser } = await this.orgService.create({
      uid: body.request.organization.uid,
      rootCredential: body.request.organization.credential
    })

    return new CreateOrganizationResponseDto({
      organization,
      rootCredential,
      rootUser
    })
  }
}
