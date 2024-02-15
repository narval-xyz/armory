import { Module } from '@nestjs/common'
import { PrismaService } from './service/prisma.service'
import { TestPrismaService } from './service/test-prisma.service'

@Module({
  exports: [PrismaService, TestPrismaService],
  providers: [PrismaService, TestPrismaService]
})
export class PersistenceModule {}
