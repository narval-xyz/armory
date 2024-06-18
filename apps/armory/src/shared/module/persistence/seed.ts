import { secret } from '@narval/nestjs-shared'
import { FIXTURE } from '@narval/policy-engine-shared'
import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { Client, Prisma, PrismaClient } from '@prisma/client/armory'
import { ArmoryModule } from '../../../armory.module'
import { SeederService } from './service/seeder.service'

const now = new Date()
const prisma = new PrismaClient()

const clients: Client[] = [
  {
    id: FIXTURE.CLIENT.id,
    name: 'Dev',
    clientSecret: secret.hash('client-secret'),
    dataApiKey: secret.hash('data-api-key'),
    enginePublicKey: {},
    entityPublicKey: FIXTURE.EOA_CREDENTIAL.Root.key,
    policyPublicKey: FIXTURE.EOA_CREDENTIAL.Root.key,
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

  for (const client of clients) {
    logger.log(`Creating client ${client.name} (ID: ${client.id})`)
    await prisma.client.create({
      data: {
        ...client,
        enginePublicKey: client.enginePublicKey as Prisma.InputJsonValue,
        policyPublicKey: client.policyPublicKey as Prisma.InputJsonValue,
        entityPublicKey: client.entityPublicKey as Prisma.InputJsonValue
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
