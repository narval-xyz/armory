import { Module } from '@nestjs/common'
import { PrismaService } from '../../..//shared/module/persistence/service/prisma.service'
import { TestPrismaService } from '../../../shared/module/persistence/service/test-prisma.service'

@Module({
  exports: [PrismaService, TestPrismaService],
  providers: [PrismaService, TestPrismaService]
})
export class PersistenceModule {}
