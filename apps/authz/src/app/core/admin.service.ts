import { OpaService } from '@app/authz/app/opa/opa.service'
import { AdminRepository } from '@app/authz/app/persistence/repository/admin.repository'
import { AddressBookAccount, Organization, Token, User, Wallet } from '@app/authz/shared/types/entities.types'
import {
  AssignUserGroupRequest,
  AssignUserWalletRequest,
  AssignWalletGroupRequest,
  AuthCredential,
  CreateAddressBookAccountRequest,
  CreateCredentialRequest,
  CreateOrganizationRequest,
  CreateUserRequest,
  RegisterTokensRequest,
  PolicyCriterionBuilder,
  RegisterWalletRequest,
  SetPolicyRulesRequest,
  UpdateUserRequest,
  UserGroupMembership,
  UserWallet,
  WalletGroupMembership
} from '@narval/authz-shared'
import { Injectable } from '@nestjs/common'

@Injectable()
export class AdminService {
  constructor(private adminRepository: AdminRepository, private opaService: OpaService) {}

  async createOrganization(payload: CreateOrganizationRequest): Promise<{
    organization: Organization
    rootUser: User
    rootCredential: AuthCredential
  }> {
    // TODO: Verify authentication (user) & approval sig (engine)

    const { uid: organizationId, credential: rootCredential } = payload.request.organization

    const data = await this.adminRepository.createOrganization(organizationId, rootCredential)

    // TODO: return api key?
    return {
      organization: data.organization,
      rootUser: data.rootUser,
      rootCredential: data.rootCredential
    }
  }

  async createUser(payload: CreateUserRequest): Promise<User> {
    const { uid, role, credential } = payload.request.user
    const user = await this.adminRepository.createUser(uid, role, credential)

    return user
  }

  async updateUser(payload: UpdateUserRequest): Promise<User> {
    const { uid, role } = payload.request.user
    await this.adminRepository.assignUserRole(uid, role)

    return payload.request.user
  }

  async createCredential(payload: CreateCredentialRequest): Promise<AuthCredential> {
    // TODO: Should we generate the credential uid here to enforce that it's a hash of the pubKey?
    await this.adminRepository.createAuthCredential(payload.request.credential)

    return payload.request.credential
  }

  async assignUserGroup(payload: AssignUserGroupRequest): Promise<UserGroupMembership> {
    await this.adminRepository.assignUserGroup(payload.request.data.userId, payload.request.data.groupId)

    return payload.request.data
  }

  async registerWallet(payload: RegisterWalletRequest): Promise<Wallet> {
    const { uid, address, accountType, chainId } = payload.request.wallet
    await this.adminRepository.registerWallet(uid, address, accountType, chainId)

    return payload.request.wallet
  }

  async assignWalletGroup(payload: AssignWalletGroupRequest): Promise<WalletGroupMembership> {
    await this.adminRepository.assignWalletGroup(payload.request.data.walletId, payload.request.data.groupId)

    return payload.request.data
  }

  async assignUserWallet(payload: AssignUserWalletRequest): Promise<UserWallet> {
    await this.adminRepository.assignUserWallet(payload.request.data.userId, payload.request.data.walletId)

    return payload.request.data
  }

  async createAddressBookAccount(payload: CreateAddressBookAccountRequest): Promise<AddressBookAccount> {
    await this.adminRepository.createAddressBookAccount(payload.request.account)

    return payload.request.account
  }

  async registerTokens(payload: RegisterTokensRequest): Promise<Token[]> {
    await this.adminRepository.registerTokens(payload.request.tokens)

    return payload.request.tokens
  }

  async setPolicyRules(payload: SetPolicyRulesRequest): Promise<PolicyCriterionBuilder[]> {
    await this.opaService.generateRegoFile(payload.request.data)

    return payload.request.data
  }
}
