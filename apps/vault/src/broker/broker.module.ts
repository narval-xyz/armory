import { Module } from '@nestjs/common'
import { DEFAULT_HTTP_MODULE_PROVIDERS } from '../shared/constant'
import { PersistenceModule } from '../shared/module/persistence/persistence.module'
import { EncryptionKeyService } from '../transit-encryption/core/service/encryption-key.service'
import { EncryptionKeyRepository } from '../transit-encryption/persistence/encryption-key.repository'
import { TransitEncryptionModule } from '../transit-encryption/transit-encryption.module'
import { AccountService } from './core/service/account.service'
import { AddressService } from './core/service/address.service'
import { ConnectionService } from './core/service/connection.service'
import { SyncService } from './core/service/sync.service'
import { WalletService } from './core/service/wallet.service'
import { AccountController } from './http/rest/controller/account.controller'
import { AddressController } from './http/rest/controller/address.controller'
import { ConnectionController } from './http/rest/controller/connection.controller'
import { SyncController } from './http/rest/controller/sync.controller'
import { WalletController } from './http/rest/controller/wallet.controller'
import { AccountRepository } from './persistence/repository/account.repository'
import { AddressRepository } from './persistence/repository/address.repository'
import { ConnectionRepository } from './persistence/repository/connection.repository'
import { SyncRepository } from './persistence/repository/sync.repository'
import { WalletRepository } from './persistence/repository/wallet.repository'

@Module({
  imports: [PersistenceModule, TransitEncryptionModule],
  controllers: [ConnectionController, WalletController, AccountController, AddressController, SyncController],
  providers: [
    ...DEFAULT_HTTP_MODULE_PROVIDERS,
    AccountRepository,
    AccountService,
    AddressRepository,
    AddressService,
    ConnectionRepository,
    ConnectionService,
    EncryptionKeyRepository,
    EncryptionKeyService,
    SyncRepository,
    SyncService,
    WalletRepository,
    WalletService
  ]
})
export class BrokerModule {}
