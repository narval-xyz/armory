import { ConfigService } from '@narval/config-module'
import { LoggerService } from '@narval/nestjs-shared'
import { Injectable } from '@nestjs/common'
import { Config, Env } from '../../../main.config'
import { AssetService } from '../../core/service/asset.service'
import { Provider } from '../../core/type/provider.type'

@Injectable()
export class AssetSeed {
  constructor(
    private readonly assetService: AssetService,
    private readonly configService: ConfigService<Config>,
    private readonly logger: LoggerService
  ) {}

  // IMPORTANT: There's already a data migration for base assets.
  // See 20250116101514_add_asset_table_and_data/migration.sql
  async seed(): Promise<void> {
    if (this.configService.get('env') === Env.PRODUCTION) {
      throw new Error('You CANNOT seed the production database')
    }

    const assets = this.getAssets().map((asset) => ({
      networkId: asset.networkId,
      assetId: asset.assetId,
      name: asset.name,
      decimals: asset.decimals,
      symbol: asset.symbol,
      onchainId: asset.onchainId,
      externalAssets: [
        ...(asset.anchorageId
          ? [
              {
                provider: Provider.ANCHORAGE,
                externalId: asset.anchorageId
              }
            ]
          : []),
        ...(asset.fireblocksId
          ? [
              {
                provider: Provider.FIREBLOCKS,
                externalId: asset.fireblocksId
              }
            ]
          : [])
      ]
    }))

    this.logger.log(`🪙 Seeding ${assets.length} assets`)

    await this.assetService.bulkCreate(assets)
  }

