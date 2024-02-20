import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { Organization, PrismaClient } from '@prisma/client/orchestration'
import { ORGANIZATION } from 'packages/authz-shared/src/lib/dev.fixture'
import { OrchestrationModule } from '../../../orchestration.module'
import { SeederService } from './service/seeder.service'

const now = new Date()
const prisma = new PrismaClient()

const orgs: Organization[] = [
  {
    id: ORGANIZATION.uid,
    name: 'Dev',
    createdAt: now,
    updatedAt: now
  }
]

async function main() {
  const logger = new Logger('OrchestrationSeed')
  // Create a standalone application without any network listeners like controllers.
  //
  // See https://docs.nestjs.com/standalone-applications
  const application = await NestFactory.createApplicationContext(OrchestrationModule)
  const seeder = application.get<SeederService>(SeederService)

  logger.log('Seeding Orchestration database')

  for (const org of orgs) {
    logger.log(`Creating organization ${org.name} (ID: ${org.id})`)
    await prisma.organization.create({
      data: org
    })
  }

  try {
    logger.log('Orchestration database germinated 🌱')
    await seeder.seed()
  } finally {
    await application.close()
  }
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
