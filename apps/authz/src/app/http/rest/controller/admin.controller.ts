import { AdminService } from '@app/authz/app/core/admin.service'
import { CreateCredentialRequestDto } from '@app/authz/app/http/rest/dto/create-credential-request.dto'
import { CreateCredentialResponseDto } from '@app/authz/app/http/rest/dto/create-credential-response.dto'
import { CreateOrganizationRequestDto } from '@app/authz/app/http/rest/dto/create-organization-request.dto'
import { CreateOrganizationResponseDto } from '@app/authz/app/http/rest/dto/create-organization-response.dto'
import { CreateUserRequestDto } from '@app/authz/app/http/rest/dto/create-user-request.dto'
import { CreateUserResponseDto } from '@app/authz/app/http/rest/dto/create-user-response.dto'
import { RegisterWalletRequestDto } from '@app/authz/app/http/rest/dto/register-wallet-request.dto'
import { RegisterWalletResponseDto } from '@app/authz/app/http/rest/dto/register-wallet-response.dto'
import {
  CreateCredentialRequest,
  CreateOrganizationRequest,
  CreateUserRequest,
  RegisterWalletRequest
} from '@narval/authz-shared'
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

  @Post('/credentials')
  async createCredential(@Body() body: CreateCredentialRequestDto) {
    const payload: CreateCredentialRequest = body

    const authCredential = await this.adminService.createCredential(payload)

    const response = new CreateCredentialResponseDto(authCredential)
    return response
  }

  @Post('/wallets')
  async registerWallet(@Body() body: RegisterWalletRequestDto) {
    const payload: RegisterWalletRequest = body

    const wallet = await this.adminService.registerWallet(payload)

    const response = new RegisterWalletResponseDto(wallet)
    return response
  }
}
