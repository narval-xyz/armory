import { LoggerService } from '@narval/nestjs-shared'
import { NestFactory } from '@nestjs/core'
import { PrismaClient } from '@prisma/client/vault'
import { MainModule } from '../../../main.module'
import { SeederService } from './service/seeder.service'

const prisma = new PrismaClient()
const logger = new LoggerService()

async function main() {
  // Create a standalone application without any network listeners like
  // controllers.
  //
  // See https://docs.nestjs.com/standalone-applications
  const application = await NestFactory.createApplicationContext(MainModule)
  application.useLogger(application.get(LoggerService))
  const seeder = application.get<SeederService>(SeederService)

  logger.log('🌱 Seeding database')

  try {
    await seeder.seed()
  } finally {
    logger.log('✅ Database seeded')
    await application.close()
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    logger.error('❌ Seed error', error)
    await prisma.$disconnect()
    process.exit(1)
  })
