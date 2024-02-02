import { AdminService } from '@app/authz/app/core/admin.service'
import { AssignUserGroupRequestDto } from '@app/authz/app/http/rest/dto/assign-user-group-request.dto'
import { AssignUserGroupResponseDto } from '@app/authz/app/http/rest/dto/assign-user-group-response.dto'
import { AssignWalletGroupRequestDto } from '@app/authz/app/http/rest/dto/assign-wallet-group-request.dto'
import { AssignWalletGroupResponseDto } from '@app/authz/app/http/rest/dto/assign-wallet-group-response.dto'
import { CreateCredentialRequestDto } from '@app/authz/app/http/rest/dto/create-credential-request.dto'
import { CreateCredentialResponseDto } from '@app/authz/app/http/rest/dto/create-credential-response.dto'
import { CreateOrganizationRequestDto } from '@app/authz/app/http/rest/dto/create-organization-request.dto'
import { CreateOrganizationResponseDto } from '@app/authz/app/http/rest/dto/create-organization-response.dto'
import { CreateUserRequestDto } from '@app/authz/app/http/rest/dto/create-user-request.dto'
import { CreateUserResponseDto } from '@app/authz/app/http/rest/dto/create-user-response.dto'
import { RegisterWalletRequestDto } from '@app/authz/app/http/rest/dto/register-wallet-request.dto'
import { RegisterWalletResponseDto } from '@app/authz/app/http/rest/dto/register-wallet-response.dto'
import { UpdateUserRequestDto } from '@app/authz/app/http/rest/dto/update-user-request.dto'
import { UpdateUserResponseDto } from '@app/authz/app/http/rest/dto/update-user-response.dto'
import {
  AssignUserGroupRequest,
  AssignWalletGroupRequest,
  CreateCredentialRequest,
  CreateOrganizationRequest,
  CreateUserRequest,
  RegisterWalletRequest,
  UpdateUserRequest
} from '@narval/authz-shared'
import { Body, Controller, Logger, Patch, Post } from '@nestjs/common'

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

  @Patch('/users/:uid')
  async updateUser(@Body() body: UpdateUserRequestDto) {
    const payload: UpdateUserRequest = body

    const user = await this.adminService.updateUser(payload)

    const response = new UpdateUserResponseDto(user)
    return response
  }

  @Post('/credentials')
  async createCredential(@Body() body: CreateCredentialRequestDto) {
    const payload: CreateCredentialRequest = body

    const authCredential = await this.adminService.createCredential(payload)

    const response = new CreateCredentialResponseDto(authCredential)
    return response
  }

  @Post('/user-groups')
  async assignUserGroup(@Body() body: AssignUserGroupRequestDto) {
    const payload: AssignUserGroupRequest = body

    const userGroup = await this.adminService.assignUserGroup(payload)

    const response = new AssignUserGroupResponseDto(userGroup)
    return response
  }

  @Post('/wallets')
  async registerWallet(@Body() body: RegisterWalletRequestDto) {
    const payload: RegisterWalletRequest = body

    const wallet = await this.adminService.registerWallet(payload)

    const response = new RegisterWalletResponseDto(wallet)
    return response
  }

  @Post('/wallet-groups')
  async assignWalletGroup(@Body() body: AssignWalletGroupRequestDto) {
    const payload: AssignWalletGroupRequest = body

    const wallet = await this.adminService.assignWalletGroup(payload)

    const response = new AssignWalletGroupResponseDto(wallet)
    return response
  }
}
