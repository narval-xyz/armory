import { AdminService } from '@app/authz/app/core/admin.service'
import { CreateOrganizationRequestDto } from '@app/authz/app/http/rest/dto/create-organization-request.dto'
import { CreateUserRequestDto } from '@app/authz/app/http/rest/dto/create-user-request.dto'
import { CreateOrganizationRequest, CreateUserRequest } from '@narval/authz-shared'
import { Body, Controller, Logger, Post } from '@nestjs/common'

@Controller('/admin')
export class AdminController {
  private logger = new Logger(AdminController.name)

  constructor(private readonly adminService: AdminService) {}

  @Post('/organization')
  async createOrganization(@Body() body: CreateOrganizationRequestDto) {
    const payload: CreateOrganizationRequest = body

    const result = await this.adminService.createOrganization(payload)

    return result
  }

  @Post('/user')
  async createUser(@Body() body: CreateUserRequestDto) {
    const payload: CreateUserRequest = body

    const result = await this.adminService.createUser(payload)

    return result
  }
}
