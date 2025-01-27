import { LoggerService } from '@narval/nestjs-shared'
import { Injectable } from '@nestjs/common'
import { Provider } from '../../core/type/provider.type'
import { AssetRepository } from '../repository/asset.repository'

@Injectable()
export class AssetSeed {
  constructor(
    private readonly assetRepository: AssetRepository,
    private readonly logger: LoggerService
  ) {}

  // IMPORTANT: There's already a data migration for base assets.
  // See 20250116101514_add_asset_table_and_data/migration.sql
  async seed(): Promise<void> {
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
          : []),
        ...(asset.bitgoId
          ? [
              {
                provider: Provider.BITGO,
                externalId: asset.bitgoId
              }
            ]
          : [])
      ]
    }))

    this.logger.log(`Seeding ${assets.length} assets`)

    await this.assetRepository.bulkCreate(assets)
  }

  getAssets() {
    return [
      {
        assetId: '1INCH',
        symbol: '1INCH',
        decimals: 18,
        name: '1inch',
        networkId: 'ETHEREUM',
        onchainId: '0x111111111117dc0aa78b770fa6a738034120c302',
        anchorageId: '1INCH',
        fireblocksId: '1INCH',
        bitgoId: null
      },
      {
        assetId: 'AAVE',
        symbol: 'AAVE',
        decimals: 18,
        name: 'Aave',
        networkId: 'ETHEREUM',
        onchainId: '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9',
        anchorageId: 'AAVE',
        fireblocksId: 'AAVE',
        bitgoId: null
      },
      {
        assetId: 'ARB',
        symbol: 'ARB',
        decimals: 18,
        name: 'Arbitrum',
        networkId: 'ETHEREUM',
        onchainId: '0xb50721bcf8d664c30412cfbc6cf7a15145234ad1',
        anchorageId: 'ARB',
        fireblocksId: null,
        bitgoId: null
      },
      {
        assetId: 'ARB_ARB',
        symbol: 'ARB',
        decimals: 18,
        name: 'Arbitrum',
        networkId: 'ARBITRUM',
        onchainId: '0x912ce59144191c1204e64559fe8253a0e49e6548',
        anchorageId: null,
        fireblocksId: 'ARB_ARB_FRK9',
        bitgoId: 'ARBETH:ARB'
      },
      {
        assetId: 'ATOM',
        symbol: 'ATOM',
        decimals: 6,
        name: 'Cosmos',
        networkId: 'ATOM',
        onchainId: null,
        anchorageId: 'ATOM',
        fireblocksId: 'ATOM_COS',
        bitgoId: 'ATOM'
      },
      {
        assetId: 'BTC',
        symbol: 'BTC',
        decimals: 8,
        name: 'Bitcoin',
        networkId: 'BITCOIN',
        onchainId: null,
        anchorageId: 'BTC',
        fireblocksId: 'BTC',
        bitgoId: 'BTC'
      },
      {
        assetId: 'BTC_SIGNET',
        symbol: 'BTC_S',
        decimals: 8,
        name: 'Bitcoin Signet',
        networkId: 'BITCOIN_SIGNET',
        onchainId: null,
        anchorageId: 'BTC_S',
        fireblocksId: null,
        bitgoId: null
      },
      {
        assetId: 'DOT',
        symbol: 'DOT',
        decimals: 10,
        name: 'Polkadot',
        networkId: 'POLKADOT',
        onchainId: null,
        anchorageId: null,
        fireblocksId: 'DOT',
        bitgoId: 'DOT'
      },
      {
        assetId: 'ETH',
        symbol: 'ETH',
        decimals: 18,
        name: 'Ethereum',
        networkId: 'ETHEREUM',
        onchainId: null,
        anchorageId: 'ETH',
        fireblocksId: 'ETH',
        bitgoId: 'ETH'
      },
      {
        assetId: 'ETH_HOLESKY',
        symbol: 'ETH',
        decimals: 18,
        name: 'Holesky Ethereum',
        networkId: 'ETHEREUM_HOLESKY',
        onchainId: null,
        anchorageId: 'ETHHOL',
        fireblocksId: 'ETH_TEST6',
        bitgoId: 'HTETH'
      },
      {
        assetId: 'ETH_ARB',
        symbol: 'ETH',
        decimals: 18,
        name: 'Arbitrum Ethereum',
        networkId: 'ARBITRUM',
        onchainId: null,
        anchorageId: null,
        fireblocksId: 'ETH-AETH',
        bitgoId: 'ARBETH'
      },
      {
        assetId: 'ETH_ARBITRUM_TEST',
        symbol: 'ETH',
        decimals: 18,
        name: 'Arbitrum Sepolia Testnet',
        networkId: 'ARBITRUM_SEPOLIA',
        onchainId: null,
        anchorageId: 'ETH_ARBITRUM_T',
        fireblocksId: 'ETH-AETH_SEPOLIA',
        bitgoId: null
      },
      {
        assetId: 'ETH_OPT',
        symbol: 'ETH',
        decimals: 18,
        name: 'Optimistic Ethereum',
        networkId: 'OPTIMISM',
        onchainId: null,
        anchorageId: null,
        fireblocksId: 'ETH-OPT',
        bitgoId: 'OPETH'
      },
      {
        assetId: 'ETH_OPT_KOVAN',
        symbol: 'ETH',
        decimals: 18,
        name: 'Optimistic Ethereum Kovan',
        networkId: 'OPTIMISM_KOVAN',
        onchainId: null,
        anchorageId: null,
        fireblocksId: 'ETH-OPT_KOV',
        bitgoId: null
      },
      {
        assetId: 'ETH_OPT_SEPOLIA',
        symbol: 'ETH',
        decimals: 18,
        name: 'Optimistic Ethereum Sepolia',
        networkId: 'OPTIMISM_SEPOLIA',
        onchainId: null,
        anchorageId: null,
        fireblocksId: 'ETH-OPT_SEPOLIA',
        bitgoId: null
      },
      {
        assetId: 'ETH_ZKSYNC_TEST',
        symbol: 'ETH',
        decimals: 18,
        name: 'ZKsync Sepolia Testnet',
        networkId: 'ZKSYNC_SEPOLIA',
        onchainId: null,
        anchorageId: 'ETH_ZKSYNC_T',
        fireblocksId: 'ETH_ZKSYNC_ERA_SEPOLIA',
        bitgoId: null
      },
      {
        assetId: 'LTC',
        symbol: 'LTC',
        decimals: 8,
        name: 'Litecoin',
        networkId: 'LITECOIN',
        onchainId: null,
        anchorageId: 'LTC',
        fireblocksId: 'LTC',
        bitgoId: 'LTC'
      },
      {
        assetId: 'MATIC',
        symbol: 'MATIC',
        decimals: 18,
        name: 'Matic Token',
        networkId: 'ETHEREUM',
        onchainId: '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0',
        anchorageId: 'MATIC',
        fireblocksId: 'MATIC',
        bitgoId: 'MATIC'
      },
      {
        assetId: 'MORPHO',
        symbol: 'MORPHO',
        decimals: 18,
        name: 'Morpho Token',
        networkId: 'ETHEREUM',
        onchainId: '0x9994e35db50125e0df82e4c2dde62496ce330999',
        anchorageId: 'MORPHO',
        fireblocksId: null,
        bitgoId: null
      },
      {
        assetId: 'POL',
        symbol: 'POL',
        decimals: 18,
        name: 'Polygon Token',
        networkId: 'ETHEREUM',
        onchainId: '0x455e53cbb86018ac2b8092fdcd39d8444affc3f6',
        anchorageId: 'POL',
        fireblocksId: 'POL_ETH_9RYQ',
        bitgoId: null
      },
      {
        assetId: 'POL_POLYGON',
        symbol: 'POL',
        decimals: 18,
        name: 'Polygon',
        networkId: 'POLYGON',
        onchainId: null,
        anchorageId: 'POL_POLYGON',
        fireblocksId: 'MATIC_POLYGON',
        bitgoId: 'POLYGON'
      },
      {
        assetId: 'PORTAL',
        symbol: 'PORTAL',
        decimals: 18,
        name: 'PORTAL',
        networkId: 'ETHEREUM',
        onchainId: '0x1bbe973bef3a977fc51cbed703e8ffdefe001fed',
        anchorageId: 'PORTAL',
        fireblocksId: null,
        bitgoId: null
      },
      {
        assetId: 'SOL',
        symbol: 'SOL',
        decimals: 9,
        name: 'Solana',
        networkId: 'SOLANA',
        onchainId: null,
        anchorageId: null,
        fireblocksId: 'SOL',
        bitgoId: 'SOL'
      },
      {
        assetId: 'SOL_DEVNET',
        symbol: 'SOL',
        decimals: 9,
        name: 'Solana Devnet',
        networkId: 'SOLONA_DEVNET',
        onchainId: null,
        anchorageId: 'SOL_TD',
        fireblocksId: null,
        bitgoId: null
      },
      {
        assetId: 'SOL_TEST',
        symbol: 'SOL',
        decimals: 9,
        name: 'Solana Testnet',
        networkId: 'SOLANA_TESTNET',
        onchainId: null,
        anchorageId: null,
        fireblocksId: 'SOL_TEST',
        bitgoId: null
      },
      {
        assetId: 'SUI_TEST',
        symbol: 'SUI',
        decimals: 9,
        name: 'Sui Test',
        networkId: 'SUI_TESTNET',
        onchainId: null,
        anchorageId: 'SUI_T',
        fireblocksId: null,
        bitgoId: 'TSUI'
      },
      {
        assetId: 'SUI',
        symbol: 'SUI',
        decimals: 9,
        name: 'Sui',
        networkId: 'SUI',
        onchainId: null,
        anchorageId: 'SUI',
        fireblocksId: null,
        bitgoId: 'SUI'
      },
      {
        assetId: 'SUSHI',
        symbol: 'SUSHI',
        decimals: 18,
        name: 'SushiSwap',
        networkId: 'ETHEREUM',
        onchainId: '0x6b3595068778dd592e39a122f4f5a5cf09c90fe2',
        anchorageId: 'SUSHI',
        fireblocksId: 'SUSHI',
        bitgoId: 'SUSHI'
      },
      {
        assetId: 'UNI',
        symbol: 'UNI',
        decimals: 18,
        name: 'Uniswap',
        networkId: 'ETHEREUM',
        onchainId: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
        anchorageId: 'UNI',
        fireblocksId: 'UNI',
        bitgoId: 'UNI'
      },
      {
        assetId: 'USDC',
        symbol: 'USDC',
        decimals: 6,
        name: 'USD Coin',
        networkId: 'ETHEREUM',
        onchainId: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        anchorageId: 'USDC',
        fireblocksId: 'USDC',
        bitgoId: 'USDC'
      },
      {
        assetId: 'USDC_ARBITRUM',
        symbol: 'USDC',
        decimals: 6,
        name: 'USD Coin',
        networkId: 'ARBITRUM',
        onchainId: '0xaf88d065e77c8cc2239327c5edb3a432268e5831',
        anchorageId: null,
        fireblocksId: 'USDC_ARB_3SBJ',
        bitgoId: 'ARBETH:USDCV2'
      },
      {
        assetId: 'USDC_POLYGON',
        symbol: 'USDC',
        decimals: 6,
        name: 'USD Coin',
        networkId: 'POLYGON',
        onchainId: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
        anchorageId: null,
        fireblocksId: 'USDC_POLYGON',
        bitgoId: 'POLYGON:USDCV2'
      },
      {
        assetId: 'USDT',
        symbol: 'USDT',
        decimals: 6,
        name: 'Tether',
        networkId: 'ETHEREUM',
        onchainId: '0xdac17f958d2ee523a2206206994597c13d831ec7',
        anchorageId: 'USDT',
        fireblocksId: 'USDT_ERC20',
        bitgoId: 'USDT'
      },
      {
        assetId: 'USDT_POLYGON',
        symbol: 'USDT',
        decimals: 6,
        name: 'Tether',
        networkId: 'POLYGON',
        onchainId: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
        anchorageId: null,
        fireblocksId: 'USDT_POLYGON',
        bitgoId: 'OPETH:USDCV2'
      },
      {
        assetId: 'WBTC',
        symbol: 'WBTC',
        decimals: 8,
        name: 'Wrapped Bitcoin',
        networkId: 'ETHEREUM',
        onchainId: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
        anchorageId: 'WBTC',
        fireblocksId: 'WBTC',
        bitgoId: 'WBTC'
      },
      {
        assetId: 'WETH',
        symbol: 'WETH',
        decimals: 18,
        name: 'Wrapped Ether',
        networkId: 'ETHEREUM',
        onchainId: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        anchorageId: 'WETH',
        fireblocksId: 'WETH',
        bitgoId: 'WETH'
      },
      {
        assetId: 'WETH_HOLESKY',
        symbol: 'WETH',
        decimals: 18,
        name: 'Wrapped Ether',
        networkId: 'ETHEREUM_HOLESKY',
        onchainId: '0x94373a4919b3240d86ea41593d5eba789fef3848',
        anchorageId: null,
        fireblocksId: null,
        bitgoId: 'TWETH'
      },
      {
        assetId: 'XRP',
        symbol: 'XRP',
        decimals: 6,
        name: 'Ripple',
        networkId: 'RIPPLE',
        onchainId: null,
        anchorageId: 'XRP',
        fireblocksId: 'XRP',
        bitgoId: 'XRP'
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