  getAssets() {
    return [
      {
        assetId: 'USDC',
        name: 'USD Coin',
        symbol: 'USDC',
        decimals: 6,
        networkId: 'ETHEREUM',
        onchainId: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        anchorageId: 'USDC',
        fireblocksId: 'USDC'
      },
      {
        assetId: 'USDC_POLYGON',
        name: 'USD Coin',
        symbol: 'USDC',
        decimals: 6,
        networkId: 'POLYGON',
        onchainId: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
        anchorageId: null,
        fireblocksId: 'USDC_POLYGON'
      },
      {
        assetId: 'USDC_ARBITRUM',
        name: 'USD Coin',
        symbol: 'USDC',
        decimals: 6,
        networkId: 'ARBITRUM',
        onchainId: '0xaf88d065e77c8cc2239327c5edb3a432268e5831',
        anchorageId: null,
        fireblocksId: 'USDC_ARB_3SBJ'
      },
      {
        assetId: 'UNI',
        name: 'Uniswap',
        symbol: 'UNI',
        decimals: 18,
        networkId: 'ETHEREUM',
        onchainId: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
        anchorageId: 'UNI',
        fireblocksId: 'UNI'
      },
      {
        assetId: '1INCH',
        name: '1inch',
        symbol: '1INCH',
        decimals: 18,
        networkId: 'ETHEREUM',
        onchainId: '0x111111111117dc0aa78b770fa6a738034120c302',
        anchorageId: '1INCH',
        fireblocksId: '1INCH'
      },
      {
        assetId: 'AAVE',
        name: 'Aave',
        symbol: 'AAVE',
        decimals: 18,
        networkId: 'ETHEREUM',
        onchainId: '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9',
        anchorageId: 'AAVE',
        fireblocksId: 'AAVE'
      },
      {
        assetId: 'ATOM',
        name: 'Cosmos',
        symbol: 'ATOM',
        decimals: 6,
        networkId: 'ATOM',
        onchainId: null,
        anchorageId: 'ATOM',
        fireblocksId: 'ATOM_COS'
      },
      {
        assetId: 'XRP',
        name: 'Ripple',
        symbol: 'XRP',
        decimals: 6,
        networkId: 'RIPPLE',
        onchainId: null,
        anchorageId: 'XRP',
        fireblocksId: 'XRP'
      },
      {
        assetId: 'WBTC',
        name: 'Wrapped Bitcoin',
        symbol: 'WBTC',
        decimals: 8,
        networkId: 'ETHEREUM',
        onchainId: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
        anchorageId: 'WBTC',
        fireblocksId: 'WBTC'
      },
      {
        assetId: 'USDT',
        name: 'Tether',
        symbol: 'USDT',
        decimals: 6,
        networkId: 'ETHEREUM',
        onchainId: '0xdac17f958d2ee523a2206206994597c13d831ec7',
        anchorageId: 'USDT',
        fireblocksId: 'USDT_ERC20'
      },
      {
        assetId: 'USDT_POLYGON',
        name: 'Tether',
        symbol: 'USDT',
        decimals: 6,
        networkId: 'POLYGON',
        onchainId: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
        anchorageId: null,
        fireblocksId: 'USDT_POLYGON'
      },
      {
        assetId: 'SUSHI',
        name: 'SushiSwap',
        symbol: 'SUSHI',
        decimals: 18,
        networkId: 'ETHEREUM',
        onchainId: '0x6b3595068778dd592e39a122f4f5a5cf09c90fe2',
        anchorageId: 'SUSHI',
        fireblocksId: 'SUSHI'
      },
      {
        assetId: 'SUI_TEST',
        name: 'Sui Test',
        symbol: 'SUI',
        decimals: 9,
        networkId: 'SUI_TESTNET',
        onchainId: null,
        anchorageId: 'SUI_T',
        fireblocksId: null
      },
      {
        assetId: 'SOL_DEVNET',
        name: 'Solana Devnet',
        symbol: 'SOL',
        decimals: 9,
        networkId: 'SOLANA_DEVNET',
        onchainId: null,
        anchorageId: 'SOL_TD',
        fireblocksId: null
      },
      {
        assetId: 'SOL_TEST',
        name: 'Solana Testnet',
        symbol: 'SOL',
        decimals: null,
        networkId: 'SOLANA_TESTNET',
        onchainId: null,
        anchorageId: null,
        fireblocksId: 'SOL_TEST'
      },
      {
        assetId: 'SOL',
        name: 'Solana',
        symbol: 'SOL',
        decimals: null,
        networkId: 'SOLANA',
        onchainId: null,
        anchorageId: null,
        fireblocksId: 'SOL'
      },
      {
        assetId: 'PORTAL',
        name: 'PORTAL',
        symbol: 'PORTAL',
        decimals: 18,
        networkId: 'ETHEREUM',
        onchainId: '0x1bbe973bef3a977fc51cbed703e8ffdefe001fed',
        anchorageId: 'PORTAL',
        fireblocksId: null
      },
      {
        assetId: 'POL_POLYGON',
        name: 'Polygon',
        symbol: 'POL',
        decimals: 18,
        networkId: 'POLYGON',
        onchainId: null,
        anchorageId: 'POL_POLYGON',
        fireblocksId: 'MATIC_POLYGON'
      },
      {
        assetId: 'POL',
        name: 'Polygon Token',
        symbol: 'POL',
        decimals: 18,
        networkId: 'ETHEREUM',
        onchainId: '0x455e53cbb86018ac2b8092fdcd39d8444affc3f6',
        anchorageId: 'POL',
        fireblocksId: 'POL_ETH_9RYQ'
      },
      {
        assetId: 'MORPHO',
        name: 'Morpho Token',
        symbol: 'MORPHO',
        decimals: 18,
        networkId: 'ETHEREUM',
        onchainId: '0x9994e35db50125e0df82e4c2dde62496ce330999',
        anchorageId: 'MORPHO',
        fireblocksId: null
      },
      {
        assetId: 'MATIC',
        name: 'Matic Token',
        symbol: 'MATIC',
        decimals: 18,
        networkId: 'ETHEREUM',
        onchainId: '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0',
        anchorageId: 'MATIC',
        fireblocksId: 'MATIC'
      },
      {
        assetId: 'LTC',
        name: 'Litecoin',
        symbol: 'LTC',
        decimals: 8,
        networkId: 'LITECOIN',
        onchainId: null,
        anchorageId: 'LTC',
        fireblocksId: 'LTC'
      },
      {
        assetId: 'ETH_ZKSYNC_TEST',
        name: 'ZKsync Sepolia Testnet',
        symbol: 'ETH',
        decimals: 18,
        networkId: 'ZKSYNC_SEPOLIA',
        onchainId: null,
        anchorageId: 'ETH_ZKSYNC_T',
        fireblocksId: 'ETH_ZKSYNC_ERA_SEPOLIA'
      },
      {
        assetId: 'ETH_ARBITRUM_TEST',
        name: 'Arbitrum Sepolia Testnet',
        symbol: 'ETH',
        decimals: 18,
        networkId: 'ARBITRUM_SEPOLIA',
        onchainId: null,
        anchorageId: 'ETH_ARBITRUM_T',
        fireblocksId: 'ETH-AETH_SEPOLIA'
      },
      {
        assetId: 'ETH',
        name: 'Ethereum',
        symbol: 'ETH',
        decimals: 18,
        networkId: 'ETHEREUM',
        onchainId: null,
        anchorageId: 'ETH',
        fireblocksId: 'ETH'
      },
      {
        assetId: 'BTC',
        name: 'Bitcoin',
        symbol: 'BTC',
        decimals: 8,
        networkId: 'BITCOIN',
        onchainId: null,
        anchorageId: 'BTC',
        fireblocksId: 'BTC'
      },
      {
        assetId: 'ARB',
        name: 'Arbitrum',
        symbol: 'ARB',
        decimals: 18,
        networkId: 'ETHEREUM',
        onchainId: '0xb50721bcf8d664c30412cfbc6cf7a15145234ad1',
        anchorageId: 'ARB',
        fireblocksId: null
      },
      {
        assetId: 'ETH_OPT',
        name: 'Optimistic Ethereum',
        symbol: 'ETH',
        decimals: 18,
        networkId: 'OPTIMISM',
        onchainId: null,
        anchorageId: null,
        fireblocksId: 'ETH-OPT'
      },
      {
        assetId: 'ETH_OPT_KOVAN',
        name: 'Optimistic Ethereum Kovan',
        symbol: 'ETH',
        decimals: 18,
        networkId: 'OPTIMISM_KOVAN',
        onchainId: null,
        anchorageId: null,
        fireblocksId: 'ETH-OPT_KOV'
      },
      {
        assetId: 'ETH_OPT_SEPOLIA',
        name: 'Optimistic Ethereum Sepolia',
        symbol: 'ETH',
        decimals: 18,
        networkId: 'OPTIMISM_SEPOLIA',
        onchainId: null,
        anchorageId: null,
        fireblocksId: 'ETH-OPT_SEPOLIA'
      },
      {
        assetId: 'DOT',
        name: 'Polkadot',
        symbol: 'DOT',
        decimals: 10,
        networkId: 'POLKADOT',
        onchainId: null,
        anchorageId: null,
        fireblocksId: 'DOT'
      },
      {
        assetId: 'ETH_ARB',
        name: 'Arbitrum Ethereum',
        symbol: 'ETH',
        decimals: 18,
        networkId: 'ARBITRUM',
        onchainId: null,
        anchorageId: null,
        fireblocksId: 'ETH-AETH'
      },
      {
        assetId: 'ARB_ARB',
        name: 'Arbitrum',
        symbol: 'ARB',
        decimals: 18,
        networkId: 'ARBITRUM',
        onchainId: '0x912ce59144191c1204e64559fe8253a0e49e6548',
        anchorageId: null,
        fireblocksId: 'ARB_ARB_FRK9'
      },
      {
        assetId: 'LINK_ZKSYNC_SEPOLIA',
        name: 'Chainlink',
        symbol: 'LINK',
        decimals: 18,
        networkId: 'ZKSYNC_SEPOLIA',
        onchainId: '0x23a1afd896c8c8876af46adc38521f4432658d1e',
        anchorageId: 'LINK_ZKSYNC_T',
        fireblocksId: null
      }
    ]
  }
}
