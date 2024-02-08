import { Logger } from '@nestjs/common'
import { Organization, PrismaClient } from '@prisma/client/orchestration'
import { germinate as germinateTransferTrackingModule } from '../../../transfer-tracking/persistence/transfer.seed'

const now = new Date()
const prisma = new PrismaClient()

const orgs: Organization[] = [
  {
    id: '7d704a62-d15e-4382-a826-1eb41563043b',
    name: 'Dev',
    createdAt: now,
    updatedAt: now
  }
]

async function main() {
  const logger = new Logger('OrchestrationSeed')

  logger.log('Seeding Orchestration database')

  for (const org of orgs) {
    logger.log(`Creating organization ${org.name} (ID: ${org.id})`)
    await prisma.organization.create({
      data: org
    })
  }

  await germinateTransferTrackingModule(prisma)

  logger.log('Orchestration database germinated 🌱')
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
