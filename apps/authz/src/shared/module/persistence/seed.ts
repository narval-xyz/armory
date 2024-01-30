import { Logger } from '@nestjs/common'
import { Organization, PrismaClient } from '@prisma/client/authz'

const prisma = new PrismaClient()

const orgs: Organization[] = [
  {
    uid: '7d704a62-d15e-4382-a826-1eb41563043b'
  }
]

async function main() {
  const logger = new Logger('EngineSeed')

  logger.log('Seeding Engine database')

  for (const org of orgs) {
    await prisma.organization.create({
      data: org
    })
  }

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
