import { LoggerService } from '@narval/nestjs-shared'
import { Injectable } from '@nestjs/common'
import { NetworkService } from '../../core/service/network.service'
import { Provider } from '../../core/type/provider.type'

@Injectable()
export class NetworkSeed {
  constructor(
    private readonly networkService: NetworkService,
    private readonly logger: LoggerService
  ) {}

  async seed(): Promise<void> {
    const networks = this.getNetworks().map((network) => ({
      networkId: network.networkId,
      coinType: network.coinType,
      name: network.name,
      externalNetworks: [
        ...(network.anchorageId
          ? [
              {
                provider: Provider.ANCHORAGE,
                externalId: network.anchorageId
              }
            ]
          : []),
        ...(network.fireblocksId
          ? [
              {
                provider: Provider.FIREBLOCKS,
                externalId: network.fireblocksId
              }
            ]
          : []),
        ...(network.bitgoId
          ? [
              {
                provider: Provider.BITGO,
                externalId: network.bitgoId
              }
            ]
          : [])
      ]
    }))

    this.logger.log(`Seeding ${networks.length} networks`)

    await this.networkService.bulkCreate(networks)
  }

  getNetworks() {
    return [
      {
        networkId: 'AETH',
        name: 'Aetherius',
        coinType: 514,
        anchorageId: null,
        fireblocksId: null,
        bitgoId: null
      },
      {
        networkId: 'AEVO',
        name: 'Aevo',
        coinType: null,
        anchorageId: null,
        fireblocksId: 'AEVO',
        bitgoId: null
      },
      {
        networkId: 'AGORIC',
        name: 'Agoric',
        coinType: 564,
        anchorageId: 'BLD',
        fireblocksId: null,
        bitgoId: 'BLD'
      },
      {
        networkId: 'ALEPH_ZERO',
        name: 'Aleph Zero',
        coinType: 643,
        anchorageId: null,
        fireblocksId: 'ALEPH_ZERO_EVM',
        bitgoId: null
      },
      {
        networkId: 'ALGORAND',
        name: 'Algorand',
        coinType: 283,
        anchorageId: null,
        fireblocksId: 'ALGO',
        bitgoId: 'ALGO'
      },
      {
        networkId: 'ALGORAND_TESTNET',
        name: 'Algorand Testnet',
        coinType: 1,
        anchorageId: null,
        fireblocksId: 'ALGO_TEST',
        bitgoId: 'TALGO'
      },
      {
        networkId: 'ALLORA',
        name: 'Allora',
        coinType: null,
        anchorageId: 'ALLO',
        fireblocksId: null,
        bitgoId: null
      },
      {
        networkId: 'ALLORA_TESTNET',
        name: 'Allora Testnet',
        coinType: 1,
        anchorageId: 'ALLO_T',
        fireblocksId: null,
        bitgoId: null
      },
      {
        networkId: 'APTOS',
        name: 'Aptos',
        coinType: 637,
        anchorageId: 'APT',
        fireblocksId: null,
        bitgoId: null
      },
      {
        networkId: 'APTOS_TESTNET',
        name: 'Aptos Testnet',
        coinType: 1,
        anchorageId: 'APT_T',
        fireblocksId: null,
        bitgoId: null
      },
      {
        networkId: 'ARBITRUM',
        name: 'Arbitrum',
        coinType: 9001,
        anchorageId: null,
        fireblocksId: 'ETH-AETH',
        bitgoId: 'ARBETH'
      },
      {
        networkId: 'ARBITRUM_SEPOLIA',
        name: 'Arbitrum Sepolia Testnet',
        coinType: 1,
        anchorageId: 'ETH_ARBITRUM_T',
        fireblocksId: null,
        bitgoId: 'TARBETH'
      },
      {
        networkId: 'ASTAR',
        name: 'Astar',
        coinType: 810,
        anchorageId: null,
        fireblocksId: 'ASTR_ASTR',
        bitgoId: null
      },
      {
        networkId: 'ASTAR_TESTNET',
        name: 'Astar Testnet',
        coinType: 1,
        anchorageId: null,
        fireblocksId: 'ASTR_TEST',
        bitgoId: null
      },
      {
        networkId: 'ATOM',
        name: 'Cosmos',
        coinType: 118,
        anchorageId: 'ATOM',
        fireblocksId: 'ATOM_COS',
        bitgoId: 'ATOM'
      },
      {
        networkId: 'ATOM_TESTNET',
        name: 'Atom Testnet',
        coinType: 1,
        anchorageId: null,
        fireblocksId: 'ATOM_COS_TEST',
        bitgoId: 'TATOM'
      },
      {
        networkId: 'AURORA',
        name: 'Aurora',
        coinType: 2570,
        anchorageId: null,
        fireblocksId: 'AURORA_DEV',
        bitgoId: null
      },
      {
        networkId: 'AVAX',
        name: 'Avalanche',
        coinType: 9000,
        anchorageId: null,
        fireblocksId: 'AVAX',
        bitgoId: 'AVAXC'
      },
      {
        networkId: 'AVAX_TESTNET',
        name: 'Avalanche Testnet',
        coinType: 1,
        anchorageId: null,
        fireblocksId: 'AVAXTEST',
        bitgoId: 'TAVAXC'
      },
      {
        networkId: 'AXELAR',
        name: 'Axelar',
        coinType: null,
        anchorageId: 'AXL',
        fireblocksId: null,
        bitgoId: null
      },
      {
        networkId: 'AXELAR_TESTNET',
        name: 'Axelar Testnet',
        coinType: 1,
        anchorageId: 'AXL_T',
        fireblocksId: null,
        bitgoId: null
      },
      {
        networkId: 'BABYLON',
        name: 'Babylon',
        coinType: null,
        anchorageId: 'BBN',
        fireblocksId: null,
        bitgoId: null
      },
      {
        networkId: 'BASE',
        name: 'Base',
        coinType: 8453,
        anchorageId: null,
        fireblocksId: 'BASECHAIN_ETH',
        bitgoId: null
      },
      {
        networkId: 'BASE_TESTNET',
        name: 'Base Testnet',
        coinType: 1,
        anchorageId: null,
        fireblocksId: 'BASECHAIN_ETH_TEST5',
        bitgoId: null
      },
      {
        networkId: 'BINANCE_SMART_CHAIN',
        name: 'Binance Smart Chain',
        coinType: 9006,
        anchorageId: null,
        fireblocksId: 'BNB_BSC',
        bitgoId: 'BSC'
      },
      {
        networkId: 'BINANCE_SMART_CHAIN_TESTNET',
        name: 'Binance Smart Chain Testnet',
        coinType: 1,
        anchorageId: null,
        fireblocksId: 'BNB_TEST',
        bitgoId: 'TBSC'
      },
      {
        networkId: 'BITCOIN',
        name: 'Bitcoin',
        coinType: 0,
        anchorageId: 'BTC',
        fireblocksId: 'BTC',
        bitgoId: 'BTC'
      },
      {
        networkId: 'BITCOIN_CASH',
        name: 'Bitcoin Cash',
        coinType: 145,
        anchorageId: 'BCH',
        fireblocksId: 'BCH',
        bitgoId: 'BCH'
      },
      {
        networkId: 'BITCOIN_CASH_TESTNET',
        name: 'Bitcoin Cash Testnet',
        coinType: 1,
        anchorageId: null,
        fireblocksId: 'BCH_TEST',
        bitgoId: null
      },
      {
        networkId: 'BITCOIN_SIGNET',
        name: 'Bitcoin Signet',
        coinType: 1,
        anchorageId: 'BTC_S',
        fireblocksId: null,
        bitgoId: 'TBTCSIG'
      },
      {
        networkId: 'BITCOIN_SV',
        name: 'BitcoinSV',
        coinType: 236,
        anchorageId: null,
        fireblocksId: 'BSV',
        bitgoId: null
      },
      {
        networkId: 'BITCOIN_SV_TESTNET',
        name: 'BitcoinSV Testnet',
        coinType: 1,
        anchorageId: null,
        fireblocksId: 'BSV_TEST',
        bitgoId: null
      },
      {
        networkId: 'BITCOIN_TESTNET',
        name: 'Bitcoin Testnet',
        coinType: 1,
        anchorageId: null,
        fireblocksId: 'BTC_TEST',
        bitgoId: null
      },
      {
        networkId: 'CARDANO',
        name: 'Cardano',
        coinType: 1815,
        anchorageId: null,
        fireblocksId: 'ADA',
        bitgoId: 'ADA'
      },
      {
        networkId: 'CARDANO_TESTNET',
        name: 'Cardano Testnet',
        coinType: 1,
        anchorageId: null,
        fireblocksId: 'ADA_TEST',
        bitgoId: null
      },
      {
        networkId: 'CELESTIA',
        name: 'Celestia',
        coinType: null,
        anchorageId: 'TIA',
        fireblocksId: null,
        bitgoId: 'TIA'
      },
      {
        networkId: 'CELO',
        name: 'Celo',
        coinType: 52752,
        anchorageId: null,
        fireblocksId: 'CELO',
        bitgoId: 'CELO'
      },
      {
        networkId: 'CELO_ALFAJORES',
        name: 'Celo Alfajores',
        coinType: null,
        anchorageId: null,
        fireblocksId: 'CELO_ALF',
        bitgoId: null
      },
      {
        networkId: 'CELO_BAKLAVA',
        name: 'Celo Baklava',
        coinType: 1,
        anchorageId: 'CGLD_TB',
        fireblocksId: 'CELO_BAK',
        bitgoId: null
      },
      {
        networkId: 'CHILIZ',
        name: 'Chiliz',
        coinType: null,
        anchorageId: null,
        fireblocksId: 'CHZ_$CHZ',
        bitgoId: null
      },
      {
        networkId: 'DABACUS',
        name: 'Dabacus',
        coinType: 521,
        anchorageId: null,
        fireblocksId: 'ABA',
        bitgoId: null
      },
      {
        networkId: 'DASH',
        name: 'Dash',
        coinType: 5,
        anchorageId: null,
        fireblocksId: 'DASH',
        bitgoId: 'DASH'
      },
      {
        networkId: 'DASH_TESTNET',
        name: 'Dash Testnet',
        coinType: 1,
        anchorageId: null,
        fireblocksId: 'DASH_TEST',
        bitgoId: null
      },
      {
        networkId: 'DOGECOIN',
        name: 'Dogecoin',
        coinType: 3,
        anchorageId: 'DOGE',
        fireblocksId: 'DOGE',
        bitgoId: 'DOGE'
      },
      {
        networkId: 'DOGECOIN_TESTNET',
        name: 'Dogecoin Testnet',
        coinType: 1,
        anchorageId: null,
        fireblocksId: 'DOGE_TEST',
        bitgoId: null
      },
      {
        networkId: 'DYDX_CHAIN',
        name: 'Dydx Chain',
        coinType: null,
        anchorageId: 'DYDX_CHAIN',
        fireblocksId: null,
        bitgoId: null
      },
      {
        networkId: 'DYDX_CHAIN_TESTNET',
        name: 'Dydx Testnet',
        coinType: 1,
        anchorageId: 'DYDX_CHAIN_T',
        fireblocksId: null,
        bitgoId: null
      },
      {
        networkId: 'EOS',
        name: 'EOS',
        coinType: 194,
        anchorageId: null,
        fireblocksId: 'EOS',
        bitgoId: 'EOS'
      },
      {
        networkId: 'EOS_TESTNET',
        name: 'EOS Testnet',
        coinType: 1,
        anchorageId: null,
        fireblocksId: 'EOS_TEST',
        bitgoId: null
      },
      {
        networkId: 'ETHEREUM',
        name: 'Ethereum',
        coinType: 60,
        anchorageId: 'ETH',
        fireblocksId: 'ETH',
        bitgoId: 'ETH'
      },
      {
        networkId: 'ETHEREUM_HOLESKY',
        name: 'Ethereum Holesky',
        coinType: 1,
        anchorageId: 'ETHHOL',
        fireblocksId: null,
        bitgoId: 'HTETH'
      },
      {
        networkId: 'ETHEREUM_SEPOLIA',
        name: 'Ethereum Sepolia',
        coinType: 1,
        anchorageId: 'ETHSEP',
        fireblocksId: null,
        bitgoId: null
      },
      {
        networkId: 'EVMOS',
        name: 'Evmos',
        coinType: null,
        anchorageId: 'EVMOS',
        fireblocksId: null,
        bitgoId: null
      },
      {
        networkId: 'EVMOS_TESTNET',
        name: 'Evmos Testnet',
        coinType: 1,
        anchorageId: 'EVMOS_T',
        fireblocksId: null,
        bitgoId: null
      },
      {
        networkId: 'FILECOIN',
        name: 'Filecoin',
        coinType: 461,
        anchorageId: 'FIL',
        fireblocksId: null,
        bitgoId: null
      },
      {
        networkId: 'FLOW_TESTNET',
        name: 'Flow Testnet',
        coinType: 1,
        anchorageId: 'FLOW_T',
        fireblocksId: null,
        bitgoId: null
      },
      {
        networkId: 'LITECOIN',
        name: 'Litecoin',
        coinType: 2,
        anchorageId: 'LTC',
        fireblocksId: 'LTC',
        bitgoId: 'LTC'
      },
      {
        networkId: 'LITECOIN_TESTNET',
        name: 'Litecoin Testnet',
        coinType: 1,
        anchorageId: null,
        fireblocksId: 'LTC_TEST',
        bitgoId: null
      },
      {
        networkId: 'NEUTRON',
        name: 'Neutron',
        coinType: null,
        anchorageId: 'NTRN',
        fireblocksId: null,
        bitgoId: null
      },
      {
        networkId: 'OASIS',
        name: 'Oasis',
        coinType: 474,
        anchorageId: 'ROSE',
        fireblocksId: null,
        bitgoId: null
      },
      {
        networkId: 'OASYS',
        name: 'Oasys',
        coinType: 685,
        anchorageId: null,
        fireblocksId: 'OAS',
        bitgoId: 'OAS'
      },
      {
        networkId: 'OASYS_TESTNET',
        name: 'Oasys Testnet',
        coinType: 1,
        anchorageId: null,
        fireblocksId: 'OAS_TEST',
        bitgoId: null
      },
      {
        networkId: 'OM_MANTRA',
        name: 'OM Mantra',
        coinType: null,
        anchorageId: 'OM_MANTRA',
        fireblocksId: null,
        bitgoId: null
      },
      {
        networkId: 'OM_MANTRA_TESTNET',
        name: 'OM Mantra Testnet',
        coinType: 1,
        anchorageId: 'OM_MANTRA_T',
        fireblocksId: null,
        bitgoId: null
      },
      {
        networkId: 'OPTIMISM',
        name: 'Optimism',
        coinType: 614,
        anchorageId: null,
        fireblocksId: 'ETH-OPT',
        bitgoId: 'OPETH'
      },
      {
        networkId: 'OPTIMISM_KOVAN',
        name: 'Optimism Kovan',
        coinType: 1,
        anchorageId: null,
        fireblocksId: 'ETH-OPT_KOV',
        bitgoId: null
      },
      {
        networkId: 'OPTIMISM_SEPOLIA',
        name: 'Optimism Sepolia',
        coinType: 1,
        anchorageId: null,
        fireblocksId: 'ETH-OPT_SEPOLIA',
        bitgoId: null
      },
      {
        networkId: 'OSMOSIS',
        name: 'Osmosis',
        coinType: 10000118,
        anchorageId: 'OSMO',
        fireblocksId: 'OSMO',
        bitgoId: 'OSMO'
      },
      {
        networkId: 'OSMOSIS_TESTNET',
        name: 'Osmosis Testnet',
        coinType: 1,
        anchorageId: null,
        fireblocksId: 'OSMO_TEST',
        bitgoId: null
      },
      {
        networkId: 'PLUME_SEPOLIA',
        name: 'Plume Sepolia Testnet',
        coinType: 1,
        anchorageId: 'ETH_PLUME_T',
        fireblocksId: null,
        bitgoId: null
      },
      {
        networkId: 'POLKADOT',
        name: 'Polkadot',
        coinType: 354,
        anchorageId: null,
        fireblocksId: 'DOT',
        bitgoId: 'DOT'
      },
      {
        networkId: 'POLYGON',
        name: 'Polygon',
        coinType: 966,
        anchorageId: 'POL_POLYGON',
        fireblocksId: 'MATIC_POLYGON',
        bitgoId: 'POLYGON'
      },
      {
        networkId: 'PROVENANCE',
        name: 'Provenance',
        coinType: 505,
        anchorageId: 'HASH',
        fireblocksId: null,
        bitgoId: 'HASH'
      },
      {
        networkId: 'RARIMO',
        name: 'Rarimo',
        coinType: null,
        anchorageId: 'RMO',
        fireblocksId: null,
        bitgoId: null
      },
      {
        networkId: 'RIPPLE',
        name: 'Ripple',
        coinType: 144,
        anchorageId: 'XRP',
        fireblocksId: 'XRP',
        bitgoId: 'XRP'
      },
      {
        networkId: 'RIPPLE_TESTNET',
        name: 'Ripple Testnet',
        coinType: 1,
        anchorageId: null,
        fireblocksId: 'XRP_TEST',
        bitgoId: null
      },
      {
        networkId: 'SEI',
        name: 'Sei',
        coinType: 19000118,
        anchorageId: 'SEI',
        fireblocksId: 'SEI',
        bitgoId: 'SEI'
      },
      {
        networkId: 'SEI_TESTNET',
        name: 'Sei Testnet',
        coinType: 1,
        anchorageId: 'SEI_T',
        fireblocksId: 'SEI_TEST',
        bitgoId: null
      },
      {
        networkId: 'SOLANA',
        name: 'Solana',
        coinType: 501,
        anchorageId: null,
        fireblocksId: 'SOL',
        bitgoId: 'SOL'
      },
      {
        networkId: 'SOLANA_TESTNET',
        name: 'Solana Testnet',
        coinType: 1,
        anchorageId: null,
        fireblocksId: 'SOL_TEST',
        bitgoId: null
      },
      {
        networkId: 'SOLONA_DEVNET',
        name: 'Solana Devnet',
        coinType: 1,
        anchorageId: null,
        fireblocksId: 'SOL_TD',
        bitgoId: 'TSOL'
      },
      {
        networkId: 'STARKNET',
        name: 'Starknet',
        coinType: 9004,
        anchorageId: 'STRK_STARKNET',
        fireblocksId: null,
        bitgoId: null
      },
      {
        networkId: 'STARKNET_TESTNET',
        name: 'Starknet Testnet',
        coinType: 1,
        anchorageId: 'STRK_STARKNET_T',
        fireblocksId: null,
        bitgoId: null
      },
      {
        networkId: 'STELLAR_LUMENS',
        name: 'Stellar Lumens',
        coinType: 148,
        anchorageId: null,
        fireblocksId: 'XLM',
        bitgoId: 'XLM'
      },
      {
        networkId: 'STELLAR_LUMENS_TESTNET',
        name: 'Stellar Lumens Testnet',
        coinType: 1,
        anchorageId: null,
        fireblocksId: 'XLM_TEST',
        bitgoId: null
      },
      {
        networkId: 'STRIDE',
        name: 'Stride',
        coinType: null,
        anchorageId: 'STRD',
        fireblocksId: null,
        bitgoId: null
      },
      {
        networkId: 'SUI_TESTNET',
        name: 'Sui Testnet',
        coinType: 1,
        anchorageId: 'SUI_T',
        fireblocksId: null,
        bitgoId: 'TSUI'
      },
      {
        networkId: 'SUI',
        name: 'Sui',
        coinType: 784,
        anchorageId: 'SUI',
        fireblocksId: null,
        bitgoId: 'SUI'
      },
      {
        networkId: 'TELOS',
        name: 'Telos',
        coinType: 424,
        anchorageId: null,
        fireblocksId: 'TELOS',
        bitgoId: null
      },
      {
        networkId: 'TELOS_TESTNET',
        name: 'Telos Testnet',
        coinType: 1,
        anchorageId: null,
        fireblocksId: 'TELOS_TEST',
        bitgoId: null
      },
      {
        networkId: 'TEZOS',
        name: 'Tezos',
        coinType: 1729,
        anchorageId: null,
        fireblocksId: 'XTZ',
        bitgoId: 'XTZ'
      },
      {
        networkId: 'TEZOS_TESTNET',
        name: 'Tezos Testnet',
        coinType: 1,
        anchorageId: null,
        fireblocksId: 'XTZ_TEST',
        bitgoId: null
      },
      {
        networkId: 'TRON',
        name: 'Tron',
        coinType: 195,
        anchorageId: null,
        fireblocksId: 'TRX',
        bitgoId: 'TRX'
      },
      {
        networkId: 'TRON_TESTNET',
        name: 'Tron Testnet',
        coinType: 1,
        anchorageId: null,
        fireblocksId: 'TRX_TEST',
        bitgoId: null
      },
      {
        networkId: 'VANA',
        name: 'Vana',
        coinType: null,
        anchorageId: 'VANA_VANA',
        fireblocksId: null,
        bitgoId: null
      },
      {
        networkId: 'VANA_MOKSHA_TESTNET',
        name: 'Vana Moksha Testnet',
        coinType: 1,
        anchorageId: 'VANA_VANA_MOKSHA_T',
        fireblocksId: null,
        bitgoId: null
      },
      {
        networkId: 'ZKSYNC_SEPOLIA',
        name: 'ZKsync Sepolia Testnet',
        coinType: 1,
        anchorageId: 'ETH_ZKSYNC_T',
        fireblocksId: null,
        bitgoId: null
      }
    ]
  }
}
