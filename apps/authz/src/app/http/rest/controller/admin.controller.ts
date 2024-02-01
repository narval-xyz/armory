import { AdminService } from '@app/authz/app/core/admin.service'
import { CreateOrganizationRequestDto } from '@app/authz/app/http/rest/dto/create-organization-request.dto'
import { CreateOrganizationResponseDto } from '@app/authz/app/http/rest/dto/create-organization-response.dto'
import { CreateUserRequestDto } from '@app/authz/app/http/rest/dto/create-user-request.dto'
import { CreateUserResponseDto } from '@app/authz/app/http/rest/dto/create-user-response.dto'
import { CreateOrganizationRequest, CreateUserRequest } from '@narval/authz-shared'
import { Body, Controller, Logger, Post } from '@nestjs/common'

@Controller('/admin')
export class AdminController {
  private logger = new Logger(AdminController.name)

  constructor(private readonly adminService: AdminService) {}

  @Post('/organizations')
  async createOrganization(@Body() body: CreateOrganizationRequestDto) {
    const payload: CreateOrganizationRequest = body

    const result = await this.adminService.createOrganization(payload)

    const response = new CreateOrganizationResponseDto(result.organization, result.rootCredential, result.rootUser)
    return response
  }

  @Post('/users')
  async createUser(@Body() body: CreateUserRequestDto) {
    const payload: CreateUserRequest = body

    const user = await this.adminService.createUser(payload)
    const response = new CreateUserResponseDto(user)
    return response
  }
}
