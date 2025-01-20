import { HttpModule, OpenTelemetryModule } from '@narval/nestjs-shared'
import { Module } from '@nestjs/common'
import { APP_FILTER } from '@nestjs/core'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { ClientModule } from '../client/client.module'
import { Env, getEnv } from '../main.config'
import { DEFAULT_HTTP_MODULE_PROVIDERS } from '../shared/constant'
import { ProviderHttpExceptionFilter } from '../shared/filter/provider-http-exception.filter'
import { PersistenceModule } from '../shared/module/persistence/persistence.module'
import { EncryptionKeyService } from '../transit-encryption/core/service/encryption-key.service'
import { EncryptionKeyRepository } from '../transit-encryption/persistence/encryption-key.repository'
import { TransitEncryptionModule } from '../transit-encryption/transit-encryption.module'
import { AnchorageCredentialService } from './core/provider/anchorage/anchorage-credential.service'
import { AnchorageProxyService } from './core/provider/anchorage/anchorage-proxy.service'
import { AnchorageSyncService } from './core/provider/anchorage/anchorage-sync.service'
import { AnchorageTransferService } from './core/provider/anchorage/anchorage-transfer.service'
import { FireblocksCredentialService } from './core/provider/fireblocks/fireblocks-credential.service'
import { FireblocksProxyService } from './core/provider/fireblocks/fireblocks-proxy.service'
import { FireblocksSyncService } from './core/provider/fireblocks/fireblocks-sync.service'
import { FireblocksTransferService } from './core/provider/fireblocks/fireblocks-transfer.service'
import { AccountService } from './core/service/account.service'
import { AddressService } from './core/service/address.service'
import { AssetService } from './core/service/asset.service'
import { ConnectionService } from './core/service/connection.service'
import { KnownDestinationService } from './core/service/known-destination.service'
import { ProxyService } from './core/service/proxy.service'
import { SyncService } from './core/service/sync.service'
import { TransferService } from './core/service/transfer.service'
import { WalletService } from './core/service/wallet.service'
import { ConnectionSyncEventHandler } from './event/handler/connection-sync.event-handler'
import { AnchorageClient } from './http/client/anchorage.client'
import { FireblocksClient } from './http/client/fireblocks.client'
import { ProviderAccountController } from './http/rest/controller/account.controller'
import { ProviderAddressController } from './http/rest/controller/address.controller'
import { AssetController } from './http/rest/controller/asset.controller'
import { ConnectionController } from './http/rest/controller/connection.controller'
import { KnownDestinationController } from './http/rest/controller/known-destination.controller'
import { NetworkController } from './http/rest/controller/network.controller'
import { ProxyController } from './http/rest/controller/proxy.controller'
import { SyncController } from './http/rest/controller/sync.controller'
import { TransferController } from './http/rest/controller/transfer.controller'
import { ProviderWalletController } from './http/rest/controller/wallet.controller'
import { AccountRepository } from './persistence/repository/account.repository'
import { AddressRepository } from './persistence/repository/address.repository'
import { AssetRepository } from './persistence/repository/asset.repository'
import { ConnectionRepository } from './persistence/repository/connection.repository'
import { KnownDestinationRepository } from './persistence/repository/known-destination.repository'
import { NetworkRepository } from './persistence/repository/network.repository'
import { SyncRepository } from './persistence/repository/sync.repository'
import { TransferRepository } from './persistence/repository/transfer.repository'
import { WalletRepository } from './persistence/repository/wallet.repository'
import { AssetSeed } from './persistence/seed/asset.seed'
import { NetworkSeed } from './persistence/seed/network.seed'

const SEEDS = [NetworkSeed, AssetSeed]

@Module({
  imports: [
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
    TransferController
  ],
  providers: [
    ...(getEnv() !== Env.PRODUCTION ? SEEDS : []),
    ...DEFAULT_HTTP_MODULE_PROVIDERS,
    {
      provide: APP_FILTER,
      useClass: ProviderHttpExceptionFilter
    },
    FireblocksCredentialService,
    AccountRepository,
    AccountService,
    AddressRepository,
    AddressService,
    AnchorageClient,
    AnchorageCredentialService,
    AnchorageProxyService,
    AnchorageSyncService,
    AnchorageTransferService,
    AssetRepository,
    AssetService,
    ConnectionRepository,
    ConnectionService,
    ConnectionSyncEventHandler,
    EncryptionKeyRepository,
    EncryptionKeyService,
    FireblocksClient,
    FireblocksProxyService,
    FireblocksSyncService,
    FireblocksTransferService,
    KnownDestinationRepository,
    KnownDestinationService,
    NetworkRepository,
    ProxyService,
    SyncRepository,
    SyncService,
    TransferRepository,
    TransferService,
    WalletRepository,
    WalletService
  ]
})
export class BrokerModule {}
