import { LoggerService } from '@narval/nestjs-shared'
import { Injectable } from '@nestjs/common'
import { Provider } from '../../core/type/provider.type'
import { NetworkRepository } from '../repository/network.repository'

@Injectable()
export class NetworkSeed {
  constructor(
    private readonly networkRepository: NetworkRepository,
    private readonly logger: LoggerService
  ) {}

  // IMPORTANT: There's already a data migration for base networks.
  // See 20250115095035_add_network_table_and_data/migration.sql
  async seed(): Promise<void> {
    this.logger.log('🌐 Seeding networks')

    await this.networkRepository.bulkCreate(
      this.getNetworks().map((network) => ({
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
            : [])
        ]
      }))
    )
  }

  getNetworks() {
    return [
      {
        networkId: 'AETH',
        coinType: 514,
        name: 'Aetherius',
        fireblocksId: 'ETH-AETH'
      },
      {
        networkId: 'AEVO',
        coinType: null,
        name: 'Aevo',
        fireblocksId: 'AEVO'
      },
      {
        networkId: 'AGORIC',
        coinType: 564,
        name: 'Agoric',
        anchorageId: 'BLD'
      },
      {
        networkId: 'ALEPH_ZERO',
        coinType: 643,
        name: 'Aleph Zero',
        fireblocksId: 'ALEPH_ZERO_EVM'
      },
      {
        networkId: 'ALGORAND',
        coinType: 283,
        name: 'Algorand',
        fireblocksId: 'ALGO'
      },
      {
        networkId: 'ALGORAND_TESTNET',
        coinType: 1,
        name: 'Algorand Testnet',
        fireblocksId: 'ALGO_TEST'
      },
      {
        networkId: 'ALLORA',
        coinType: null,
        name: 'Allora',
        anchorageId: 'ALLO'
      },
      {
        networkId: 'ALLORA_TESTNET',
        coinType: 1,
        name: 'Allora Testnet',
        anchorageId: 'ALLO_T'
      },
      {
        networkId: 'APTOS',
        coinType: 637,
        name: 'Aptos',
        anchorageId: 'APT'
      },
      {
        networkId: 'APTOS_TESTNET',
        coinType: 1,
        name: 'Aptos Testnet',
        anchorageId: 'APT_T'
      },
      {
        networkId: 'ARBITRUM_SEPOLIA',
        coinType: 1,
        name: 'Arbitrum Sepolia Testnet',
        anchorageId: 'ARBITRUM_SEPOLIA'
      },
      {
        networkId: 'ASTAR',
        coinType: 810,
        name: 'Astar',
        fireblocksId: 'ASTR_ASTR'
      },
      {
        networkId: 'ASTAR_TESTNET',
        coinType: 1,
        name: 'Astar Testnet',
        fireblocksId: 'ASTR_TEST'
      },
      {
        networkId: 'ATOM',
        coinType: 118,
        name: 'Atom',
        anchorageId: 'COSMOS',
        fireblocksId: 'ATOM_COS'
      },
      {
        networkId: 'ATOM_TESTNET',
        coinType: 1,
        name: 'Atom Testnet',
        fireblocksId: 'ATOM_COS_TEST'
      },
      {
        networkId: 'AURORA',
        coinType: 2570,
        name: 'Aurora',
        fireblocksId: 'AURORA_DEV'
      },
      {
        networkId: 'AVAX',
        coinType: 9000,
        name: 'Avalanche',
        fireblocksId: 'AVAX'
      },
      {
        networkId: 'AVAX_TESTNET',
        coinType: 1,
        name: 'Avalanche Testnet',
        fireblocksId: 'AVAXTEST'
      },
      {
        networkId: 'AXELAR',
        coinType: null,
        name: 'Axelar',
        anchorageId: 'AXL'
      },
      {
        networkId: 'AXELAR_TESTNET',
        coinType: 1,
        name: 'Axelar Testnet',
        anchorageId: 'AXL_T'
      },
      {
        networkId: 'BABYLON',
        coinType: null,
        name: 'Babylon',
        anchorageId: 'BBN'
      },
      {
        networkId: 'BASE',
        coinType: 8453,
        name: 'Base',
        fireblocksId: 'BASECHAIN_ETH'
      },
      {
        networkId: 'BASE_TESTNET',
        coinType: 1,
        name: 'Base Testnet',
        fireblocksId: 'BASECHAIN_ETH_TEST5'
      },
      {
        networkId: 'BINANCE_SMART_CHAIN',
        coinType: 9006,
        name: 'Binance Smart Chain',
        fireblocksId: 'BNB_BSC'
      },
      {
        networkId: 'BINANCE_SMART_CHAIN_TESTNET',
        coinType: 1,
        name: 'Binance Smart Chain Testnet',
        fireblocksId: 'BNB_TEST'
      },
      {
        networkId: 'BITCOIN',
        coinType: 0,
        name: 'Bitcoin',
        anchorageId: 'BTC',
        fireblocksId: 'BTC'
      },
      {
        networkId: 'BITCOIN_CASH',
        coinType: 145,
        name: 'Bitcoin Cash',
        anchorageId: 'BCH',
        fireblocksId: 'BCH'
      },
      {
        networkId: 'BITCOIN_CASH_TESTNET',
        coinType: 1,
        name: 'Bitcoin Cash Testnet',
        fireblocksId: 'BCH_TEST'
      },
      {
        networkId: 'BITCOIN_SIGNET',
        coinType: 1,
        name: 'Bitcoin Signet',
        anchorageId: 'BTC_S'
      },
      {
        networkId: 'BITCOIN_SV',
        coinType: 236,
        name: 'BitcoinSV',
        fireblocksId: 'BSV'
      },
      {
        networkId: 'BITCOIN_SV_TESTNET',
        coinType: 1,
        name: 'BitcoinSV Testnet',
        fireblocksId: 'BSV_TEST'
      },
      {
        networkId: 'BITCOIN_TESTNET',
        coinType: 1,
        name: 'Bitcoin Testnet',
        fireblocksId: 'BTC_TEST'
      },
      {
        networkId: 'CARDANO',
        coinType: 1815,
        name: 'Cardano',
        fireblocksId: 'ADA'
      },
      {
        networkId: 'CARDANO_TESTNET',
        coinType: 1,
        name: 'Cardano Testnet',
        fireblocksId: 'ADA_TEST'
      },
      {
        networkId: 'CELESTIA',
        coinType: null,
        name: 'Celestia',
        anchorageId: 'TIA'
      },
      {
        networkId: 'CELO',
        coinType: 52752,
        name: 'Celo',
        fireblocksId: 'CELO'
      },
      {
        networkId: 'CELO_ALFAJORES',
        coinType: null,
        name: 'Celo Alfajores',
        fireblocksId: 'CELO_ALF'
      },
      {
        networkId: 'CELO_BAKLAVA',
        coinType: 1,
        name: 'Celo Baklava',
        anchorageId: 'CGLD_TB',
        fireblocksId: 'CELO_BAK'
      },
      {
        networkId: 'CHILIZ',
        coinType: null,
        name: 'Chiliz',
        fireblocksId: 'CHZ_$CHZ'
      },
      {
        networkId: 'DABACUS',
        coinType: 521,
        name: 'Dabacus',
        fireblocksId: 'ABA'
      },
      {
        networkId: 'DOGECOIN',
        coinType: 3,
        name: 'Dogecoin',
        anchorageId: 'DOGE',
        fireblocksId: 'DOGE'
      },
      {
        networkId: 'DOGECOIN_TESTNET',
        coinType: 1,
        name: 'Dogecoin Testnet',
        fireblocksId: 'DOGE_TEST'
      },
      {
        networkId: 'DYDX_CHAIN',
        coinType: null,
        name: 'Dydx Chain',
        anchorageId: 'DYDX_CHAIN'
      },
      {
        networkId: 'DYDX_CHAIN_TESTNET',
        coinType: 1,
        name: 'Dydx Testnet',
        anchorageId: 'DYDX_CHAIN_T'
      },
      {
        networkId: 'ETHEREUM',
        coinType: 60,
        name: 'Ethereum',
        anchorageId: 'ETH',
        fireblocksId: 'ETH'
      },
      {
        networkId: 'ETHEREUM_HOLESKY',
        coinType: 1,
        name: 'Ethereum Holešky',
        anchorageId: 'ETHHOL'
      },
      {
        networkId: 'ETHEREUM_SEPOLIA',
        coinType: 1,
        name: 'Ethereum Sepolia',
        anchorageId: 'ETHSEP'
      },
      {
        networkId: 'EVMOS',
        coinType: null,
        name: 'Evmos',
        anchorageId: 'EVMOS'
      },
      {
        networkId: 'EVMOS_TESTNET',
        coinType: 1,
        name: 'Evmos Testnet',
        anchorageId: 'EVMOS_T'
      },
      {
        networkId: 'FILECOIN',
        coinType: 461,
        name: 'Filecoin',
        anchorageId: 'FIL'
      },
      {
        networkId: 'FLOW_TESTNET',
        coinType: 1,
        name: 'Flow Testnet',
        anchorageId: 'FLOW_T'
      },
      {
        networkId: 'LITECOIN',
        coinType: 2,
        name: 'Litecoin',
        anchorageId: 'LTC',
        fireblocksId: 'LTC'
      },
      {
        networkId: 'LITECOIN_TESTNET',
        coinType: 1,
        name: 'Litecoin Testnet',
        fireblocksId: 'LTC_TEST'
      },
      {
        networkId: 'NEUTRON',
        coinType: null,
        name: 'Neutron',
        anchorageId: 'NTRN'
      },
      {
        networkId: 'OASIS',
        coinType: 474,
        name: 'Oasis',
        anchorageId: 'OAC'
      },
      {
        networkId: 'OM_MANTRA',
        coinType: null,
        name: 'OM Mantra',
        anchorageId: 'OM_MANTRA'
      },
      {
        networkId: 'OM_MANTRA_TESTNET',
        coinType: 1,
        name: 'OM Mantra Testnet',
        anchorageId: 'OM_MANTRA_T'
      },
      {
        networkId: 'OSMOSIS',
        coinType: 10000118,
        name: 'Osmosis',
        anchorageId: 'OSMO',
        fireblocksId: 'OSMO'
      },
      {
        networkId: 'PLUME_SEPOLIA',
        coinType: 1,
        name: 'Plume Sepolia Testnet',
        anchorageId: 'PLUME_SEPOLIA'
      },
      {
        networkId: 'POLYGON',
        coinType: 966,
        name: 'Polygon',
        anchorageId: 'POLYGON',
        fireblocksId: 'MATIC_POLYGON'
      },
      {
        networkId: 'PROVENANCE',
        coinType: 505,
        name: 'Provenance',
        anchorageId: 'HASH'
      },
      {
        networkId: 'RARIMO',
        coinType: null,
        name: 'Rarimo',
        anchorageId: 'RMO'
      },
      {
        networkId: 'RIPPLE',
        coinType: 144,
        name: 'Ripple',
        anchorageId: 'XRP',
        fireblocksId: 'XRP'
      },
      {
        networkId: 'RIPPLE_TESTNET',
        coinType: 1,
        name: 'Ripple Testnet',
        fireblocksId: 'XRP_TEST'
      },
      {
        networkId: 'SEI',
        coinType: 19000118,
        name: 'Sei',
        anchorageId: 'SEI',
        fireblocksId: 'SEI'
      },
      {
        networkId: 'SEI_TESTNET',
        coinType: 1,
        name: 'Sei Testnet',
        anchorageId: 'SEI_T',
        fireblocksId: 'SEI_TEST'
      },
      {
        networkId: 'SOLANA',
        coinType: 501,
        name: 'Solana',
        fireblocksId: 'SOL'
      },
      {
        networkId: 'SOLANA_TESTNET',
        coinType: 1,
        name: 'Solana Testnet',
        anchorageId: 'SOL_TD',
        fireblocksId: 'SOL_TEST'
      },
      {
        networkId: 'STARKNET',
        coinType: 9004,
        name: 'Starknet',
        anchorageId: 'STARK_STARKNET'
      },
      {
        networkId: 'STARKNET_TESTNET',
        coinType: 1,
        name: 'Starknet Testnet',
        anchorageId: 'STRK_STARKNET_T'
      },
      {
        networkId: 'STELLAR_LUMENS',
        coinType: 148,
        name: 'Stellar Lumens',
        fireblocksId: 'XLM'
      },
      {
        networkId: 'STELLAR_LUMENS_TESTNET',
        coinType: 1,
        name: 'Stellar Lumens Testnet',
        fireblocksId: 'XLM_TEST'
      },
      {
        networkId: 'STRIDE',
        coinType: null,
        name: 'Stride',
        anchorageId: 'STRD'
      },
      {
        networkId: 'SUI_TESTNET',
        coinType: 1,
        name: 'Sui Testnet',
        anchorageId: 'SUI_T'
      },
      {
        networkId: 'TRON',
        coinType: 195,
        name: 'Tron',
        fireblocksId: 'TRX'
      },
      {
        networkId: 'TRON_TESTNET',
        coinType: 1,
        name: 'Tron Testnet',
        fireblocksId: 'TRX_TEST'
      },
      {
        networkId: 'VANA',
        coinType: null,
        name: 'Vana',
        anchorageId: 'VANA'
      },
      {
        networkId: 'VANA_MOKSHA_TESTNET',
        coinType: 1,
        name: 'Vana Moksha Testnet',
        anchorageId: 'VANA_MOKSHA_TESTNET'
      },
      {
        networkId: 'ZKSYNC_SEPOLIA',
        coinType: 1,
        name: 'ZKsync Sepolia Testnet',
        anchorageId: 'ZKSYNC_SEPOLIA'
      },
      {
        networkId: 'POLKADOT',
        coinType: 354,
        name: 'Polkadot',
        fireblocksId: 'DOT'
      },
      {
        networkId: 'EOS',
        coinType: 194,
        name: 'EOS',
        fireblocksId: 'EOS'
      },
      {
        networkId: 'EOS_TESTNET',
        coinType: 1,
        name: 'EOS Testnet',
        fireblocksId: 'EOS_TEST'
      },
      {
        networkId: 'OASYS',
        coinType: 685,
        name: 'Oasys',
        fireblocksId: 'OAS'
      },
      {
        networkId: 'OASYS_TESTNET',
        coinType: 1,
        name: 'Oasys Testnet',
        fireblocksId: 'OAS_TEST'
      },
      {
        networkId: 'OSMOSIS_TESTNET',
        coinType: 1,
        name: 'Osmosis Testnet',
        fireblocksId: 'OSMO_TEST'
      },
      {
        networkId: 'TELOS',
        coinType: 424,
        name: 'Telos',
        fireblocksId: 'TELOS'
      },
      {
        networkId: 'TELOS_TESTNET',
        coinType: 1,
        name: 'Telos Testnet',
        fireblocksId: 'TELOS_TEST'
      },
      {
        networkId: 'TEZOS',
        coinType: 1729,
        name: 'Tezos',
        fireblocksId: 'XTZ'
      },
      {
        networkId: 'TEZOS_TESTNET',
        coinType: 1,
        name: 'Tezos Testnet',
        fireblocksId: 'XTZ_TEST'
      },
      {
        networkId: 'DASH',
        coinType: 5,
        name: 'Dash',
        fireblocksId: 'DASH'
      },
      {
        networkId: 'DASH_TESTNET',
        coinType: 1,
        name: 'Dash Testnet',
        fireblocksId: 'DASH_TEST'
      },
      {
        networkId: 'OPTIMISM',
        coinType: 614,
        name: 'Optimism',
        fireblocksId: 'ETH-OPT'
      },
      {
        networkId: 'OPTIMISM_SEPOLIA',
        coinType: 1,
        name: 'Optimism Sepolia',
        fireblocksId: 'ETH-OPT_SEPOLIA'
      },
      {
        networkId: 'OPTIMISM_KOVAN',
        coinType: 1,
        name: 'Optimism Kovan',
        fireblocksId: 'ETH-OPT_KOV'
      }
    ]
  }
}
