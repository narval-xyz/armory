import { PrismaService } from '@app/orchestration/shared/module/persistence/service/prisma.service'
import { TestPrismaService } from '@app/orchestration/shared/module/persistence/service/test-prisma.service'
import { Module } from '@nestjs/common'

@Module({
  exports: [PrismaService, TestPrismaService],
  providers: [PrismaService, TestPrismaService]
})
export class PersistenceModule {}
