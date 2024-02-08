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
import { Body, Controller, Logger, Patch, Post, UsePipes, ValidationPipe } from '@nestjs/common'
import { AdminService } from '../../../core/admin.service'
import { AssignUserGroupRequestDto } from '../dto/assign-user-group-request.dto'
import { AssignUserGroupResponseDto } from '../dto/assign-user-group-response.dto'
import { AssignUserWalletRequestDto } from '../dto/assign-user-wallet-request.dto'
import { AssignUserWalletResponseDto } from '../dto/assign-user-wallet-response.dto'
import { AssignWalletGroupRequestDto } from '../dto/assign-wallet-group-request.dto'
import { AssignWalletGroupResponseDto } from '../dto/assign-wallet-group-response.dto'
import { CreateAddressBookAccountRequestDto } from '../dto/create-address-book-request.dto'
import { CreateAddressBookAccountResponseDto } from '../dto/create-address-book-response.dto'
import { CreateCredentialRequestDto } from '../dto/create-credential-request.dto'
import { CreateCredentialResponseDto } from '../dto/create-credential-response.dto'
import { CreateOrganizationRequestDto } from '../dto/create-organization-request.dto'
import { CreateOrganizationResponseDto } from '../dto/create-organization-response.dto'
import { CreateUserRequestDto } from '../dto/create-user-request.dto'
import { CreateUserResponseDto } from '../dto/create-user-response.dto'
import { SetPolicyRulesRequestDto } from '../dto/policy-rules/set-policy-rules-request.dto'
import { SetPolicyRulesResponseDto } from '../dto/policy-rules/set-policy-rules-response.dto'
import { RegisterTokensRequestDto } from '../dto/register-tokens-request.dto'
import { RegisterTokensResponseDto } from '../dto/register-tokens-response.dto'
import { RegisterWalletRequestDto } from '../dto/register-wallet-request.dto'
import { RegisterWalletResponseDto } from '../dto/register-wallet-response.dto'
import { UpdateUserRequestDto } from '../dto/update-user-request.dto'
import { UpdateUserResponseDto } from '../dto/update-user-response.dto'

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

  @Post('/policies')
  @UsePipes(ValidationPipe)
  async setPolicyRules(@Body() body: SetPolicyRulesRequestDto) {
    const payload: SetPolicyRulesRequest = body

    const policies = await this.adminService.setPolicyRules(payload)

    const response = new SetPolicyRulesResponseDto(policies)
    return response
  }
}
