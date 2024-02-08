import { Logger } from '@nestjs/common'
import { Organization, PrismaClient } from '@prisma/client/authz'
import { mockEntityData } from '../../../app/persistence/repository/mock_data'
import { User } from '../../../shared/types/entities.types'

const prisma = new PrismaClient()

const org: Organization = {
  uid: '7d704a62-d15e-4382-a826-1eb41563043b'
}

async function main() {
  const logger = new Logger('EngineSeed')

  logger.log('Seeding Engine database')
  await prisma.$transaction(async (txn) => {
    await txn.organization.create({
      data: org
    })

    // USERS
    for (const user of Object.values(mockEntityData.entities.users) as User[]) {
      logger.log(`Creating user ${user.uid}`)
      await txn.user.create({
        data: user
      })
    }

    // USER GROUPS
    for (const userGroup of Object.values(mockEntityData.entities.userGroups)) {
      // create the group first
      logger.log(`Creating user group ${userGroup.uid}`)
      await txn.userGroup.create({
        data: {
          uid: userGroup.uid
        }
      })
      // now assign each user to it
      for (const userId of userGroup.users) {
        logger.log(`Assigning user ${userId} to group ${userGroup.uid}`)
        await txn.userGroupMembership.create({
          data: {
            userGroupId: userGroup.uid,
            userId
          }
        })
      }
    }

    // WALLETS
    for (const wallet of Object.values(mockEntityData.entities.wallets)) {
      logger.log(`Creating wallet ${wallet.uid}`)
      await txn.wallet.create({
        data: {
          uid: wallet.uid,
          address: wallet.address,
          accountType: wallet.accountType
        }
      })
      if (wallet.assignees) {
        // Assign the wallet to the assignees
        for (const assigneeId of wallet.assignees) {
          logger.log(`Assigning wallet ${wallet.uid} to user ${assigneeId}`)
          await txn.userWalletAssignment.create({
            data: {
              walletId: wallet.uid,
              userId: assigneeId
            }
          })
        }
      }
    }

    // WALLET GROUPS
    for (const walletGroup of Object.values(mockEntityData.entities.walletGroups)) {
      // create the group first
      logger.log(`Creating wallet group ${walletGroup.uid}`)
      await txn.walletGroup.create({
        data: {
          uid: walletGroup.uid
        }
      })
      // now assign each wallet to it
      for (const walletId of walletGroup.wallets) {
        logger.log(`Assigning wallet ${walletId} to group ${walletGroup.uid}`)
        await txn.walletGroupMembership.create({
          data: {
            walletGroupId: walletGroup.uid,
            walletId
          }
        })
      }
    }

    // ADDRESS BOOK
    for (const addressBook of Object.values(mockEntityData.entities.addressBook)) {
      logger.log(`Creating address book ${addressBook.uid}`)
      await txn.addressBookAccount.create({
        data: addressBook
      })
    }
  })

  logger.log('Engine database germinated 🌱')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
