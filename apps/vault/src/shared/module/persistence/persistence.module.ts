import { LoggerModule } from '@narval/nestjs-shared'
import { Module } from '@nestjs/common'
import { PrismaService } from './service/prisma.service'
import { TestPrismaService } from './service/test-prisma.service'

@Module({
  imports: [LoggerModule],
  exports: [PrismaService, TestPrismaService],
  providers: [PrismaService, TestPrismaService]
})
export class PersistenceModule {}
