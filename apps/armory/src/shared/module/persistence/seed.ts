import { LoggerService, secret } from '@narval/nestjs-shared'
import { FIXTURE } from '@narval/policy-engine-shared'
import { NestFactory } from '@nestjs/core'
import { Client, Prisma, PrismaClient } from '@prisma/client/armory'
import { ArmoryModule } from '../../../armory.module'
import { SeederService } from './service/seeder.service'

const logger = new LoggerService()
const now = new Date()
const prisma = new PrismaClient()

const clients: Client[] = [
  {
    id: FIXTURE.CLIENT.id,
    name: 'Dev',
    clientSecret: secret.hash('client-secret'),
    dataSecret: secret.hash('data-secret'),
    enginePublicKey: {},
    createdAt: now,
    updatedAt: now
  }
]

async function main() {
  // Create a standalone application without any network listeners like controllers.
  //
  // See https://docs.nestjs.com/standalone-applications
  const application = await NestFactory.createApplicationContext(ArmoryModule)
  application.useLogger(application.get(LoggerService))
  const seeder = application.get<SeederService>(SeederService)

  logger.log('Seeding database')

  for (const client of clients) {
    logger.log(`Creating client ${client.name} (ID: ${client.id})`)
    await prisma.client.create({
      data: {
        ...client,
        enginePublicKey: client.enginePublicKey as Prisma.InputJsonValue,
        dataStoreKeys: {
          createMany: {
            data: [
              {
                storeType: 'policy',
                publicKey: FIXTURE.EOA_CREDENTIAL.Root.key as Prisma.InputJsonValue
              },
              {
                storeType: 'entity',
                publicKey: FIXTURE.EOA_CREDENTIAL.Root.key as Prisma.InputJsonValue
              }
            ]
          }
        }
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
    logger.log('Done')
  })
  .catch(async (error) => {
    await prisma.$disconnect()
    logger.error('Failed', error)
    process.exit(1)
  })
