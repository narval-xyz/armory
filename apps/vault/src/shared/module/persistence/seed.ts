/* eslint-disable */
import { LoggerService } from '@narval/nestjs-shared'
import { PrismaClient, Vault } from '@prisma/client/vault'

const prisma = new PrismaClient()

const vault: Vault = {
  id: '7d704a62-d15e-4382-a826-1eb41563043b',
  adminApiKey: 'admin-api-key-xxx',
  masterKey: 'master-key-xxx'
}

async function main() {
  const logger = new LoggerService()

  logger.log('Seeding Vault database')
  await prisma.$transaction(async (txn) => {
    // await txn.vault.create({ data: vault })
  })

  logger.log('Vault database germinated 🌱')
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
