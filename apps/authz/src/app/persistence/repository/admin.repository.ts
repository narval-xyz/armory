import { PrismaService } from '@app/authz/shared/module/persistence/service/prisma.service'
import { AddressBookAccount, Organization, RegoData, User, Wallet } from '@app/authz/shared/types/entities.types'
import { AccountType, Address, Alg, AuthCredential, UserRole } from '@narval/authz-shared'
import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { mockEntityData, userAddressStore, userCredentialStore } from './mock_data'

function convertResponse<T, K extends keyof T, V extends T[K]>(
  response: T,
  key: K,
  validValues: V[]
): T & Record<K, V> {
  if (!validValues.includes(response[key] as V)) {
    throw new Error(`Invalid value for key ${key as string}: ${response[key]}`)
  }

  return {
    ...response,
    [key]: response[key] as V
  } as T & Record<K, V>
}

@Injectable()
export class AdminRepository implements OnModuleInit {
  private logger = new Logger(AdminRepository.name)

  constructor(private prismaService: PrismaService) {}

  async onModuleInit() {
    this.logger.log('AdminRepository initialized')
  }

  async getEntityData(): Promise<RegoData> {
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
  async getAllUsers(): Promise<User[]> {
    const users = await this.prismaService.user.findMany()
    return users.map((d) => convertResponse(d, 'role', Object.values(UserRole)))
  }

  async getAllWallets(): Promise<Wallet[]> {
    const wallets = await this.prismaService.wallet.findMany()
    return wallets.map((d) => ({
      ...convertResponse(d, 'accountType', Object.values(AccountType)),
      address: d.address as Address,
      chainId: d.chainId || undefined
    }))
  }

  async getAllUserWallets(): Promise<
    {
      userId: string
      walletId: string
    }[]
  > {
    const userWallets = await this.prismaService.userWalletAssignment.findMany()
    return userWallets
  }

  async getAllUserGroups(): Promise<{ userId: string; userGroupId: string }[]> {
    const userGroups = await this.prismaService.userGroupMembership.findMany()
    return userGroups
  }

  async getAllWalletGroups(): Promise<{ walletId: string; walletGroupId: string }[]> {
    const walletGroups = await this.prismaService.walletGroupMembership.findMany()
    return walletGroups
  }

  async createOrganization(
    organizationId: string,
    rootCredential: AuthCredential
  ): Promise<{
    organization: Organization
    rootUser: User
    rootCredential: AuthCredential
  }> {
    const result = await this.prismaService.$transaction(async (txn) => {
      const organization = await txn.organization.create({
        data: {
          uid: organizationId
        }
      })
      this.logger.log(`Created organization ${organization.uid}`)

      const rootUser: User = await txn.user
        .create({
          data: {
            uid: rootCredential.userId,
            role: UserRole.ROOT
          }
        })
        .then((d) => convertResponse(d, 'role', Object.values(UserRole)))

      this.logger.log(`Created Root User ${rootUser.uid}`)

      const rootAuthCredential: AuthCredential = await txn.authCredential
        .create({
          data: {
            uid: rootCredential.uid,
            pubKey: rootCredential.pubKey,
            alg: rootCredential.alg,
            userId: rootCredential.userId
          }
        })
        .then((d) => convertResponse(d, 'alg', Object.values(Alg)))

      this.logger.log(`Created Root User AuthCredential ${rootAuthCredential.pubKey}`)

      return {
        organization,
        rootUser,
        rootCredential: rootAuthCredential
      }
    })

    return result
  }

  async createUser(uid: string, role: UserRole, credential?: AuthCredential): Promise<User> {
    const result = await this.prismaService.$transaction(async (txn) => {
      // Create the User with the Role
      // Create the user's Credential
      const user = await txn.user
        .create({ data: { uid, role } })
        .then((d) => convertResponse(d, 'role', Object.values(UserRole)))

      // If we're registering a credential at the same time, do that now; otherwise it can be assigned later.
      if (credential) {
        await txn.authCredential.create({
          data: {
            uid: credential.uid,
            pubKey: credential.pubKey,
            alg: credential.alg,
            userId: uid
          }
        })
      }

      return user
    })
    return result
  }

  async deleteUser(uid: string): Promise<boolean> {
    await this.prismaService.$transaction(async (txn) => {
      // Delete the User
      // Delete the user's Credentials
      // Remove the user as an assignee of any wallets/groups
      await txn.user.delete({
        where: {
          uid
        }
      })
      await txn.authCredential.deleteMany({
        where: {
          userId: uid
        }
      })

      await txn.userWalletAssignment.deleteMany({
        where: {
          userId: uid
        }
      })

      await txn.userGroupMembership.deleteMany({
        where: {
          userId: uid
        }
      })
    })

    return true
  }

  async createAuthCredential(credential: AuthCredential): Promise<boolean> {
    await this.prismaService.authCredential.create({
      data: {
        uid: credential.uid,
        pubKey: credential.pubKey,
        alg: credential.alg,
        userId: credential.userId
      }
    })

    return true
  }

  async deleteAuthCredential(uid: string): Promise<boolean> {
    await this.prismaService.authCredential.delete({
      where: {
        uid: uid
      }
    })
    return true
  }

  async assignUserRole(userId: string, role: UserRole): Promise<boolean> {
    await this.prismaService.user.update({
      where: {
        uid: userId
      },
      data: {
        role
      }
    })

    return true
  }

  async assignUserGroup(userId: string, groupId: string): Promise<boolean> {
    await this.prismaService.$transaction(async (txn) => {
      const group = await txn.userGroup.findUnique({
        where: { uid: groupId }
      })
      if (!group) {
        await txn.userGroup.create({
          data: { uid: groupId }
        })
      }
      await txn.userGroupMembership.create({
        data: {
          userId,
          userGroupId: groupId
        }
      })
    })

    return true
  }

  async unassignUserGroup(userId: string, groupId: string): Promise<boolean> {
    await this.prismaService.userGroupMembership.delete({
      where: {
        userId_userGroupId: {
          userId,
          userGroupId: groupId
        }
      }
    })

    return true
  }

  async registerWallet(uid: string, address: Address, accountType: AccountType, chainId?: number): Promise<boolean> {
    await this.prismaService.wallet.create({
      data: {
        uid,
        address: address,
        accountType,
        chainId
      }
    })

    return true
  }

  async unregisterWallet(uid: string): Promise<boolean> {
    await this.prismaService.$transaction(async (txn) => {
      // Remove the wallet from any groups
      await txn.walletGroupMembership.deleteMany({
        where: {
          walletId: uid
        }
      })
      // Remove the wallet from assignees
      await txn.userWalletAssignment.deleteMany({
        where: {
          walletId: uid
        }
      })
      // Delete the wallet
      await txn.wallet.delete({
        where: {
          uid
        }
      })
    })

    return true
  }

  async createWalletGroup(uid: string): Promise<boolean> {
    await this.prismaService.walletGroup.create({
      data: {
        uid
      }
    })

    return true
  }

  async deleteWalletGroup(uid: string): Promise<boolean> {
    await this.prismaService.$transaction(async (txn) => {
      // unassign all wallets from the group
      await txn.walletGroupMembership.deleteMany({
        where: {
          walletGroupId: uid
        }
      })
      // delete the group
      await txn.walletGroup.delete({
        where: {
          uid
        }
      })
    })

    return true
  }

  async assignWalletGroup(walletId: string, groupId: string): Promise<boolean> {
    await this.prismaService.$transaction(async (txn) => {
      const group = await txn.walletGroup.findUnique({
        where: { uid: groupId }
      })
      if (!group) {
        await txn.walletGroup.create({
          data: { uid: groupId }
        })
      }
      await txn.walletGroupMembership.create({
        data: {
          walletId,
          walletGroupId: groupId
        }
      })
    })
    return true
  }

  async unassignWalletGroup(walletGroupId: string, walletId: string): Promise<boolean> {
    await this.prismaService.walletGroupMembership.delete({
      where: {
        walletId_walletGroupId: {
          walletId,
          walletGroupId
        }
      }
    })

    return true
  }

  async assignUserWallet(userId: string, walletId: string): Promise<boolean> {
    await this.prismaService.userWalletAssignment.create({
      data: {
        userId,
        walletId
      }
    })

    return true
  }

  async unassignUserWallet(userId: string, walletId: string): Promise<boolean> {
    await this.prismaService.userWalletAssignment.delete({
      where: {
        userId_walletId: {
          userId,
          walletId
        }
      }
    })

    return true
  }

  async createAddressBookAccount(account: AddressBookAccount): Promise<boolean> {
    await this.prismaService.addressBookAccount.create({
      data: {
        uid: account.uid,
        address: account.address,
        classification: account.classification,
        chainId: account.chainId
      }
    })

    return true
  }

  async deleteAddressBookAccount(uid: string): Promise<boolean> {
    await this.prismaService.addressBookAccount.delete({
      where: {
        uid
      }
    })

    return true
  }

  async registerRootKey() {}
}
