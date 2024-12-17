import { ConfigService } from '@narval/config-module'
import { EncryptionModule } from '@narval/encryption-module'
import { LoggerService } from '@narval/nestjs-shared'
import { DynamicModule, forwardRef, ForwardReference, Module, Type } from '@nestjs/common'
import { AppService } from '../../../app.service'
import { AppModule } from '../../../main.module'
import { EncryptionModuleOptionFactory } from '../../factory/encryption-module-option.factory'
import { PrismaService } from './service/prisma.service'
import { TestPrismaService } from './service/test-prisma.service'

@Module({})
export class PersistenceModule {
  static forRoot(): DynamicModule {
    return {
      module: PersistenceModule,
      global: true,
      imports: [
        EncryptionModule.registerAsync({
          imports: [forwardRef(() => AppModule)],
          inject: [ConfigService, AppService, LoggerService],
          useClass: EncryptionModuleOptionFactory
        })
      ],
      providers: [PrismaService, TestPrismaService],
      exports: [PrismaService, TestPrismaService]
    }
  }
  static register(config: { imports?: Array<Type | DynamicModule | ForwardReference> } = {}): DynamicModule {
    return {
      module: PersistenceModule,
      imports: config.imports || [
        EncryptionModule.registerAsync({
          imports: [forwardRef(() => AppModule)],
          inject: [ConfigService, AppService, LoggerService],
          useClass: EncryptionModuleOptionFactory
        })
      ],
      providers: [PrismaService, TestPrismaService],
      exports: [PrismaService, TestPrismaService]
    }
  }
}
