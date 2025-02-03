import { HttpModule, OpenTelemetryModule } from '@narval/nestjs-shared'
import { CacheModule } from '@nestjs/cache-manager'
import { Module, OnApplicationBootstrap } from '@nestjs/common'
import { APP_FILTER } from '@nestjs/core'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { ClientModule } from '../client/client.module'
import { DEFAULT_HTTP_MODULE_PROVIDERS } from '../shared/constant'
import { ProviderHttpExceptionFilter } from '../shared/filter/provider-http-exception.filter'
import { PersistenceModule } from '../shared/module/persistence/persistence.module'
import { EncryptionKeyService } from '../transit-encryption/core/service/encryption-key.service'
import { EncryptionKeyRepository } from '../transit-encryption/persistence/encryption-key.repository'
import { TransitEncryptionModule } from '../transit-encryption/transit-encryption.module'
import { AnchorageCredentialService } from './core/provider/anchorage/anchorage-credential.service'
import { AnchorageKnownDestinationService } from './core/provider/anchorage/anchorage-known-destination.service'
import { AnchorageProxyService } from './core/provider/anchorage/anchorage-proxy.service'
import { AnchorageScopedSyncService } from './core/provider/anchorage/anchorage-scoped-sync.service'
import { AnchorageTransferService } from './core/provider/anchorage/anchorage-transfer.service'
import { BitgoCredentialService } from './core/provider/bitgo/bitgo-credential.service'
import { BitgoScopedSyncService } from './core/provider/bitgo/bitgo-scoped-sync.service'
import { BitgoTransferService } from './core/provider/bitgo/bitgo-transfer.service'
import { FireblocksCredentialService } from './core/provider/fireblocks/fireblocks-credential.service'
import { FireblocksKnownDestinationService } from './core/provider/fireblocks/fireblocks-known-destination.service'
import { FireblocksProxyService } from './core/provider/fireblocks/fireblocks-proxy.service'
import { FireblocksScopedSyncService } from './core/provider/fireblocks/fireblocks-scoped-sync.service'
import { FireblocksTransferService } from './core/provider/fireblocks/fireblocks-transfer.service'
import { AccountService } from './core/service/account.service'
import { AddressService } from './core/service/address.service'
import { AssetService } from './core/service/asset.service'
import { ConnectionService } from './core/service/connection.service'
import { KnownDestinationService } from './core/service/known-destination.service'
import { NetworkService } from './core/service/network.service'
import { ProxyService } from './core/service/proxy.service'
import { RawAccountService } from './core/service/raw-account.service'
import { ScopedSyncService } from './core/service/scoped-sync.service'
import { SyncService } from './core/service/sync.service'
import { TransferAssetService } from './core/service/transfer-asset.service'
import { TransferService } from './core/service/transfer.service'
import { WalletService } from './core/service/wallet.service'
import { ConnectionScopedSyncEventHandler } from './event/handler/connection-scoped-sync.event-handler'
import { AnchorageClient } from './http/client/anchorage.client'
import { BitgoClient } from './http/client/bitgo.client'
import { FireblocksClient } from './http/client/fireblocks.client'
import { ProviderAccountController } from './http/rest/controller/account.controller'
import { ProviderAddressController } from './http/rest/controller/address.controller'
import { AssetController } from './http/rest/controller/asset.controller'
import { ConnectionController } from './http/rest/controller/connection.controller'
import { KnownDestinationController } from './http/rest/controller/known-destination.controller'
import { NetworkController } from './http/rest/controller/network.controller'
import { ProxyController } from './http/rest/controller/proxy.controller'
import { ScopedSyncController } from './http/rest/controller/scoped-sync.controller'
import { SyncController } from './http/rest/controller/sync.controller'
import { TransferController } from './http/rest/controller/transfer.controller'
import { ProviderWalletController } from './http/rest/controller/wallet.controller'
import { AccountRepository } from './persistence/repository/account.repository'
import { AddressRepository } from './persistence/repository/address.repository'
import { AssetRepository } from './persistence/repository/asset.repository'
import { ConnectionRepository } from './persistence/repository/connection.repository'
import { NetworkRepository } from './persistence/repository/network.repository'
import { ScopedSyncRepository } from './persistence/repository/scoped-sync.repository'
import { SyncRepository } from './persistence/repository/sync.repository'
import { TransferRepository } from './persistence/repository/transfer.repository'
import { WalletRepository } from './persistence/repository/wallet.repository'
import { AssetSeed } from './persistence/seed/asset.seed'
import { NetworkSeed } from './persistence/seed/network.seed'

@Module({
  imports: [
    CacheModule.register(),
    ClientModule,
    EventEmitterModule.forRoot(),
    HttpModule.register({ retry: { retries: 3 } }),
    OpenTelemetryModule.forRoot(),
    PersistenceModule,
    TransitEncryptionModule
  ],
  controllers: [
    AssetController,
    ConnectionController,
    KnownDestinationController,
    NetworkController,
    ProviderAccountController,
    ProviderAddressController,
    ProviderWalletController,
    ProxyController,
    SyncController,
    ScopedSyncController,
    TransferController
  ],
  providers: [
    NetworkSeed,
    AssetSeed,
    ...DEFAULT_HTTP_MODULE_PROVIDERS,
    {
      provide: APP_FILTER,
      useClass: ProviderHttpExceptionFilter
    },
    FireblocksCredentialService,
    AccountRepository,
    AccountService,
    RawAccountService,
    AddressRepository,
    AddressService,
    AnchorageClient,
    AnchorageCredentialService,
    AnchorageKnownDestinationService,
    AnchorageProxyService,
    AnchorageScopedSyncService,
    BitgoScopedSyncService,
    AnchorageTransferService,
    AssetRepository,
    AssetService,
    BitgoCredentialService,
    BitgoClient,
    BitgoTransferService,
    ConnectionRepository,
    ConnectionService,
    ConnectionScopedSyncEventHandler,
    EncryptionKeyRepository,
    EncryptionKeyService,
    FireblocksClient,
    FireblocksKnownDestinationService,
    FireblocksProxyService,
    FireblocksTransferService,
    FireblocksScopedSyncService,
    KnownDestinationService,
    NetworkRepository,
    NetworkService,
    ProxyService,
    ScopedSyncRepository,
    ScopedSyncService,
    SyncRepository,
    SyncService,
    TransferRepository,
    TransferService,
    TransferAssetService,
    WalletRepository,
    WalletService
  ]
})
export class BrokerModule implements OnApplicationBootstrap {
  constructor(
    private networkSeed: NetworkSeed,
    private assetSeed: AssetSeed
  ) {}

  async onApplicationBootstrap() {
    await this.networkSeed.seed()
    await this.assetSeed.seed()
  }
}
