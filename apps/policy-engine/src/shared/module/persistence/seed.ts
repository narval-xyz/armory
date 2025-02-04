/* eslint-disable */
import { LoggerService } from '@narval/nestjs-shared'
import { PrismaClient } from '@prisma/client/policy-engine'

const prisma = new PrismaClient()

async function main() {
  const logger = new LoggerService()

  logger.log('Seeding Engine database')

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
