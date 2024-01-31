import { PrismaService } from '@app/authz/shared/module/persistence/service/prisma.service'
import { AccountType } from '@app/authz/shared/types/domain.type'
import { Address, AuthCredential, UserRole } from '@narval/authz-shared'
import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { mockEntityData, userAddressStore, userCredentialStore } from './mock_data'

@Injectable()
export class AdminRepository implements OnModuleInit {
  private logger = new Logger(AdminRepository.name)

  constructor(private prismaService: PrismaService) {}

  async onModuleInit() {
    this.logger.log('AdminRepository initialized')
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

  async createOrganization(organizationId: string, rootCredential: AuthCredential) {
    const organization = await this.prismaService.organization.create({
      data: {
        uid: organizationId
      }
    })
    this.logger.log(`Created organization ${organization.uid}`)

    const rootUser = await this.prismaService.user.create({
      data: {
        uid: rootCredential.userId,
        role: UserRole.ROOT
      }
    })

    this.logger.log(`Created Root User ${rootUser.uid}`)

    const rootAuthCredential = await this.prismaService.authCredential.create({
      data: {
        uid: rootCredential.kid,
        pubKey: rootCredential.pubKey,
        alg: rootCredential.alg,
        userId: rootCredential.userId
      }
    })

    this.logger.log(`Created Root User AuthCredential ${rootAuthCredential.pubKey}`)

    // TODO: Persist the API key -- is API Key tied to user, org, credential, or 1:n to user?
    return 'api-key'
  }

  async createUser(uid: string, role: UserRole, credential?: AuthCredential) {
    // Create the User with the Role
    // Create the user's Credential
    const user = await this.prismaService.user.create({
      data: {
        uid,
        role
      }
    })

    // If we're registering a credential at the same time, do that now; otherwise it can be assigned later.
    if (credential) {
      await this.prismaService.authCredential.create({
        data: {
          uid: credential.kid,
          pubKey: credential.pubKey,
          alg: credential.alg,
          userId: uid
        }
      })
    }

    return user
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

    await this.prismaService.userWalletAssignment.deleteMany({
      where: {
        userId: uid
      }
    })

    await this.prismaService.userGroupMembership.deleteMany({
      where: {
        userId: uid
      }
    })
  }

  async createAuthCredential(credential: AuthCredential) {
    await this.prismaService.authCredential.create({
      data: {
        uid: credential.kid,
        pubKey: credential.pubKey,
        alg: credential.alg,
        userId: credential.userId
      }
    })
  }

  async deleteAuthCredential(kid: string) {
    await this.prismaService.authCredential.delete({
      where: {
        uid: kid
      }
    })
  }

  async assignUserRole(userId: string, role: UserRole) {
    await this.prismaService.user.update({
      where: {
        uid: userId
      },
      data: {
        role
      }
    })
  }

  async assignUserGroup(userId: string, groupId: string) {
    await this.prismaService.userGroupMembership.create({
      data: {
        userId,
        userGroupId: groupId
      }
    })
  }

  async unassignUserGroup(userId: string, groupId: string) {
    await this.prismaService.userGroupMembership.delete({
      where: {
        userId_userGroupId: {
          userId,
          userGroupId: groupId
        }
      }
    })
  }

  async registerWallet(uid: string, address: Address, accountType: AccountType, chainId?: number) {
    await this.prismaService.wallet.create({
      data: {
        uid,
        address: address,
        accountType,
        chainId
      }
    })
  }

  async unregisterWallet(uid: string) {
    // Remove the wallet from any groups
    await this.prismaService.walletGroupMembership.deleteMany({
      where: {
        walletId: uid
      }
    })
    // Remove the wallet from assignees
    await this.prismaService.userWalletAssignment.deleteMany({
      where: {
        walletId: uid
      }
    })
    // Delete the wallet
    await this.prismaService.wallet.delete({
      where: {
        uid
      }
    })
  }

  async createWalletGroup(uid: string, walletIds?: string[]) {
    await this.prismaService.walletGroup.create({
      data: {
        uid
      }
    })
    if (walletIds) {
      await Promise.all(
        walletIds.map(async (walletId) => {
          await this.assignWalletGroup(walletId, uid)
        })
      )
    }
  }

  async deleteWalletGroup(uid: string) {
    // unassign all wallets from the group
    await this.prismaService.walletGroupMembership.deleteMany({
      where: {
        walletGroupId: uid
      }
    })
    // delete the group
    await this.prismaService.walletGroup.delete({
      where: {
        uid
      }
    })
  }

  async assignWalletGroup(walletGroupId: string, walletId: string) {
    await this.prismaService.walletGroupMembership.create({
      data: {
        walletId,
        walletGroupId
      }
    })
  }

  async unassignWalletGroup(walletGroupId: string, walletId: string) {
    await this.prismaService.walletGroupMembership.delete({
      where: {
        walletId_walletGroupId: {
          walletId,
          walletGroupId
        }
      }
    })
  }

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
