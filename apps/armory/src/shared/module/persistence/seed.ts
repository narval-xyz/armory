import { FIXTURE } from '@narval/policy-engine-shared'
import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { Organization, Prisma, PrismaClient } from '@prisma/client/armory'
import { ArmoryModule } from '../../../armory.module'
import { SeederService } from './service/seeder.service'

const now = new Date()
const prisma = new PrismaClient()

const orgs: Organization[] = [
  {
    id: FIXTURE.ORGANIZATION.id,
    name: 'Dev',
    entityPubKey: FIXTURE.EOA_CREDENTIAL.Root.key,
    policyPubKey: FIXTURE.EOA_CREDENTIAL.Root.key,
    createdAt: now,
    updatedAt: now
  }
]

async function main() {
  const logger = new Logger('ArmorySeed')
  // Create a standalone application without any network listeners like controllers.
  //
  // See https://docs.nestjs.com/standalone-applications
  const application = await NestFactory.createApplicationContext(ArmoryModule)
  const seeder = application.get<SeederService>(SeederService)

  logger.log('Seeding database')

  for (const org of orgs) {
    logger.log(`Creating organization ${org.name} (ID: ${org.id})`)
    await prisma.organization.create({
      data: {
        ...org,
        policyPubKey: org.policyPubKey as Prisma.InputJsonValue,
        entityPubKey: org.entityPubKey as Prisma.InputJsonValue
      }
    })
  }

  try {
    logger.log('Database germinated 🌱')
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
    // eslint-disable-next-line no-console
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
