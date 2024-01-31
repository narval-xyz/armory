import { PrismaService } from '@app/authz/shared/module/persistence/service/prisma.service'
import { AccountType, AuthCredential, UserRoles } from '@app/authz/shared/types/domain.type'
import { Address } from '@narval/authz-shared'
import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { mockEntityData, userAddressStore, userCredentialStore } from './mock_data'

// Input types; should become DTOs
type AuthCredentialDto = Omit<AuthCredential, 'userId'>

@Injectable()
export class OrganizationRepository implements OnModuleInit {
  private logger = new Logger(OrganizationRepository.name)

  constructor(private prismaService: PrismaService) {}

  async onModuleInit() {
    this.logger.log('OrganizationRepository initialized')
  }

  async getEntityData() {
    const data = mockEntityData
    return data
  }

  async getUserForAddress(address: string): Promise<string> {
    const userId = userAddressStore[address]
    if (!userId) throw new Error(`Could not find user for address ${address}`)
    return userId
  }

  async getCredentialForPubKey(pubKey: string): Promise<AuthCredential> {
    const credential = userCredentialStore[pubKey]
    if (!credential) throw new Error(`Could not find credential for pubKey ${pubKey}`)
    return credential
  }

  // CRUD

  async createOrganization(organizationId: string, rootUserId: string, credential: AuthCredentialDto) {
    const organization = await this.prismaService.organization.create({
      data: {
        uid: organizationId
      }
    })
    this.logger.log(`Created organization ${organization.uid}`)

    const rootUser = await this.prismaService.user.create({
      data: {
        uid: rootUserId,
        role: UserRoles.ROOT
      }
    })

    this.logger.log(`Created Root User ${rootUser.uid}`)

    const rootAuthCredential = await this.prismaService.authCredential.create({
      data: {
        pubKey: credential.pubKey,
        alg: credential.alg,
        userId: rootUserId
      }
    })

    this.logger.log(`Created Root User AuthCredential ${rootAuthCredential.pubKey}`)

    // TODO: Persist the API key -- is API Key tied to user, org, credential, or 1:n to user?
    return 'api-key'
  }

  async createUser(uid: string, credential: AuthCredentialDto, role: UserRoles) {
    // Create the User with the Role
    // Create the user's Credential
    await this.prismaService.user.create({
      data: {
        uid,
        role
      }
    })

    await this.prismaService.authCredential.create({
      data: {
        pubKey: credential.pubKey,
        alg: credential.alg,
        userId: uid
      }
    })
  }

  async deleteUser(uid: string) {
    // Delete the User
    // Delete the user's Credentials
    // Remove the user as an assignee of any wallets/groups
    await this.prismaService.user.delete({
      where: {
        uid
      }
    })
    await this.prismaService.authCredential.deleteMany({
      where: {
        userId: uid
      }
    })
    // TODO: remove user from any wallets/groups
  }

  // eslint-disable-next-line
  async registerWallet(uid: string, address: Address, accountType: AccountType, chainId?: number) {}

  async registerRootKey() {}
}

/*
CREATE_ORGANIZATION - only have 1 currently

REGISTER_ROOT_KEY - an underlying Vault Service/root key that can derive wallets; necessary for CREATE_WALLET action

REGISTER_WALLET - register an existing wallet with the system

CREATE_USER

DELETE_USER

CREATE_USER_GROUP

UPDATE_USER_GROUP

DELETE_USER_GROUP

CREATE_WALLET_GROUP

UPDATE_WALLET_GROUP

DELETE_WALLET_GROUP

ASSIGN_USER_ROLE

ASSIGN_USER_GROUP

ASSIGN_WALLET_GROUP

ADD_USER_AUTHN

REMOVE_USER_AUTHN

SET_POLICY_RULES

UPDATE_ADDRESS_BOOK

GENERATE_API_KEY ???

REVOKE_API_KEY ???
*/
