import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaService } from './service/prisma.service'

@Module({
  imports: [ConfigModule.forRoot()],
  exports: [PrismaService],
  providers: [PrismaService]
})
export class PersistenceModule {}
