import { ConfigModule } from '@narval/config-module'
import { Module } from '@nestjs/common'
import { load } from '../../../main.config'
import { PrismaService } from './service/prisma.service'
import { TestPrismaService } from './service/test-prisma.service'

@Module({
  imports: [ConfigModule.forRoot({ load: [load] })],
  exports: [PrismaService, TestPrismaService],
  providers: [PrismaService, TestPrismaService]
})
export class PersistenceModule {}
