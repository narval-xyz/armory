import { Module } from '@nestjs/common'
import { DEFAULT_HTTP_MODULE_PROVIDERS } from '../shared/constant'
import { PersistenceModule } from '../shared/module/persistence/persistence.module'
import { EncryptionKeyService } from '../transit-encryption/core/service/encryption-key.service'
import { EncryptionKeyRepository } from '../transit-encryption/persistence/encryption-key.repository'
import { AccountService } from './core/service/account.service'
import { AddressService } from './core/service/address.service'
import { ConnectionService } from './core/service/connection.service'
import { WalletService } from './core/service/wallet.service'
import { AccountController } from './http/rest/controller/account.controller'
import { AddressController } from './http/rest/controller/address.controller'
import { ConnectionController } from './http/rest/controller/connection.controller'
import { WalletController } from './http/rest/controller/wallet.controller'
import { AccountRepository } from './persistence/repository/account.repository'
import { AddressRepository } from './persistence/repository/address.repository'
import { ConnectionRepository } from './persistence/repository/connection.repository'
import { WalletRepository } from './persistence/repository/wallet.repository'

@Module({
  imports: [PersistenceModule],
  controllers: [ConnectionController, WalletController, AccountController, AddressController],
  providers: [
    ...DEFAULT_HTTP_MODULE_PROVIDERS,
    ConnectionService,
    EncryptionKeyService,
    EncryptionKeyRepository,
    ConnectionRepository,
    WalletService,
    WalletRepository,
    AccountService,
    AccountRepository,
    AddressService,
    AddressRepository
  ]
})
export class BrokerModule {}
