import { Module } from '@nestjs/common'
import { PrismaService } from './service/prisma.service'
import { SeederService } from './service/seeder.service'
import { TestPrismaService } from './service/test-prisma.service'

@Module({
  providers: [PrismaService, TestPrismaService, SeederService],
  exports: [PrismaService, TestPrismaService, SeederService]
})
export class PersistenceModule {}
