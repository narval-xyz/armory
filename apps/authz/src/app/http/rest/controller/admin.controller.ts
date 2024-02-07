import { AdminService } from '@app/authz/app/core/admin.service'
import { AssignUserGroupRequestDto } from '@app/authz/app/http/rest/dto/assign-user-group-request.dto'
import { AssignUserGroupResponseDto } from '@app/authz/app/http/rest/dto/assign-user-group-response.dto'
import { AssignUserWalletRequestDto } from '@app/authz/app/http/rest/dto/assign-user-wallet-request.dto'
import { AssignUserWalletResponseDto } from '@app/authz/app/http/rest/dto/assign-user-wallet-response.dto'
import { AssignWalletGroupRequestDto } from '@app/authz/app/http/rest/dto/assign-wallet-group-request.dto'
import { AssignWalletGroupResponseDto } from '@app/authz/app/http/rest/dto/assign-wallet-group-response.dto'
import { CreateAddressBookAccountRequestDto } from '@app/authz/app/http/rest/dto/create-address-book-request.dto'
import { CreateAddressBookAccountResponseDto } from '@app/authz/app/http/rest/dto/create-address-book-response.dto'
import { CreateCredentialRequestDto } from '@app/authz/app/http/rest/dto/create-credential-request.dto'
import { CreateCredentialResponseDto } from '@app/authz/app/http/rest/dto/create-credential-response.dto'
import { CreateOrganizationRequestDto } from '@app/authz/app/http/rest/dto/create-organization-request.dto'
import { CreateOrganizationResponseDto } from '@app/authz/app/http/rest/dto/create-organization-response.dto'
import { CreateUserRequestDto } from '@app/authz/app/http/rest/dto/create-user-request.dto'
import { CreateUserResponseDto } from '@app/authz/app/http/rest/dto/create-user-response.dto'
import { SetPolicyRulesRequestDto } from '@app/authz/app/http/rest/dto/policy-rules/set-policy-rules-request.dto'
import { SetPolicyRulesResponseDto } from '@app/authz/app/http/rest/dto/policy-rules/set-policy-rules-response.dto'
import { RegisterTokensRequestDto } from '@app/authz/app/http/rest/dto/register-tokens-request.dto'
import { RegisterTokensResponseDto } from '@app/authz/app/http/rest/dto/register-tokens-response.dto'
import { RegisterWalletRequestDto } from '@app/authz/app/http/rest/dto/register-wallet-request.dto'
import { RegisterWalletResponseDto } from '@app/authz/app/http/rest/dto/register-wallet-response.dto'
import { UpdateUserRequestDto } from '@app/authz/app/http/rest/dto/update-user-request.dto'
import { UpdateUserResponseDto } from '@app/authz/app/http/rest/dto/update-user-response.dto'
import {
  AssignUserGroupRequest,
  AssignUserWalletRequest,
  AssignWalletGroupRequest,
  CreateAddressBookAccountRequest,
  CreateCredentialRequest,
  CreateOrganizationRequest,
  CreateUserRequest,
  RegisterTokensRequest,
  RegisterWalletRequest,
  SetPolicyRulesRequest,
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

  @Post('/user-wallets')
  async assignUserWallet(@Body() body: AssignUserWalletRequestDto) {
    const payload: AssignUserWalletRequest = body

    const userWallet = await this.adminService.assignUserWallet(payload)

    const response = new AssignUserWalletResponseDto(userWallet)
    return response
  }

  @Post('/address-book')
  async createAddressBookEntry(@Body() body: CreateAddressBookAccountRequestDto) {
    const payload: CreateAddressBookAccountRequest = body

    const addressBookAccount = await this.adminService.createAddressBookAccount(payload)

    const response = new CreateAddressBookAccountResponseDto(addressBookAccount)
    return response
  }

  @Post('/tokens')
  async registerTokens(@Body() body: RegisterTokensRequestDto) {
    const payload: RegisterTokensRequest = body
    const tokens = await this.adminService.registerTokens(payload)

    const response = new RegisterTokensResponseDto(tokens)
    return response
  }

  @Post('/policy-rules')
  async setPolicyRules(@Body() body: SetPolicyRulesRequestDto) {
    const payload: SetPolicyRulesRequest = body

    const policyRules = await this.adminService.setPolicyRules(payload)

    const response = new SetPolicyRulesResponseDto(policyRules)
    return response
  }
}
