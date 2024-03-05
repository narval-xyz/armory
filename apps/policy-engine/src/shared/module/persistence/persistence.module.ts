import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { load } from '../../../policy-engine.config'
import { PrismaService } from './service/prisma.service'
import { TestPrismaService } from './service/test-prisma.service'

@Module({
  imports: [ConfigModule.forRoot({ load: [load] })],
  exports: [PrismaService, TestPrismaService],
  providers: [PrismaService, TestPrismaService]
})
export class PersistenceModule {}
