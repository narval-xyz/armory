/* eslint-disable */
import { LoggerService } from '@narval/nestjs-shared'
import { Engine, PrismaClient } from '@prisma/client/policy-engine'

const prisma = new PrismaClient()

const engine: Engine = {
  id: '7d704a62-d15e-4382-a826-1eb41563043b',
  adminApiKey: 'admin-api-key-xxx',
  masterKey: 'master-key-xxx'
}

async function main() {
  const logger = new LoggerService()

  logger.log('Seeding Engine database')
  await prisma.$transaction(async (txn) => {
    // await txn.engine.create({ data: engine })
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
