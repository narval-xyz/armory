import { OrganizationService } from '@app/authz/app/core/organization.service'
import { CreateOrganizationRequestDto } from '@app/authz/app/http/rest/dto/create-organization-request.dto'
import { CreateOrganizationRequest } from '@narval/authz-shared'
import { Body, Controller, Logger, Post } from '@nestjs/common'

@Controller('/admin')
export class AdminController {
  private logger = new Logger(AdminController.name)

  constructor(private readonly organizationService: OrganizationService) {}

  @Post('/organization')
  async createOrganization(@Body() body: CreateOrganizationRequestDto) {
    const payload: CreateOrganizationRequest = body

    const result = await this.organizationService.createOrganization(payload)

    return result
  }
}
