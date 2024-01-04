import { PrismaService } from '@app/orchestration/persistence/service/prisma.service'
import { TestPrismaService } from '@app/orchestration/persistence/service/test-prisma.service'
import { Module } from '@nestjs/common'

@Module({
  exports: [PrismaService, TestPrismaService],
  providers: [PrismaService, TestPrismaService]
})
export class PersistenceModule {}
