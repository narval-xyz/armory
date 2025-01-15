import { LoggerService } from '@narval/nestjs-shared'
import { Injectable } from '@nestjs/common'
import { NetworkRepository } from '../../../persistence/repository/network.repository'
import { Asset } from '../../type/asset.type'
import { Network } from '../../type/network.type'
import { Provider } from '../../type/provider.type'
import { getExternalNetwork } from '../../util/network.util'

type FireblocksAsset = {
  contractAddress: string
  decimals: number
  id: string
  issuerAddress?: string
  name: string
  nativeAsset: string
  type: string
}

const FIREBLOCKS_ASSETS: FireblocksAsset[] = [
  {
    contractAddress: '0xEA6A3E367e96521fD9E8296425a44EFa6aee82da',
    decimals: 0,
    id: '$ACM_$CHZ',
    name: 'AC Milan ($CHZ)',
    nativeAsset: 'CHZ_$CHZ',
    type: 'ERC20'
  },
  {
    contractAddress: '0x235639F72E127bBdd1509BFC9DC6e2caeb3FB741',
    decimals: 0,
    id: '$ASR_$CHZ',
    name: 'AS Roma ($CHZ)',
    nativeAsset: 'CHZ_$CHZ',
    type: 'ERC20'
  },
  {
    contractAddress: '0x4c3E460b8e8285DE57c8B1B2B688847B995B71D6',
    decimals: 0,
    id: '$ATM_$CHZ',
    name: 'Atlético de Madrid ($CHZ)',
    nativeAsset: 'CHZ_$CHZ',
    type: 'ERC20'
  },
  {
    contractAddress: '0xECc000EBd318bee2a052EB174A71fAF2C3c9e898',
    decimals: 0,
    id: '$BAR_$CHZ',
    name: 'FC Barcelona ($CHZ)',
    nativeAsset: 'CHZ_$CHZ',
    type: 'ERC20'
  },
  {
    contractAddress: '0xf30D150250F5301ef34A0E4a64aaFa93F242d87A',
    decimals: 0,
    id: '$CITY_$CHZ',
    name: 'Manchester City FC ($CHZ)',
    nativeAsset: 'CHZ_$CHZ',
    type: 'ERC20'
  },
  {
    contractAddress: '0xEE06A81a695750E71a662B51066F2c74CF4478a0',
    decimals: 18,
    id: '$DG',
    name: 'Decentral.games',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x67e410B0e722ff2eec6dDCC7AefD3EdBC2B9078d',
    decimals: 0,
    id: '$INTER_$CHZ',
    name: 'Inter Milan ($CHZ)',
    nativeAsset: 'CHZ_$CHZ',
    type: 'ERC20'
  },
  {
    contractAddress: '0x14A5750B0e54b57D12767B84A326C9fE59472Da5',
    decimals: 0,
    id: '$JUV_$CHZ',
    name: 'Juventus ($CHZ)',
    nativeAsset: 'CHZ_$CHZ',
    type: 'ERC20'
  },
  {
    contractAddress: '0xd44fC47dBe5751ed36C3f549e217Dab749Aa4039',
    decimals: 0,
    id: '$LEG_$CHZ',
    name: 'Legia Warsaw ($CHZ)',
    nativeAsset: 'CHZ_$CHZ',
    type: 'ERC20'
  },
  {
    contractAddress: '0xC7456e8f7CE7BDdBcbF719d0a90811a35dD3d363',
    decimals: 0,
    id: '$NAP_$CHZ',
    name: 'Napoli ($CHZ)',
    nativeAsset: 'CHZ_$CHZ',
    type: 'ERC20'
  },
  {
    contractAddress: '0x6fc212cdE3b420733A88496CbdbB15d85beAb1Ca',
    decimals: 0,
    id: '$PSG_$CHZ',
    name: 'Paris Saint-Germain ($CHZ)',
    nativeAsset: 'CHZ_$CHZ',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 6,
    id: '$WIF_SOL',
    issuerAddress: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',
    name: 'dogwifhat',
    nativeAsset: 'SOL',
    type: 'SOL_ASSET'
  },
  {
    contractAddress: '0x111111111117dC0aa78b770fA6A738034120C302',
    decimals: 18,
    id: '1INCH',
    name: '1INCH Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x111111111117dC0aa78b770fA6A738034120C302',
    decimals: 18,
    id: '1INCH_BSC',
    name: '1INCH Token (BSC)',
    nativeAsset: 'BNB_BSC',
    type: 'BEP20'
  },
  {
    contractAddress: '0xfDBc1aDc26F0F8f8606a5d63b7D3a3CD21c22B23',
    decimals: 8,
    id: '1WO',
    name: '1World',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xC96c1609A1a45CcC667B2b7FA6508e29617f7b69',
    decimals: 18,
    id: '2GT',
    name: '2GT_token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xde50da7f5966eFe1869349ff2242D7AD932Eb785',
    decimals: 18,
    id: '7UT',
    name: '7EVEN Utility Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xe8272210954eA85DE6D2Ae739806Ab593B5d9c51',
    decimals: 18,
    id: 'A5T',
    name: 'Alpha5Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xFFC97d72E13E01096502Cb8Eb52dEe56f74DAD7B',
    decimals: 18,
    id: 'AAAVE',
    name: 'Aave interest bearing AAVE',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
    decimals: 18,
    id: 'AAVE',
    name: 'Aave Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xfb6115445Bff7b52FeB98650C87f44907E58f802',
    decimals: 18,
    id: 'AAVE_BSC',
    name: 'Binance-Peg Aave Token (BSC)',
    nativeAsset: 'BNB_BSC',
    type: 'BEP20'
  },
  {
    contractAddress: '0x63a72806098Bd3D9520cC43356dD78afe5D386D9',
    decimals: 18,
    id: 'AAVE_E_AVAX',
    name: 'Aave Token (Avalanche)',
    nativeAsset: 'AVAX',
    type: 'ERC20'
  },
  {
    contractAddress: '0xD6DF932A45C0f255f85145f286eA0b292B21C90B',
    decimals: 18,
    id: 'AAVE_POLYGON',
    name: 'Aave (Polygon)',
    nativeAsset: 'MATIC_POLYGON',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 2,
    id: 'ABA_USD',
    name: 'USD (ABA)',
    nativeAsset: 'ABA_USD',
    type: 'FIAT'
  },
  {
    contractAddress: '0xE1BA0FB44CCb0D11b80F92f4f8Ed94CA3fF51D00',
    decimals: 18,
    id: 'ABAT',
    name: 'Aave BAT',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x0E8d6b471e332F140e7d9dbB99E5E3822F728DA6',
    decimals: 18,
    id: 'ABYSS',
    name: 'The Abyss',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xEd04915c23f00A313a544955524EB7DBD823143d',
    decimals: 8,
    id: 'ACH',
    name: 'Alchemy Pay',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 9,
    id: 'ACM_SOL',
    issuerAddress: 'ACUMENkbnxQPAsN8XrNA11sY3NmXDNKVCqS82EiDqMYB',
    name: 'Acumen Governance Token (Solana)',
    nativeAsset: 'SOL',
    type: 'SOL_ASSET'
  },
  {
    contractAddress: '',
    decimals: 6,
    id: 'ADA',
    name: 'ADA (Cardano)',
    nativeAsset: 'ADA',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47',
    decimals: 18,
    id: 'ADA_BSC',
    name: 'Binance-Peg Cardano (BSC)',
    nativeAsset: 'BNB_BSC',
    type: 'BEP20'
  },
  {
    contractAddress: '',
    decimals: 6,
    id: 'ADA_TEST',
    name: 'ADA Test',
    nativeAsset: 'ADA_TEST',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '0x028171bCA77440897B824Ca71D1c56caC55b68A3',
    decimals: 18,
    id: 'ADAI',
    name: 'Aave interest bearing DAI',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xfC1E690f61EFd961294b3e1Ce3313fBD8aa4f85d',
    decimals: 18,
    id: 'ADAI_OLD',
    name: 'Aave Interest bearing DAI (Old)',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xc3FdbadC7c795EF1D6Ba111e06fF8F16A20Ea539',
    decimals: 18,
    id: 'ADDY_POLYGON',
    name: 'Adamant',
    nativeAsset: 'MATIC_POLYGON',
    type: 'ERC20'
  },
  {
    contractAddress: '0xE69a353b3152Dd7b706ff7dD40fe1d18b7802d31',
    decimals: 18,
    id: 'ADH',
    name: 'AdHive',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xADE00C28244d5CE17D72E40330B1c318cD12B7c3',
    decimals: 18,
    id: 'ADX',
    name: 'AdEx Network',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x3a3A65aAb0dd2A17E3F1947bA16138cd37d08c04',
    decimals: 18,
    id: 'AETH',
    name: 'Aave Interest bearing ETH',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'AEVO',
    name: 'Aevo',
    nativeAsset: 'AEVO',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '0x8eB24319393716668D768dCEC29356ae9CfFe285',
    decimals: 8,
    id: 'AGI',
    name: 'SingularityNET',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x5B7533812759B45C2B44C19e320ba2cD2681b542',
    decimals: 8,
    id: 'AGIX',
    name: 'SingularityNET Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x32353A6C91143bfd6C7d363B546e62a9A2489A20',
    decimals: 18,
    id: 'AGLD',
    name: 'Adventure Gold',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'AGNG_TEST',
    name: 'Agung (Testnet)',
    nativeAsset: 'AGNG_TEST',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '0x69CF1e63090Acf1e1E16ec0066055f8973fc9Ec8',
    decimals: 18,
    id: 'AGX',
    name: 'AGX Coin',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x8Ab7404063Ec4DBcfd4598215992DC3F8EC853d7',
    decimals: 18,
    id: 'AKRO',
    name: 'Akropolis',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xdBdb4d16EdA451D0503b854CF79D55697F90c8DF',
    decimals: 18,
    id: 'ALCX',
    name: 'Alchemix',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xb26C4B3Ca601136Daf98593feAeff9E0CA702a8D',
    decimals: 18,
    id: 'ALD',
    name: 'Aladdin Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xB5495A8D85EE18cfD0d2816993658D88aF08bEF4',
    decimals: 0,
    id: 'ALDDAO',
    name: 'Aladdin DAO Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x27702a26126e0B3702af63Ee09aC4d1A084EF628',
    decimals: 18,
    id: 'ALEPH',
    name: 'aleph.im v2',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'ALEPH_ZERO_EVM',
    name: 'Aleph Zero EVM',
    nativeAsset: 'ALEPH_ZERO_EVM',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '0x0100546F2cD4C9D97f798fFC9755E47865FF7Ee6',
    decimals: 18,
    id: 'ALETH',
    name: 'Alchemix ETH',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x16B0a1a87ae8aF5C792faBC429C4FE248834842B',
    decimals: 18,
    id: 'ALG',
    name: 'Algory',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 6,
    id: 'ALGO',
    name: 'Algorand',
    nativeAsset: 'ALGO',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '',
    decimals: 6,
    id: 'ALGO_TEST',
    name: 'Algorand Test',
    nativeAsset: 'ALGO_TEST',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '',
    decimals: 6,
    id: 'ALGO_USDC_2V6G',
    issuerAddress: '10458941',
    name: 'USDC Test on Algorand',
    nativeAsset: 'ALGO_TEST',
    type: 'ALGO_ASSET'
  },
  {
    contractAddress: '',
    decimals: 6,
    id: 'ALGO_USDC_UV4I',
    issuerAddress: '31566704',
    name: 'USDC on Algorand',
    nativeAsset: 'ALGO',
    type: 'ALGO_ASSET'
  },
  {
    contractAddress: '',
    decimals: 6,
    id: 'ALGO_USDT_I3ZH',
    issuerAddress: '312769',
    name: 'USDT on Algorand',
    nativeAsset: 'ALGO',
    type: 'ALGO_ASSET'
  },
  {
    contractAddress: '0x6B0b3a982b4634aC68dD83a4DBF02311cE324181',
    decimals: 18,
    id: 'ALI',
    name: 'Artificial Liquid Intelligence Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xAC51066d7bEC65Dc4589368da368b212745d63E8',
    decimals: 6,
    id: 'ALICE',
    name: 'ALICE',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xA64BD6C70Cb9051F6A9ba1F163Fdc07E0DfB5F84',
    decimals: 18,
    id: 'ALINK',
    name: 'Aave Interest bearing LINK',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xa06bC25B5805d5F8d82847D191Cb4Af5A3e873E0',
    decimals: 18,
    id: 'ALINK_V2',
    name: 'Aave interest bearing LINK v2',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x6C16119B20fa52600230F074b349dA3cb861a7e3',
    decimals: 18,
    id: 'ALK',
    name: 'Alkemi_Network_DAO_Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x7cA4408137eb639570F8E647d9bD7B7E8717514A',
    decimals: 18,
    id: 'ALPA',
    name: 'AlpaToken',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x8F0528cE5eF7B51152A59745bEfDD91D97091d2F',
    decimals: 18,
    id: 'ALPACA_BSC',
    name: 'AlpacaToken (BSC)',
    nativeAsset: 'BNB_BSC',
    type: 'BEP20'
  },
  {
    contractAddress: '0xa1faa113cbE53436Df28FF0aEe54275c13B40975',
    decimals: 18,
    id: 'ALPHA',
    name: 'AlphaToken',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x8263CD1601FE73C066bf49cc09841f35348e3be0',
    decimals: 18,
    id: 'ALU_BSC',
    name: 'Altura',
    nativeAsset: 'BNB_BSC',
    type: 'BEP20'
  },
  {
    contractAddress: '0xBC6DA0FE9aD5f3b0d58160288917AA56653660E9',
    decimals: 18,
    id: 'ALUSD',
    name: 'Alchemix USD',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x4DC3643DbC642b72C158E7F3d2ff232df61cb6CE',
    decimals: 18,
    id: 'AMB',
    name: 'Ambrosus',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xCA0e7269600d353F70b14Ad118A49575455C0f2f',
    decimals: 18,
    id: 'AMLT',
    name: 'AMLT',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x737F98AC8cA59f2C68aD658E3C3d8C8963E40a4c',
    decimals: 18,
    id: 'AMN',
    name: 'Amon',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'AMOY_POLYGON_TEST',
    name: 'Matic Gas Token (Polygon Test Amoy)',
    nativeAsset: 'AMOY_POLYGON_TEST',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '0xfF20817765cB7f73d4bde2e66e067E58D11095C2',
    decimals: 18,
    id: 'AMP',
    name: 'Amp',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xD46bA6D942050d489DBd938a2C909A5d5039A161',
    decimals: 9,
    id: 'AMPL',
    name: 'Ampleforth',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x0F3ADC247E91c3c50bC08721355A41037E89Bc20',
    decimals: 18,
    id: 'ANC',
    name: 'Wrapped ANC Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x8290333ceF9e6D528dD5618Fb97a76f268f3EDD4',
    decimals: 18,
    id: 'ANKR',
    name: 'Ankr Network',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xa117000000f279D81A1D3cc75430fAA017FA5A2e',
    decimals: 18,
    id: 'ANT',
    name: 'Aragon',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x9ab165D795019b6d8B3e971DdA91071421305e5a',
    decimals: 18,
    id: 'AOA',
    name: 'Aurora.io (Ethereum)',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x4d224452801ACEd8B2F0aebE155379bb5D594381',
    decimals: 18,
    id: 'APE_ETH',
    name: 'ApeCoin',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x0b38210ea11411557c13457D4dA7dC6ea731B88a',
    decimals: 18,
    id: 'API3',
    name: 'API3',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x4104b135DBC9609Fc1A9490E61369036497660c8',
    decimals: 18,
    id: 'APW',
    name: 'APWine Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x95a4492F028aa1fd432Ea71146b433E7B4446611',
    decimals: 18,
    id: 'APY',
    name: 'APY Governance Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x912CE59144191C1204E64559FE8253a0e49E6548',
    decimals: 18,
    id: 'ARB_ARB_FRK9',
    name: 'Arbitrum',
    nativeAsset: 'ETH-AETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x319190E3Bbc595602A9E63B2bCfB61c6634355b1',
    decimals: 18,
    id: 'ARC_AETH',
    name: 'Aave Arc Interest bearing ETH',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x89eFaC495C65d43619c661df654ec64fc10C0A75',
    decimals: 18,
    id: 'ARC-AAAVE',
    name: 'Aave Arc Interest bearing AAVE',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x62A6738d887F47e297676FaB05b902709B106C64',
    decimals: 18,
    id: 'ARCA',
    name: 'ARCA',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x1F3f9D3068568F8040775be2e8C03C103C61f3aF',
    decimals: 18,
    id: 'ARCH',
    name: 'Archer DAO Governance Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xBA50933C268F567BDC86E1aC131BE072C6B0b71a',
    decimals: 18,
    id: 'ARPA',
    name: 'ARPA Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x64D91f12Ece7362F91A6f8E7940Cd55F05060b92',
    decimals: 18,
    id: 'ASH',
    name: 'Burn',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x2565ae0385659badCada1031DB704442E1b69982',
    decimals: 18,
    id: 'ASM',
    name: 'ASSEMBLE',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x27054b13b1B798B345b591a4d22e6562d47eA75a',
    decimals: 4,
    id: 'AST',
    name: 'AirSwap',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'ASTR_ASTR',
    name: 'Astar',
    nativeAsset: 'ASTR_ASTR',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'ASTR_TEST',
    name: 'Shibuya (Astar Test)',
    nativeAsset: 'ASTR_TEST',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '0xA2120b9e674d3fC3875f415A7DF52e382F141225',
    decimals: 18,
    id: 'ATA',
    name: 'Automata',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xF69709C4c6F3F2b17978280dCe8b7b7a2CbcbA8b',
    decimals: 18,
    id: 'ATD',
    name: 'ATD',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 8,
    id: 'ATLAS_SOL',
    issuerAddress: 'ATLASXmbPQxBUYbxPsV97usA3fPQYEqzQBUHgiFCUsXx',
    name: 'Star Atlas (Solana)',
    nativeAsset: 'SOL',
    type: 'SOL_ASSET'
  },
  {
    contractAddress: '0x0Eb3a705fc54725037CC9e008bDede697f62F335',
    decimals: 18,
    id: 'ATOM',
    name: 'Cosmos Token (BSC)',
    nativeAsset: 'BNB_BSC',
    type: 'BEP20'
  },
  {
    contractAddress: '',
    decimals: 6,
    id: 'ATOM_COS',
    name: 'Cosmos Hub',
    nativeAsset: 'ATOM_COS',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '',
    decimals: 6,
    id: 'ATOM_COS_TEST',
    name: 'Cosmos Hub Test',
    nativeAsset: 'ATOM_COS_TEST',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '0xdacD69347dE42baBfAEcD09dC88958378780FB62',
    decimals: 0,
    id: 'ATRI',
    name: 'AtariToken',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x101cc05f4A51C0319f570d5E146a8C625198e636',
    decimals: 18,
    id: 'ATUSD',
    name: 'Aave interest bearing TUSD',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xA9B1Eb5908CfC3cdf91F9B8B3a74108598009096',
    decimals: 18,
    id: 'AUCTION',
    name: 'Bounce Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x18aAA7115705e8be94bfFEBDE57Af9BFc265B998',
    decimals: 18,
    id: 'AUDIO',
    name: 'Audius',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'AURORA_DEV',
    name: 'Aurora.dev',
    nativeAsset: 'AURORA_DEV',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '0x9bA00D6856a4eDF4665BcA2C2309936572473B7E',
    decimals: 6,
    id: 'AUSDC',
    name: 'Aave Interest bearing USDC',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xd35f648C3C7f17cd1Ba92e5eac991E3EfcD4566d',
    decimals: 6,
    id: 'AUSDC_D35F6_ETH',
    name: 'Aave Arc Interest bearing USDC',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xBcca60bB61934080951369a648Fb03DF4F96263C',
    decimals: 6,
    id: 'AUSDC_ETH',
    name: 'Aave interest bearing USDC (V2)',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xab60CcAC0d4157c2b03e5D883bDbe60317992f58',
    decimals: 18,
    id: 'AUX',
    name: 'AUX Coin',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'AVAX',
    name: 'Avalanche (C-Chain)',
    nativeAsset: 'AVAX',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '0x1CE0c2827e2eF14D5C4f29a091d735A204794041',
    decimals: 18,
    id: 'AVAX_BSC',
    name: 'Avalanche (BSC)',
    nativeAsset: 'BNB_BSC',
    type: 'BEP20'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'AVAXTEST',
    name: 'Avalanche Fuji',
    nativeAsset: 'AVAXTEST',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '0x46A51127C3ce23fb7AB1DE06226147F446e4a857',
    decimals: 6,
    id: 'AVUSDC',
    name: 'Aave Avalanche Market USDC',
    nativeAsset: 'AVAX',
    type: 'ERC20'
  },
  {
    contractAddress: '0x9ff58f4fFB29fA2266Ab25e75e2A8b3503311656',
    decimals: 8,
    id: 'AWBTC',
    name: 'Aave interest bearing WBTC',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x030bA81f1c18d280636F32af80b9AAd02Cf0854e',
    decimals: 18,
    id: 'AWETH',
    name: 'Aave interest bearing WETH',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x32950db2a7164aE833121501C797D79E7B79d74C',
    decimals: 0,
    id: 'AXIE_RON',
    name: 'Axie (Ronin)',
    nativeAsset: 'RON',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 6,
    id: 'AXL',
    name: 'Axelar',
    nativeAsset: 'AXL',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '',
    decimals: 6,
    id: 'AXL_TEST',
    name: 'Axelar Test',
    nativeAsset: 'AXL_TEST',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '0xBB0E17EF65F82Ab018d8EDd776e8DD940327B28b',
    decimals: 18,
    id: 'AXS',
    name: 'Axie Infinity Shard',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x715D400F88C167884bbCc41C5FeA407ed4D2f8A0',
    decimals: 18,
    id: 'AXS_BSC',
    name: 'Axie Infinity Shard (BSC)',
    nativeAsset: 'BNB_BSC',
    type: 'BEP20'
  },
  {
    contractAddress: '0xF5D669627376EBd411E34b98F19C868c8ABA5ADA',
    decimals: 18,
    id: 'AXS_L',
    name: 'Axie Infinity Shard (Old)',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x97a9107C1793BC407d6F527b77e7fff4D812bece',
    decimals: 18,
    id: 'AXS_RON',
    name: 'Axie Infinity Shard (Ronin)',
    nativeAsset: 'RON',
    type: 'ERC20'
  },
  {
    contractAddress: '0xd7c302fc3ac829C7E896a32c4Bd126f3e8Bd0a1f',
    decimals: 18,
    id: 'B2M_ERC20',
    name: 'Bit2Me Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x6Faa826aF0568d1866Fca570dA79B318ef114dAb',
    decimals: 18,
    id: 'B21',
    name: 'B21 Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x3472A5A71965499acd81997a54BBA8D852C6E53d',
    decimals: 18,
    id: 'BADGER',
    name: 'Badger',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xe7Bf3aEE922367c10c8acEc3793fE7D809A38eef',
    decimals: 18,
    id: 'BAGS',
    name: 'BAGS',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xE02dF9e3e622DeBdD69fb838bB799E3F168902c5',
    decimals: 18,
    id: 'BAKE',
    name: 'BAKE',
    nativeAsset: 'BNB_BSC',
    type: 'BEP20'
  },
  {
    contractAddress: '0xba100000625a3754423978a60c9317c58a424e3D',
    decimals: 18,
    id: 'BAL',
    name: 'Balancer',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x603c7f932ED1fc6575303D8Fb018fDCBb0f39a95',
    decimals: 18,
    id: 'BANANA_BSC',
    name: 'ApeSwapFinance Banana',
    nativeAsset: 'BNB_BSC',
    type: 'BEP20'
  },
  {
    contractAddress: '0xBA11D00c5f74255f56a5E366F4F77f5A186d7f55',
    decimals: 18,
    id: 'BAND',
    name: 'BandToken',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x24A6A37576377F63f194Caa5F518a60f45b42921',
    decimals: 18,
    id: 'BANK',
    name: 'Float Bank',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'BASECHAIN_ETH',
    name: 'Ethereum (Base)',
    nativeAsset: 'BASECHAIN_ETH',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'BASECHAIN_ETH_TEST5',
    name: 'Base Sepolia',
    nativeAsset: 'BASECHAIN_ETH_TEST5',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '0x0D8775F648430679A709E98d2b0Cb6250d2887EF',
    decimals: 18,
    id: 'BAT',
    name: 'Basic Attn.',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x19D97D8fA813EE2f51aD4B4e04EA08bAf4DFfC28',
    decimals: 18,
    id: 'BBADGER',
    name: 'Badger Sett Badger',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xF4b5470523cCD314C6B9dA041076e7D79E0Df267',
    decimals: 18,
    id: 'BBANK',
    name: 'BlockBank',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x9BE89D2a4cd102D8Fecc6BF9dA793be995C22541',
    decimals: 8,
    id: 'BBTC',
    name: 'Binance Wrapped BTC',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x1f41E42D0a9e3c0Dd3BA15B527342783B43200A9',
    decimals: 0,
    id: 'BCAP',
    name: 'BCAP',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 8,
    id: 'BCH',
    name: 'Bitcoin Cash',
    nativeAsset: 'BCH',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '0x8fF795a6F4D97E7887C79beA79aba5cc76444aDf',
    decimals: 18,
    id: 'BCH_BSC',
    name: 'Binance-Peg Bitcoin Cash Token (BSC)',
    nativeAsset: 'BNB_BSC',
    type: 'BEP20'
  },
  {
    contractAddress: '',
    decimals: 8,
    id: 'BCH_TEST',
    name: 'Bitcoin Cash Test',
    nativeAsset: 'BCH_TEST',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '0x72e203a17adD19A3099137c9d7015fD3e2b7DBa9',
    decimals: 18,
    id: 'BCP',
    name: 'BlockchainPoland',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x1c4481750daa5Ff521A2a7490d9981eD46465Dbd',
    decimals: 18,
    id: 'BCPT',
    name: 'BlackMason',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x8D717AB5eaC1016b64C2A7fD04720Fd2D27D1B86',
    decimals: 18,
    id: 'BCVT',
    name: 'BitcoinVend',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x7e7E112A68d8D2E221E11047a72fFC1065c38e1a',
    decimals: 18,
    id: 'BDIGG',
    name: 'Badger Sett Digg',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x7884F51dC1410387371ce61747CB6264E1dAeE0B',
    decimals: 10,
    id: 'BDOT',
    name: 'Binance Wrapped DOT',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x593114f03A0A575aece9ED675e52Ed68D2172B8c',
    decimals: 18,
    id: 'BDP',
    name: 'BidiPass',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xDC59ac4FeFa32293A95889Dc396682858d52e5Db',
    decimals: 6,
    id: 'BEAN',
    name: 'Beanstalk',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xA91ac63D040dEB1b7A5E4d4134aD23eb0ba07e14',
    decimals: 18,
    id: 'BEL',
    name: 'Bella',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xE0e514c71282b6f4e823703a39374Cf58dc3eA4f',
    decimals: 18,
    id: 'BELT_BSC',
    name: 'BELT Token (BSC)',
    nativeAsset: 'BNB_BSC',
    type: 'BEP20'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'BERACHAIN_ARTIO_TEST',
    name: 'Berachain Artio Test',
    nativeAsset: 'BERACHAIN_ARTIO_TEST',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '0x1B073382E63411E3BcfFE90aC1B9A43feFa1Ec6F',
    decimals: 8,
    id: 'BEST',
    name: 'Bitpanda Ecosystem Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xBe1a001FE942f96Eea22bA08783140B9Dcc09D28',
    decimals: 18,
    id: 'BETA',
    name: 'Beta Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x250632378E573c6Be1AC2f97Fcdf00515d0Aa91B',
    decimals: 18,
    id: 'BETH_BSC',
    name: 'Binance Beacon ETH (BSC)',
    nativeAsset: 'BNB_BSC',
    type: 'BEP20'
  },
  {
    contractAddress: '0x14C926F2290044B647e1Bf2072e67B495eff1905',
    decimals: 18,
    id: 'BETHER',
    name: 'Bethereum',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x01fF50f8b7f74E4f00580d9596cd3D0d6d6E326f',
    decimals: 18,
    id: 'BFT',
    name: 'Bnk to the future',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xF17e65822b568B3903685a7c9F496CF7656Cc6C2',
    decimals: 18,
    id: 'BICO',
    name: 'Biconomy Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x25e1474170c4c0aA64fa98123bdc8dB49D7802fa',
    decimals: 18,
    id: 'BID',
    name: 'Bidao',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x6e8908cfa881C9f6f2C64d3436E7b80b1bf0093F',
    decimals: 18,
    id: 'BIST',
    name: 'Bistroo Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x1A4b46696b2bB4794Eb3D4c26f1c55F9170fa4C5',
    decimals: 18,
    id: 'BIT',
    name: 'BitDAO',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xb3104b4B9Da82025E8b9F8Fb28b3553ce2f67069',
    decimals: 18,
    id: 'BIX',
    name: 'Bibox Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xCa1bedEd9720289eb20D9449DE872d28ADa27476',
    decimals: 10,
    id: 'BK',
    name: 'Blockkoin',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x3AcF9680b5d57994B6570C0eA97bc4d8b25E3F5b',
    decimals: 10,
    id: 'BK_OLD',
    name: 'Blockkoin (OLD)',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x45245bc59219eeaAF6cD3f382e078A461FF9De7B',
    decimals: 18,
    id: 'BKX',
    name: 'BANKEX',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'BLAST',
    name: 'Blast Ethereum',
    nativeAsset: 'BLAST',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '',
    decimals: 2,
    id: 'BLINC_CAD',
    name: 'Blinc CAD',
    nativeAsset: 'BLINC_CAD',
    type: 'FIAT'
  },
  {
    contractAddress: '',
    decimals: 2,
    id: 'BLINC_CHF',
    name: 'Blinc CHF',
    nativeAsset: 'BLINC_CHF',
    type: 'FIAT'
  },
  {
    contractAddress: '',
    decimals: 2,
    id: 'BLINC_EUR',
    name: 'Blinc EUR',
    nativeAsset: 'BLINC_EUR',
    type: 'FIAT'
  },
  {
    contractAddress: '',
    decimals: 2,
    id: 'BLINC_GBP',
    name: 'Blinc GBP',
    nativeAsset: 'BLINC_GBP',
    type: 'FIAT'
  },
  {
    contractAddress: '',
    decimals: 2,
    id: 'BLINC_JPY',
    name: 'Blinc JPY',
    nativeAsset: 'BLINC_JPY',
    type: 'FIAT'
  },
  {
    contractAddress: '',
    decimals: 2,
    id: 'BLINC_SGD',
    name: 'Blinc SGD',
    nativeAsset: 'BLINC_SGD',
    type: 'FIAT'
  },
  {
    contractAddress: '',
    decimals: 2,
    id: 'BLINC_TEST_CAD',
    name: 'Blinc CAD Test',
    nativeAsset: 'BLINC_TEST_CAD',
    type: 'FIAT'
  },
  {
    contractAddress: '',
    decimals: 2,
    id: 'BLINC_TEST_CHF',
    name: 'Blinc CHF Test',
    nativeAsset: 'BLINC_TEST_CHF',
    type: 'FIAT'
  },
  {
    contractAddress: '',
    decimals: 2,
    id: 'BLINC_TEST_EUR',
    name: 'Blinc EUR Test',
    nativeAsset: 'BLINC_TEST_EUR',
    type: 'FIAT'
  },
  {
    contractAddress: '',
    decimals: 2,
    id: 'BLINC_TEST_GBP',
    name: 'Blinc GBP Test',
    nativeAsset: 'BLINC_TEST_GBP',
    type: 'FIAT'
  },
  {
    contractAddress: '',
    decimals: 2,
    id: 'BLINC_TEST_JPY',
    name: 'Blinc JPY Test',
    nativeAsset: 'BLINC_TEST_JPY',
    type: 'FIAT'
  },
  {
    contractAddress: '',
    decimals: 2,
    id: 'BLINC_TEST_SGD',
    name: 'Blinc SGD Test',
    nativeAsset: 'BLINC_TEST_SGD',
    type: 'FIAT'
  },
  {
    contractAddress: '0x20d37E84Ad91436B0F4380D29c2bc192AA05920B',
    decimals: 8,
    id: 'BLL',
    name: 'BELLCOIN',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 8,
    id: 'BLT_SOL',
    issuerAddress: 'BLT1noyNr3GttckEVrtcfC6oyK6yV1DpPgSyXbncMwef',
    name: 'Blocto Token',
    nativeAsset: 'SOL',
    type: 'SOL_ASSET'
  },
  {
    contractAddress: '0x5732046A883704404F284Ce41FfADd5b007FD668',
    decimals: 18,
    id: 'BLZ',
    name: 'Bluzelle',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x725C263e32c72dDC3A19bEa12C5a0479a81eE688',
    decimals: 18,
    id: 'BMI',
    name: 'Bridge Mutual',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'BNB_BSC',
    name: 'BNB Smart Chain',
    nativeAsset: 'BNB_BSC',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '0xB8c77482e45F1F44dE1745F52C74426C631bDD52',
    decimals: 18,
    id: 'BNB_ERC20',
    name: 'BNB (Ethereum)',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'BNB_TEST',
    name: 'BNB Smart Chain Testnet',
    nativeAsset: 'BNB_TEST',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '0x1F573D6Fb3F13d689FF844B4cE37794d79a7FF1C',
    decimals: 18,
    id: 'BNT',
    name: 'Bancor',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xDF347911910b6c9A4286bA8E2EE5ea4a39eB2134',
    decimals: 18,
    id: 'BOB',
    name: 'BOB Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x0391D2021f89DC339F60Fff84546EA23E337750f',
    decimals: 18,
    id: 'BOND',
    name: 'BarnBridge Governance Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xD2dDa223b2617cB616c1580db421e4cFAe6a8a85',
    decimals: 18,
    id: 'BONDLY',
    name: 'Bondly Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x9813037ee2218799597d83D4a5B6F3b6778218d9',
    decimals: 18,
    id: 'BONE',
    name: 'BONE SHIBASWAP',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 5,
    id: 'BONK_SOL',
    issuerAddress: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
    name: 'Bonk_Solana_',
    nativeAsset: 'SOL',
    type: 'SOL_ASSET'
  },
  {
    contractAddress: '0x841FAD6EAe12c286d1Fd18d1d525DFfA75C7EFFE',
    decimals: 18,
    id: 'BOO_FANTOM',
    name: 'SpookyToken (Fantom)',
    nativeAsset: 'FTM_FANTOM',
    type: 'ERC20'
  },
  {
    contractAddress: '0x3c9d6c1C73b31c837832c72E04D3152f051fc1A9',
    decimals: 18,
    id: 'BOR',
    name: 'BoringDAO',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xC477D038d5420C6A9e0b031712f61c5120090de9',
    decimals: 18,
    id: 'BOSON',
    name: 'Boson Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x68B55024aD32523c95aaA0A235e1d78E9191168e',
    decimals: 8,
    id: 'BOSSC',
    name: 'BOSSC',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x5bEaBAEBB3146685Dd74176f68a0721F91297D37',
    decimals: 18,
    id: 'BOT',
    name: 'Bounce Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 8,
    id: 'BOT_SOL',
    issuerAddress: 'AkhdZGVbJXPuQZ53u2LrimCjkRP6ZyxG1SoM85T98eE1',
    name: 'Starbots Token',
    nativeAsset: 'SOL',
    type: 'SOL_ASSET'
  },
  {
    contractAddress: '0x780116D91E5592E58a3b3c76A351571b39abCEc6',
    decimals: 15,
    id: 'BOXX',
    name: 'BOXX Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x440CD83C160De5C96Ddb20246815eA44C7aBBCa8',
    decimals: 18,
    id: 'BPRO_RBTC',
    name: 'BitPro (RSK)',
    nativeAsset: 'RBTC',
    type: 'ERC20'
  },
  {
    contractAddress: '0xe969991CE475bCF817e01E1AAd4687dA7e1d6F83',
    decimals: 18,
    id: 'BPT_ETHUSDC_7',
    name: 'Balancer: ETH/USDC 50/50 #7',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x24D97EEd6E171E70c82bc60aFd37c7d1E549A0AD',
    decimals: 18,
    id: 'BPT_LPTETH_2',
    name: 'Balancer: LPT/ETH 50/50 #2',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x558EC3152e2eb2174905cd19AeA4e34A23DE9aD6',
    decimals: 18,
    id: 'BRD',
    name: 'Bread',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x420412E765BFa6d85aaaC94b4f7b708C89be2e2B',
    decimals: 4,
    id: 'BRZ',
    name: 'BRZ Token (ETH)',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 8,
    id: 'BSV',
    name: 'Bitcoin SV',
    nativeAsset: 'BSV',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '',
    decimals: 8,
    id: 'BSV_TEST',
    name: 'Bitcoin SV Test',
    nativeAsset: 'BSV_TEST',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '',
    decimals: 8,
    id: 'BTC',
    name: 'Bitcoin',
    nativeAsset: 'BTC',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '0x321162Cd933E2Be498Cd2267a90534A804051b11',
    decimals: 8,
    id: 'BTC_FTM',
    name: 'Bitcoin (Fantom)',
    nativeAsset: 'FTM_FANTOM',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 8,
    id: 'BTC_TEST',
    name: 'Bitcoin Test',
    nativeAsset: 'BTC_TEST',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c',
    decimals: 18,
    id: 'BTCB_BSC',
    name: 'Binance-Peg BTCB Token (BSC)',
    nativeAsset: 'BNB_BSC',
    type: 'BEP20'
  },
  {
    contractAddress: '0x78650B139471520656b9E7aA7A5e9276814a38e9',
    decimals: 17,
    id: 'BTCST_BSC',
    name: 'StandardBTCHashrateToken (BSC)',
    nativeAsset: 'BNB_BSC',
    type: 'BEP20'
  },
  {
    contractAddress: '0x799ebfABE77a6E34311eeEe9825190B9ECe32824',
    decimals: 18,
    id: 'BTRST',
    name: 'BTRST token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x8595F9dA7b868b1822194fAEd312235E43007b49',
    decimals: 18,
    id: 'BTT_BSC',
    name: 'BitTorrent (BSC)',
    nativeAsset: 'BNB_BSC',
    type: 'BEP20'
  },
  {
    contractAddress: '0x7712c34205737192402172409a8F7ccef8aA2AEc',
    decimals: 6,
    id: 'BUIDL_ETH_X3N7',
    name: 'BlackRock USD Institutional Digital Liquidity Fund',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xAe9269f27437f0fcBC232d39Ec814844a51d6b8f',
    decimals: 18,
    id: 'BURGER_BSC',
    name: 'Burger Swap (BSC)',
    nativeAsset: 'BNB_BSC',
    type: 'BEP20'
  },
  {
    contractAddress: '0x33f391F4c4fE802b70B77AE37670037A92114A7c',
    decimals: 18,
    id: 'BURP',
    name: 'Burp',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x4Fabb145d64652a948d72533023f6E7A623C7C53',
    decimals: 18,
    id: 'BUSD',
    name: 'Binance USD',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
    decimals: 18,
    id: 'BUSD_BSC',
    name: 'Binance-Peg BUSD (BSC)',
    nativeAsset: 'BNB_BSC',
    type: 'BEP20'
  },
  {
    contractAddress: '0xeD24FC36d5Ee211Ea25A80239Fb8C4Cfd80f12Ee',
    decimals: 18,
    id: 'BUSD_BSC_TEST',
    name: 'Binance USD (BSC Test)',
    nativeAsset: 'BNB_TEST',
    type: 'BEP20'
  },
  {
    contractAddress: '0x54F9b4B4485543A815c51c412a9E20436A06491d',
    decimals: 18,
    id: 'BXX',
    name: 'Baanx',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x4Bb3205bf648B7F59EF90Dee0F1B62F6116Bc7ca',
    decimals: 18,
    id: 'BYN',
    name: 'Beyond Finance (ERC-20)',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x56d811088235F11C8920698a204A5010a788f4b3',
    decimals: 18,
    id: 'BZRX',
    name: 'bZx Protocol Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x19062190B1925b5b6689D7073fDfC8c2976EF8Cb',
    decimals: 16,
    id: 'BZZ',
    name: 'BZZ',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x26E75307Fc0C021472fEb8F727839531F112f317',
    decimals: 18,
    id: 'C20',
    name: 'Crypto20',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xe65cdB6479BaC1e22340E4E755fAE7E509EcD06c',
    decimals: 8,
    id: 'CAAVE',
    name: 'Compound Aave Token',
    nativeAsset: 'ETH',
    type: 'COMPOUND'
  },
  {
    contractAddress: '0x7d4b8Cce0591C9044a22ee543533b72E976E36C3',
    decimals: 18,
    id: 'CAG',
    name: 'ChangeBank',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82',
    decimals: 18,
    id: 'CAKE_BSC',
    name: 'PancakeSwap Token (BSC)',
    nativeAsset: 'BNB_BSC',
    type: 'BEP20'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'CAMINO',
    name: 'Camino',
    nativeAsset: 'CAMINO',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'CAMINO_COLUMBUS_TEST',
    name: 'Camino Columbus Test',
    nativeAsset: 'CAMINO_COLUMBUS_TEST',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'CANTO',
    name: 'Canto',
    nativeAsset: 'CANTO',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'CANTO_TEST',
    name: 'Canto Test',
    nativeAsset: 'CANTO_TEST',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '0x03Be5C903c727Ee2C8C4e9bc0AcC860Cca4715e2',
    decimals: 18,
    id: 'CAPS',
    name: 'Capsule Coin',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x6894CDe390a3f51155ea41Ed24a33A4827d3063D',
    decimals: 18,
    id: 'CAT_B71VABWJ_BY1A',
    name: 'Simons Cat',
    nativeAsset: 'BNB_BSC',
    type: 'BEP20'
  },
  {
    contractAddress: '',
    decimals: 6,
    id: 'CAVE_SOL',
    issuerAddress: '4SZjjNABoqhbd4hnapbvoEPEqT8mnNkfbEoAwALf1V8t',
    name: 'Crypto Cavemen (Solana)',
    nativeAsset: 'SOL',
    type: 'SOL_ASSET'
  },
  {
    contractAddress: '0x6C8c6b02E7b2BE14d4fA6022Dfd6d75921D90E4E',
    decimals: 8,
    id: 'CBAT',
    name: 'cBAT',
    nativeAsset: 'ETH',
    type: 'COMPOUND'
  },
  {
    contractAddress: '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf',
    decimals: 8,
    id: 'CBBTC_B6QT1TZK_9XC8',
    name: 'Coinbase Wrapped BTC',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf',
    decimals: 8,
    id: 'CBBTC_B609K9QB_0N6V',
    name: 'Coinbase Wrapped BTC',
    nativeAsset: 'BASECHAIN_ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x0E2b41eA957624A314108cc4E33703e9d78f4b3C',
    decimals: 18,
    id: 'CBD_BSC',
    name: 'Greenheart (BSC)',
    nativeAsset: 'BNB_BSC',
    type: 'BEP20'
  },
  {
    contractAddress: '0xD85a6Ae55a7f33B0ee113C234d2EE308EdeAF7fD',
    decimals: 18,
    id: 'CBK',
    name: 'Cobak Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xA6FA6531acDf1f9F96EDdD66a0F9481E35c2e42A',
    decimals: 6,
    id: 'CBRL',
    name: 'Crypto BRL',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x70e36f6BF80a52b3B46b3aF8e106CC0ed743E8e4',
    decimals: 8,
    id: 'CCOMP',
    name: 'Compound Collateral',
    nativeAsset: 'ETH',
    type: 'COMPOUND'
  },
  {
    contractAddress: '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643',
    decimals: 8,
    id: 'CDAI',
    name: 'cDAI',
    nativeAsset: 'ETH',
    type: 'COMPOUND'
  },
  {
    contractAddress: '0x177d39AC676ED1C67A2b268AD7F1E58826E5B0af',
    decimals: 18,
    id: 'CDT',
    name: 'Blox',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xaaAEBE6Fe48E54f431b0C390CfaF0b017d09D42d',
    decimals: 4,
    id: 'CEL',
    name: 'Celsius',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 6,
    id: 'CELESTIA',
    name: 'Celestia',
    nativeAsset: 'CELESTIA',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '',
    decimals: 6,
    id: 'CELESTIA_TEST',
    name: 'Celestia Test',
    nativeAsset: 'CELESTIA_TEST',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '0xA2F26a3AF6a2C5Bc1d64e176F3BB42BF6e9c6c61',
    decimals: 18,
    id: 'CELLDOGE_CELO',
    name: 'Cell Doge (Celo)',
    nativeAsset: 'CELO',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'CELO',
    name: 'Celo',
    nativeAsset: 'CELO',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'CELO_ALF',
    name: 'Celo Alfajores',
    nativeAsset: 'CELO_ALF',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'CELO_BAK',
    name: 'Celo Baklava',
    nativeAsset: 'CELO_BAK',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '0x4F9254C83EB525f9FCf346490bbb3ed28a81C667',
    decimals: 18,
    id: 'CELR',
    name: 'CelerToken',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x1122B6a0E00DCe0563082b6e2953f3A943855c1F',
    decimals: 18,
    id: 'CENNZ',
    name: 'Centrality Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x2dA719DB753dFA10a62E140f436E1d67F2ddB0d6',
    decimals: 10,
    id: 'CERE_ERC20',
    name: 'CERE Network',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5',
    decimals: 8,
    id: 'CETH',
    name: 'cEther',
    nativeAsset: 'ETH',
    type: 'COMPOUND'
  },
  {
    contractAddress: '0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73',
    decimals: 18,
    id: 'CEUR_CELO',
    name: 'Celo Euro',
    nativeAsset: 'CELO',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'CFG',
    name: 'Centrifuge',
    nativeAsset: 'CFG',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '0x12FEF5e57bF45873Cd9B62E9DBd7BFb99e32D73e',
    decimals: 18,
    id: 'CFI',
    name: 'CFI',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xAdA0A1202462085999652Dc5310a7A9e2BF3eD42',
    decimals: 18,
    id: 'CGI',
    name: 'CoinShares Gold and Cryptoassets Index Lite',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xC4C2614E694cF534D407Ee49F8E44D125E4681c4',
    decimals: 18,
    id: 'CHAIN',
    name: 'Chain Games',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x20de22029ab63cf9A7Cf5fEB2b737Ca1eE4c82A6',
    decimals: 18,
    id: 'CHESS_BSC',
    name: 'Tranchess (BSC)',
    nativeAsset: 'BNB_BSC',
    type: 'BEP20'
  },
  {
    contractAddress: '0x0000000000004946c0e9F43F4Dee607b0eF1fA1c',
    decimals: 0,
    id: 'CHI',
    name: 'Chi Gastoken by 1inch',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 9,
    id: 'CHICKS_SOL',
    issuerAddress: 'cxxShYRVcepDudXhe7U62QHvw8uBJoKFifmzggGKVC2',
    name: 'SolChicks',
    nativeAsset: 'SOL',
    type: 'SOL_ASSET'
  },
  {
    contractAddress: '0xDF98E4306efF7E3d839f9Ca54C56959E578CEa04',
    decimals: 18,
    id: 'CHLI',
    name: 'Chilli Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x8A2279d4A90B6fe1C4B30fa660cC9f926797bAA2',
    decimals: 6,
    id: 'CHR',
    name: 'Chromia',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xf9CeC8d50f6c8ad3Fb6dcCEC577e05aA32B224FE',
    decimals: 6,
    id: 'CHR_BSC',
    name: 'Chroma (BSC)',
    nativeAsset: 'BNB_BSC',
    type: 'BEP20'
  },
  {
    contractAddress: '0xba9d4199faB4f26eFE3551D490E3821486f135Ba',
    decimals: 8,
    id: 'CHSB',
    name: 'SwissBorg Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x159dC1C54D409BD694bC1e756d6e17a02D6BF167',
    decimals: 7,
    id: 'CHT',
    name: 'CHATTY',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x3506424F91fD33084466F402d5D97f05F8e3b4AF',
    decimals: 18,
    id: 'CHZ',
    name: 'Chiliz (ETH)',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'CHZ_$CHZ',
    name: 'Chiliz ($CHZ)',
    nativeAsset: 'CHZ_$CHZ',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'CHZ_CHZ2',
    name: 'Chiliz',
    nativeAsset: 'CHZ_CHZ2',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'CHZ_CHZ2_TEST',
    name: 'Chiliz Test',
    nativeAsset: 'CHZ_CHZ2_TEST',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '0xFAce851a4921ce59e912d19329929CE6da6EB0c7',
    decimals: 8,
    id: 'CLINK',
    name: 'Compound ChainLink Token',
    nativeAsset: 'ETH',
    type: 'COMPOUND'
  },
  {
    contractAddress: '0x2001f2A0Cf801EcFda622f6C28fb6E10d803D969',
    decimals: 8,
    id: 'CLT',
    name: 'CoinLoan',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x80C62FE4487E1351b47Ba49809EBD60ED085bf52',
    decimals: 18,
    id: 'CLV',
    name: 'Clover',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x47bc01597798DCD7506DCCA36ac4302fc93a8cFb',
    decimals: 8,
    id: 'CMCT',
    name: 'Crowd Machine Compute Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x95b4eF2869eBD94BEb4eEE400a99824BF5DC325b',
    decimals: 8,
    id: 'CMKR',
    name: 'Compound Maker',
    nativeAsset: 'ETH',
    type: 'COMPOUND'
  },
  {
    contractAddress: '0xd4c435F5B09F855C3317c8524Cb1F586E42795fa',
    decimals: 18,
    id: 'CND',
    name: 'Cindicator',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x6E109E9dD7Fa1a58BC3eff667e8e41fC3cc07AEF',
    decimals: 6,
    id: 'CNHT_ERC20',
    name: 'Tether CNH (ERC20)',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xc00e94Cb662C3520282E6f5717214004A7f26888',
    decimals: 18,
    id: 'COMP',
    name: 'Compound Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x52CE071Bd9b1C4B00A0b92D298c512478CaD67e8',
    decimals: 18,
    id: 'COMP_BSC',
    name: 'Binance-Peg Compound Coin (BSC)',
    nativeAsset: 'BNB_BSC',
    type: 'BEP20'
  },
  {
    contractAddress: '0xc834Fa996fA3BeC7aAD3693af486ae53D8aA8B50',
    decimals: 18,
    id: 'CONV_ETH',
    name: 'Convergence',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x62359Ed7505Efc61FF1D56fEF82158CcaffA23D7',
    decimals: 18,
    id: 'CORE',
    name: 'cVault.finance',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'CORE_COREDAO',
    name: 'Core DAO',
    nativeAsset: 'CORE_COREDAO',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'CORE_COREDAO_TEST',
    name: 'Core DAO Test',
    nativeAsset: 'CORE_COREDAO_TEST',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '0x589891a198195061Cb8ad1a75357A3b7DbaDD7Bc',
    decimals: 18,
    id: 'COS',
    name: 'Contentos',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 2,
    id: 'COS_TEST_USD',
    name: 'Cross River USD Test',
    nativeAsset: 'COS_TEST_USD',
    type: 'FIAT'
  },
  {
    contractAddress: '',
    decimals: 2,
    id: 'COS_USD',
    name: 'Cross River USD',
    nativeAsset: 'COS_USD',
    type: 'FIAT'
  },
  {
    contractAddress: '0xDDB3422497E61e13543BeA06989C0789117555c5',
    decimals: 18,
    id: 'COTI',
    name: 'COTI Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xB37a769B37224449d92AAc57dE379E1267Cd3B00',
    decimals: 18,
    id: 'COVA',
    name: 'Covalent',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x4688a8b1F292FDaB17E9a90c8Bc379dC1DBd8713',
    decimals: 18,
    id: 'COVER',
    name: 'Cover Protocol',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x66761Fa41377003622aEE3c7675Fc7b5c1C2FaC5',
    decimals: 18,
    id: 'CPOOL',
    name: 'Clearpool',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xD417144312DbF50465b1C641d016962017Ef6240',
    decimals: 18,
    id: 'CQT',
    name: 'Covalent Query Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x115eC79F1de567eC68B7AE7eDA501b406626478e',
    decimals: 18,
    id: 'CRE',
    name: 'CarryToken',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x2ba592F78dB6436527729929AAf6c908497cB200',
    decimals: 18,
    id: 'CREAM',
    name: 'Cream',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x158079Ee67Fce2f58472A96584A73C7Ab9AC95c1',
    decimals: 8,
    id: 'CREP',
    name: 'cAugur',
    nativeAsset: 'ETH',
    type: 'COMPOUND'
  },
  {
    contractAddress: '0xA0b73E1Ff0B80914AB6fe0444E65848C4C34450b',
    decimals: 8,
    id: 'CRO',
    name: 'Crypto.com',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 9,
    id: 'CRP_SOL',
    issuerAddress: 'DubwWZNWiNGMMeeQHPnMATNj77YZPZSAz2WVR5WjLJqz',
    name: 'CropperFinance (Solana)',
    nativeAsset: 'SOL',
    type: 'SOL_ASSET'
  },
  {
    contractAddress: '0x08389495D7456E1951ddF7c3a1314A4bfb646d8B',
    decimals: 18,
    id: 'CRPT',
    name: 'Crypterium',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x80A7E048F37A50500351C204Cb407766fA3baE7f',
    decimals: 18,
    id: 'CRPT_OLD',
    name: 'Crypterium (Old)',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x32a7C02e79c4ea1008dD6564b35F131428673c41',
    decimals: 18,
    id: 'CRU',
    name: 'CRUST',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x44fbeBd2F576670a6C33f6Fc0B00aA8c5753b322',
    decimals: 8,
    id: 'CRUSDC',
    name: 'Cream USD Coin',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xD533a949740bb3306d119CC777fa900bA034cd52',
    decimals: 18,
    id: 'CRV',
    name: 'Curve DAO Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xF5DCe57282A584D2746FaF1593d3121Fcac444dC',
    decimals: 8,
    id: 'CSAI',
    name: 'cSAI',
    nativeAsset: 'ETH',
    type: 'COMPOUND'
  },
  {
    contractAddress: '',
    decimals: 9,
    id: 'CSOL_SOL',
    issuerAddress: '5h6ssFpeDeRbzsEHDbTQNH7nVGgsKrZydxdSTnLm6QdV',
    name: 'Solend SOL (Solana)',
    nativeAsset: 'SOL',
    type: 'SOL_ASSET'
  },
  {
    contractAddress: '0xA6446D655a0c34bC4F05042EE88170D056CBAf45',
    decimals: 18,
    id: 'CSP',
    name: 'Caspian',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x4B0181102A0112A2ef11AbEE5563bb4a3176c9d7',
    decimals: 8,
    id: 'CSUSHI',
    name: 'Compound Sushi Token',
    nativeAsset: 'ETH',
    type: 'COMPOUND'
  },
  {
    contractAddress: '0xa3EE21C306A700E682AbCdfe9BaA6A08F3820419',
    decimals: 18,
    id: 'CTC',
    name: 'Gluwa Creditcoin Vesting Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x8c18D6a985Ef69744b9d57248a45c0861874f244',
    decimals: 18,
    id: 'CTI',
    name: 'ClinTex',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x96A65609a7B84E8842732DEB08f56C3E21aC6f8a',
    decimals: 18,
    id: 'CTR',
    name: 'Centra',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x491604c0FDF08347Dd1fa4Ee062a822A5DD06B5D',
    decimals: 18,
    id: 'CTSI',
    name: 'Cartesi Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x12392F67bdf24faE0AF363c24aC620a2f67DAd86',
    decimals: 8,
    id: 'CTUSD',
    name: 'Compound TrueUSD',
    nativeAsset: 'ETH',
    type: 'COMPOUND'
  },
  {
    contractAddress: '0x321C2fE4446C7c963dc41Dd58879AF648838f98D',
    decimals: 18,
    id: 'CTX',
    name: 'Cryptex',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xDf801468a808a32656D2eD2D2d80B72A129739f4',
    decimals: 8,
    id: 'CUBE',
    name: 'Somnium Space Cubes',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x817bbDbC3e8A1204f3691d14bB44992841e3dB35',
    decimals: 18,
    id: 'CUDOS',
    name: 'CudosToken',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x35A18000230DA775CAc24873d00Ff85BccdeD550',
    decimals: 8,
    id: 'CUNI',
    name: 'Compound Uniswap',
    nativeAsset: 'ETH',
    type: 'COMPOUND'
  },
  {
    contractAddress: '0x1410d4eC3D276C0eBbf16ccBE88A4383aE734eD0',
    decimals: 18,
    id: 'CUSD',
    name: 'CarbonUSD',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x765DE816845861e75A25fCA122bb6898B8B1282a',
    decimals: 18,
    id: 'CUSD_CELO',
    name: 'Celo Dollar',
    nativeAsset: 'CELO',
    type: 'ERC20'
  },
  {
    contractAddress: '0x39AA39c021dfbaE8faC545936693aC917d5E7563',
    decimals: 8,
    id: 'CUSDC',
    name: 'Compound USD Coin',
    nativeAsset: 'ETH',
    type: 'COMPOUND'
  },
  {
    contractAddress: '0xf650C3d88D12dB855b8bf7D11Be6C55A4e07dCC9',
    decimals: 8,
    id: 'CUSDT_ERC20',
    name: 'cTether',
    nativeAsset: 'ETH',
    type: 'COMPOUND'
  },
  {
    contractAddress: '0x41e5560054824eA6B0732E656E3Ad64E20e94E45',
    decimals: 8,
    id: 'CVC',
    name: 'Civic',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B',
    decimals: 18,
    id: 'CVX',
    name: 'CVX',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x62B9c7356A2Dc64a1969e19C23e4f579F9810Aa7',
    decimals: 18,
    id: 'CVXCRV',
    name: 'cvxCRV',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 9,
    id: 'CWAR_SOL',
    issuerAddress: 'HfYFjMKNZygfMC8LsQ8LtpPsPxEJoXJx4M6tqi75Hajo',
    name: 'Cryowar Token (Solana)',
    nativeAsset: 'SOL',
    type: 'SOL_ASSET'
  },
  {
    contractAddress: '0xC11b1268C1A384e55C48c2391d8d480264A3A7F4',
    decimals: 8,
    id: 'CWBTC',
    name: 'cWBTC',
    nativeAsset: 'ETH',
    type: 'COMPOUND'
  },
  {
    contractAddress: '0xaC0104Cca91D167873B8601d2e71EB3D4D8c33e0',
    decimals: 18,
    id: 'CWS',
    name: 'Crowns',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x7ABc8A5768E6bE61A6c693a6e4EAcb5B60602C4D',
    decimals: 18,
    id: 'CXT_B6QT1TZK_3BEN',
    name: 'Covalent X Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x80a2AE356fc9ef4305676f7a3E2Ed04e12C33946',
    decimals: 8,
    id: 'CYFI',
    name: 'Compound yearn.finance',
    nativeAsset: 'ETH',
    type: 'COMPOUND'
  },
  {
    contractAddress: '',
    decimals: 6,
    id: 'CYS_SOL',
    issuerAddress: 'BRLsMczKuaR5w9vSubF4j8HwEGGprVAyyVgS4EX7DKEg',
    name: 'Cyclos',
    nativeAsset: 'SOL',
    type: 'SOL_ASSET'
  },
  {
    contractAddress: '0xB3319f5D18Bc0D84dD1b4825Dcde5d5f7266d407',
    decimals: 8,
    id: 'CZRX',
    name: 'Compound 0x',
    nativeAsset: 'ETH',
    type: 'COMPOUND'
  },
  {
    contractAddress: '0xA31108E5BAB5494560Db34c95492658AF239357C',
    decimals: 18,
    id: 'DACS',
    name: 'DACSEE',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x5B322514FF727253292637D9054301600c2C81e8',
    decimals: 9,
    id: 'DAD',
    name: 'DAD',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xFc979087305A826c2B2a0056cFAbA50aad3E6439',
    decimals: 18,
    id: 'DAFI',
    name: 'DAFI Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    decimals: 18,
    id: 'DAI',
    name: 'Dai',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3',
    decimals: 18,
    id: 'DAI_BSC',
    name: 'Dai BSC Token',
    nativeAsset: 'BNB_BSC',
    type: 'BEP20'
  },
  {
    contractAddress: '0xd586E7F844cEa2F87f50152665BCbc2C279D8d70',
    decimals: 18,
    id: 'DAI_E',
    name: 'Dai Stablecoin (Avalanche)',
    nativeAsset: 'AVAX',
    type: 'ERC20'
  },
  {
    contractAddress: '0x8D11eC38a3EB5E956B052f67Da8Bdc9bef8Abf3E',
    decimals: 18,
    id: 'DAI_FANTOM',
    name: 'Dai Stablecoin (Fantom)',
    nativeAsset: 'FTM_FANTOM',
    type: 'ERC20'
  },
  {
    contractAddress: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
    decimals: 18,
    id: 'DAI_POLYGON',
    name: '(PoS) Dai Stablecoin (Polygon)',
    nativeAsset: 'MATIC_POLYGON',
    type: 'ERC20'
  },
  {
    contractAddress: '0x0f51bb10119727a7e5eA3538074fb341F56B09Ad',
    decimals: 18,
    id: 'DAO',
    name: 'DAO Maker',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 8,
    id: 'DASH',
    name: 'Dash',
    nativeAsset: 'DASH',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '',
    decimals: 8,
    id: 'DASH_TEST',
    name: 'Dash Test',
    nativeAsset: 'DASH_TEST',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '0x0Cf0Ee63788A0849fE5297F3407f701E122cC023',
    decimals: 18,
    id: 'DATA',
    name: 'Streamr Data',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x8f693ca8D21b157107184d29D398A8D082b38b76',
    decimals: 18,
    id: 'DATA_ERC20',
    name: 'Streamr',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x0B4BdC478791897274652DC15eF5C135cae61E60',
    decimals: 18,
    id: 'DAX',
    name: 'DAEX Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'DCFG_TEST',
    name: 'Centrifuge Test',
    nativeAsset: 'DCFG_TEST',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '0x88EF27e69108B2633F8E1C184CC37940A075cC02',
    decimals: 18,
    id: 'DEGO',
    name: 'dego.finance',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x3597bfD533a99c9aa083587B074434E61Eb0A258',
    decimals: 8,
    id: 'DENT',
    name: 'DENT',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x1A3496C18d558bd9C6C8f609E1B129f67AB08163',
    decimals: 18,
    id: 'DEP',
    name: 'DEAPCOIN',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xaB93dF617F51E1E415b5b4f8111f122d6b48e55C',
    decimals: 18,
    id: 'DETO',
    name: 'Delta Exchange Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xfB7B4564402E5500dB5bB6d63Ae671302777C75a',
    decimals: 18,
    id: 'DEXT',
    name: 'DEXTools',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x431ad2ff6a9C365805eBaD47Ee021148d6f7DBe0',
    decimals: 18,
    id: 'DF',
    name: 'dForce',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x20c36f062a31865bED8a5B1e512D9a1A20AA333A',
    decimals: 18,
    id: 'DFD',
    name: 'DefiDollar DAO',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x7CCC863EcE2E15bC45ac0565D410da7A3340aD98',
    decimals: 18,
    id: 'DFY',
    name: 'Dotify Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x9695e0114e12C0d3A3636fAb5A18e6b737529023',
    decimals: 18,
    id: 'DFYN',
    name: 'DFYN Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xC168E40227E4ebD8C1caE80F7a55a4F0e6D66C97',
    decimals: 18,
    id: 'DFYN_POLYGON',
    name: 'DFYN Token (Polygon)',
    nativeAsset: 'MATIC_POLYGON',
    type: 'ERC20'
  },
  {
    contractAddress: '0x1C83501478f1320977047008496DACBD60Bb15ef',
    decimals: 18,
    id: 'DGTX',
    name: 'Digitex',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xc666081073E8DfF8D3d1c2292A29aE1A2153eC09',
    decimals: 18,
    id: 'DGTX_ETH',
    name: 'DigitexFutures',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x4f3AfEC4E5a3F2A6a1A411DEF7D7dFe50eE057bF',
    decimals: 9,
    id: 'DGX',
    name: 'Digix Gold Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xca1207647Ff814039530D7d35df0e1Dd2e91Fa84',
    decimals: 18,
    id: 'DHT',
    name: 'dHedge DAO',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x84cA8bc7997272c7CfB4D0Cd3D55cd942B3c9419',
    decimals: 18,
    id: 'DIA',
    name: 'DIAToken',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xefA64D3d5431dBcE85eBCb87e51a5625243d1A55',
    decimals: 5,
    id: 'DIFX',
    name: 'DigitalFinancialExch',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x798D1bE841a82a273720CE31c822C61a67a601C3',
    decimals: 9,
    id: 'DIGG',
    name: 'Digg',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xAa9654BECca45B5BDFA5ac646c939C62b527D394',
    decimals: 18,
    id: 'DINO_POLYGON',
    name: 'DinoSwap (Polygon)',
    nativeAsset: 'MATIC_POLYGON',
    type: 'ERC20'
  },
  {
    contractAddress: '0xc1411567d2670e24d9C4DaAa7CdA95686e1250AA',
    decimals: 18,
    id: 'DLLR_RSK_OYHI',
    name: 'Sovryn Dollar',
    nativeAsset: 'RBTC',
    type: 'ERC20'
  },
  {
    contractAddress: '0x07e3c70653548B04f0A75970C1F81B4CBbFB606f',
    decimals: 18,
    id: 'DLT',
    name: 'Agrello',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x0000000DE40dfa9B17854cBC7869D80f9F98D823',
    decimals: 18,
    id: 'DLTA',
    name: 'delta.theta',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xEd91879919B71bB6905f23af0A68d231EcF87b14',
    decimals: 18,
    id: 'DMG',
    name: 'DMM: Governance',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x82b0E50478eeaFde392D45D1259Ed1071B6fDa81',
    decimals: 18,
    id: 'DNA',
    name: 'DNA',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x0AbdAce70D3790235af448C88547603b945604ea',
    decimals: 18,
    id: 'DNT',
    name: 'district0x',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xe700691dA7b9851F2F35f8b8182c69c53CcaD9Db',
    decimals: 18,
    id: 'DOC_RBTC',
    name: 'Dollar on Chain (RSK)',
    nativeAsset: 'RBTC',
    type: 'ERC20'
  },
  {
    contractAddress: '0xE5Dada80Aa6477e85d09747f2842f7993D0Df71C',
    decimals: 18,
    id: 'DOCK',
    name: 'Dock',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x43Dfc4159D86F3A37A5A4B3D4580b888ad7d4DDd',
    decimals: 18,
    id: 'DODO',
    name: 'DODO bird',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x67ee3Cb086F8a16f34beE3ca72FAD36F7Db929e2',
    decimals: 18,
    id: 'DODO_BSC',
    name: 'DODO bird (BSC)',
    nativeAsset: 'BNB_BSC',
    type: 'BEP20'
  },
  {
    contractAddress: '',
    decimals: 8,
    id: 'DOGE',
    name: 'Doge Coin',
    nativeAsset: 'DOGE',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '0xbA2aE424d960c26247Dd6c32edC70B295c744C43',
    decimals: 8,
    id: 'DOGE_BSC',
    name: 'Binance-Peg Dogecoin (BSC)',
    nativeAsset: 'BNB_BSC',
    type: 'BEP20'
  },
  {
    contractAddress: '',
    decimals: 8,
    id: 'DOGE_TEST',
    name: 'Doge Coin Test',
    nativeAsset: 'DOGE_TEST',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '',
    decimals: 9,
    id: 'DOGS_TON',
    issuerAddress: 'EQCvxJy4eG8hyHBFsZ7eePxrRsUQSFE_jpptRAYBmcG_DOGS',
    name: 'Dogs (Ton)',
    nativeAsset: 'TON',
    type: 'TON_ASSET'
  },
  {
    contractAddress: '0xa2b5C6d877Ae7eb964E5E7c79F721D1c0085Ec0F',
    decimals: 18,
    id: 'DOPEX',
    name: 'Dopex Governance Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 10,
    id: 'DOT',
    name: 'Polkadot',
    nativeAsset: 'DOT',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '0x7083609fCE4d1d8Dc0C979AAb8c869Ea2C873402',
    decimals: 18,
    id: 'DOT_BSC',
    name: 'Binance-Peg Polkadot (BSC)',
    nativeAsset: 'BNB_BSC',
    type: 'BEP20'
  },
  {
    contractAddress: '0x1494CA1F11D487c2bBe4543E90080AeBa4BA3C2b',
    decimals: 18,
    id: 'DPI',
    name: 'DefiPulse Index',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x9d561d63375672ABd02119b9Bc4FB90EB9E307Ca',
    decimals: 18,
    id: 'DRCT_ERC20',
    name: 'Ally Direct Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x9400Aa8eb5126d20CDE45C7822836BFB70F19878',
    decimals: 18,
    id: 'DRF_BSC',
    name: 'DRIFE',
    nativeAsset: 'BNB_BSC',
    type: 'BEP20'
  },
  {
    contractAddress: '0x814F67fA286f7572B041D041b1D99b432c9155Ee',
    decimals: 8,
    id: 'DRG',
    name: 'Dragon Coins',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xBD2F0Cd039E0BFcf88901C98c0bFAc5ab27566e3',
    decimals: 18,
    id: 'DSD',
    name: 'Dynamic Set Dollar',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'DSETH_DEV',
    name: 'dSETH (Dev)',
    nativeAsset: 'DSETH_DEV',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '0x940a2dB1B7008B6C776d4faaCa729d6d4A4AA551',
    decimals: 18,
    id: 'DUSK',
    name: 'Dusk Network',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'DV4TNT_TEST',
    name: 'DYDX Test',
    nativeAsset: 'DV4TNT_TEST',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '0xDDdddd4301A082e62E84e43F474f044423921918',
    decimals: 18,
    id: 'DVF',
    name: 'DeversiFi Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x10633216E7E8281e33c86F02Bf8e565a635D9770',
    decimals: 18,
    id: 'DVI',
    name: 'Dvision',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xa1d65E8fB6e87b60FECCBc582F7f97804B725521',
    decimals: 18,
    id: 'DXD',
    name: 'DXdao',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 6,
    id: 'DXL_SOL',
    issuerAddress: 'GsNzxJfFn6zQdJGeYsupJWzUAm57Ba7335mfhWvFiE9Z',
    name: 'Dexlab (Solana)',
    nativeAsset: 'SOL',
    type: 'SOL_ASSET'
  },
  {
    contractAddress: '0x92D6C1e31e14520e676a687F0a93788B716BEff5',
    decimals: 18,
    id: 'DYDX',
    name: 'dYdX',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'DYDX_DYDX',
    name: 'DYDX',
    nativeAsset: 'DYDX_DYDX',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '',
    decimals: 8,
    id: 'DYDX_SOL',
    issuerAddress: '4Hx6Bj56eGyw8EJrrheM6LBQAvVYRikYCWsALeTrwyRU',
    name: 'dYdX (Solana)',
    nativeAsset: 'SOL',
    type: 'SOL_ASSET'
  },
  {
    contractAddress: '0x900b4449236a7bb26b286601dD14d2bDe7a6aC6c',
    decimals: 8,
    id: 'EARTH',
    name: 'Earth Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x913D8ADf7CE6986a8CbFee5A54725D9Eea4F0729',
    decimals: 18,
    id: 'EASY',
    name: 'EASY',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x9eaD0844ea0e890CD0eC6A01e4b65288E6FB20B3',
    decimals: 2,
    id: 'EAUD',
    name: 'FX-T0 eAUD',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x9872E14A43482098c400050D21293778AbA28EDf',
    decimals: 2,
    id: 'ECAD',
    name: 'FX-T0 eCAD',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xcEcB588AF34B1573e87ef66f612329d12BD3D902',
    decimals: 2,
    id: 'ECHF',
    name: 'FX-T0 eCHF',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x1559FA1b8F28238FD5D76D9f434ad86FD20D1559',
    decimals: 18,
    id: 'EDEN',
    name: 'Eden',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xc528c28FEC0A90C083328BC45f587eE215760A0F',
    decimals: 18,
    id: 'EDR',
    name: 'Endor',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x847a5c271421d53872C559e37F525A73057eCA5e',
    decimals: 2,
    id: 'EEUR',
    name: 'FX-T0 eEUR',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x656C00e1BcD96f256F224AD9112FF426Ef053733',
    decimals: 18,
    id: 'EFI',
    name: 'Efinity Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x575990152169e1C1a4867E81C6AE662caEf068fd',
    decimals: 18,
    id: 'EFRONTIERUSD',
    name: 'EfrontierUSD',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x99445865D67B7F15Be5a7DA5D6461a4cbF7803CD',
    decimals: 2,
    id: 'EGBP',
    name: 'FX-T0 eGBP',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xF29F7F4159AD97DEBDd4b187cA48966555e4A723',
    decimals: 0,
    id: 'EJPY',
    name: 'FX-T0 eJPY',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xbf2179859fc6D5BEE9Bf9158632Dc51678a4100e',
    decimals: 18,
    id: 'ELF',
    name: 'aelf',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x761D38e5ddf6ccf6Cf7c55759d5210750B5D60F3',
    decimals: 18,
    id: 'ELON_ETH',
    name: 'Dogelon',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xd6A5aB46ead26f49b03bBB1F9EB1Ad5c1767974a',
    decimals: 18,
    id: 'EMON',
    name: 'EthermonToken',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x95dAaaB98046846bF4B2853e23cba236fa394A31',
    decimals: 8,
    id: 'EMONT',
    name: 'EtheremonToken',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xbdbC2a5B32F3a5141ACd18C39883066E4daB9774',
    decimals: 8,
    id: 'EMRX',
    name: 'Emirex Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x074699497F924682229f2Beee64aaC6F6e05F5c4',
    decimals: 2,
    id: 'EMXN',
    name: 'FX-T0 eMXN',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x6eCD91444f3570E28608B718c31bF3C111Ea5D8F',
    decimals: 18,
    id: 'ENDEREDGEUSD',
    name: 'EnderEdgeUSD',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xf0Ee6b27b759C9893Ce4f094b49ad28fd15A23e4',
    decimals: 8,
    id: 'ENG',
    name: 'Enigma',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xF629cBd94d3791C9250152BD8dfBDF380E2a3B9c',
    decimals: 18,
    id: 'ENJ',
    name: 'Enjin Coin',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72',
    decimals: 18,
    id: 'ENS2',
    name: 'Ethereum Name Service',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x9A24B8E8A6D4563c575A707b1275381119298E60',
    decimals: 18,
    id: 'ENVY',
    name: 'EVNY Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x1067756c6d6292651B33ba9e4586f5d2893A08d4',
    decimals: 2,
    id: 'ENZD',
    name: 'FX-T0 eNZD',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 4,
    id: 'EOS',
    name: 'EOS',
    nativeAsset: 'EOS',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '',
    decimals: 4,
    id: 'EOS_TEST',
    name: 'EOS Test',
    nativeAsset: 'EOS_TEST',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '0xDaF88906aC1DE12bA2b1D2f7bfC94E9638Ac40c4',
    decimals: 18,
    id: 'EPK',
    name: 'EpiK Protocol',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xA7f552078dcC247C2684336020c03648500C6d9F',
    decimals: 18,
    id: 'EPS_BSC',
    name: 'Ellipsis (BSC)',
    nativeAsset: 'BNB_BSC',
    type: 'BEP20'
  },
  {
    contractAddress: '0x8eCb1cA966b6804B129D3c0F9771e079cbF48EFe',
    decimals: 18,
    id: 'EPT',
    name: 'e-Pocket',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xF9986D445ceD31882377b5D6a5F58EaEa72288c3',
    decimals: 18,
    id: 'ERD',
    name: 'Elrond',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xBBc2AE13b23d715c30720F079fcd9B4a74093505',
    decimals: 18,
    id: 'ERN',
    name: 'EthernityChain Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x92A5B04D0ED5D94D7a193d1d334D3D16996f4E13',
    decimals: 18,
    id: 'ERT',
    name: 'Eristica',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xE4Cfc3259c678Cc4d69D18E90E9A52764D8725ea',
    decimals: 2,
    id: 'ERUB',
    name: 'FX-T0 eRUB',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x36F3FD68E7325a35EB768F1AedaAe9EA0689d723',
    decimals: 18,
    id: 'ESD',
    name: 'Empty Set Dollar',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'ETC',
    name: 'Ethereum Classic',
    nativeAsset: 'ETC',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'ETC_TEST',
    name: 'Ethereum Classic Test',
    nativeAsset: 'ETC_TEST',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'ETH',
    name: 'Ethereum',
    nativeAsset: 'ETH',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8',
    decimals: 18,
    id: 'ETH_BSC',
    name: 'Binance-Peg Ethereum (BSC)',
    nativeAsset: 'BNB_BSC',
    type: 'BEP20'
  },
  {
    contractAddress: '0x74b23882a30290451A17c44f4F05243b6b58C76d',
    decimals: 18,
    id: 'ETH_FTM',
    name: 'Multichain Bridged WETH',
    nativeAsset: 'FTM_FANTOM',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 8,
    id: 'ETH_SOL',
    issuerAddress: '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs',
    name: 'Ether (Solana)',
    nativeAsset: 'SOL',
    type: 'SOL_ASSET'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'ETH_TEST5',
    name: 'Ethereum Test (Sepolia)',
    nativeAsset: 'ETH_TEST5',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'ETH_TEST6',
    name: 'Ethereum Test (Holesky)',
    nativeAsset: 'ETH_TEST6',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'ETH_ZKEVM',
    name: 'Ethereum (zkEVM)',
    nativeAsset: 'ETH_ZKEVM',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'ETH_ZKEVM_TEST',
    name: 'Ethereum (zkEVM Test)',
    nativeAsset: 'ETH_ZKEVM_TEST',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'ETH_ZKSYNC_ERA',
    name: 'Ethereum (zkSync Era)',
    nativeAsset: 'ETH_ZKSYNC_ERA',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'ETH_ZKSYNC_ERA_SEPOLIA',
    name: 'Ethereum (zkSync Era Sepolia)',
    nativeAsset: 'ETH_ZKSYNC_ERA_SEPOLIA',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'ETH_ZKSYNC_ERA_TEST',
    name: 'Ethereum (zkSync Era Test)',
    nativeAsset: 'ETH_ZKSYNC_ERA_TEST',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'ETH-AETH',
    name: 'Ethereum (Arbitrum)',
    nativeAsset: 'ETH-AETH',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'ETH-AETH_RIN',
    name: 'Arbitrum Rinkeby',
    nativeAsset: 'ETH-AETH_RIN',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'ETH-AETH_SEPOLIA',
    name: 'Arbitrum Sepolia',
    nativeAsset: 'ETH-AETH_SEPOLIA',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'ETH-OPT',
    name: 'Optimistic Ethereum',
    nativeAsset: 'ETH-OPT',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'ETH-OPT_KOV',
    name: 'Optimistic Ethereum (Kovan)',
    nativeAsset: 'ETH-OPT_KOV',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'ETH-OPT_SEPOLIA',
    name: 'Optimistic Ethereum (Sepolia)',
    nativeAsset: 'ETH-OPT_SEPOLIA',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'ETHW',
    name: 'EthereumPoW',
    nativeAsset: 'ETHW',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '0xdBd4d868854575867b9403e751837c9957A016ab',
    decimals: 2,
    id: 'ETRY',
    name: 'FX-T0 eTRY',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x6aB4A7d75B0A42B6Bc83E852daB9E121F9C610Aa',
    decimals: 18,
    id: 'EUM',
    name: 'Elitium',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 7,
    id: 'EURC_XLM',
    issuerAddress: 'GDHU6WRG4IEQXM5NZ4BMPKOXHW76MZM4Y2IEMFDVXBSDP6SJY4ITNPP2',
    name: 'EURC (Stellar)',
    nativeAsset: 'XLM',
    type: 'XLM_ASSET'
  },
  {
    contractAddress: '0x1aBaEA1f7C830bD89Acc67eC4af516284b1bC33c',
    decimals: 6,
    id: 'EUROC_ETH_F5NG',
    name: 'EURC',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xdB25f211AB05b1c97D595516F45794528a807ad8',
    decimals: 2,
    id: 'EURS',
    name: 'STASIS EURS Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xC581b735A1688071A1746c968e0798D642EDE491',
    decimals: 6,
    id: 'EURT_ERC20',
    name: 'Tether EUR (ERC20)',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xf756b5A7209D905d3897A2efB41e2C94b60d1149',
    decimals: 2,
    id: 'EUSD',
    name: 'FX-T0 eUSD',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'EVMOS',
    name: 'Evmos',
    nativeAsset: 'EVMOS',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '0x9aF15D7B8776fa296019979E70a5BE53c714A7ec',
    decimals: 18,
    id: 'EVN',
    name: 'Evn Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xf3Db5Fa2C66B7aF3Eb0C0b782510816cbe4813b8',
    decimals: 4,
    id: 'EVX',
    name: 'Everex',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x1E8D772EC5085578bDA258b696453e323296e048',
    decimals: 8,
    id: 'EXD',
    name: 'Escada',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x6468e79A80C0eaB0F9A2B574c8d5bC374Af59414',
    decimals: 18,
    id: 'EXRD',
    name: 'E-RADIX',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x5512014efa6Cd57764Fa743756F7a6Ce3358cC83',
    decimals: 18,
    id: 'EZ_BSC',
    name: 'EASY V2 (BSC)',
    nativeAsset: 'BNB_BSC',
    type: 'BEP20'
  },
  {
    contractAddress: '0xED18EA36382838ED0039b3a197EB6BAa4B59BE7F',
    decimals: 2,
    id: 'EZAR',
    name: 'FX-T0 eZAR',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x1D3E6CC37b930977dFF8452cEE7b5db870e71679',
    decimals: 18,
    id: 'FALCONXUSD',
    name: 'FalconXUSD',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 6,
    id: 'FANT_SOL',
    issuerAddress: 'FANTafPFBAt93BNJVpdu25pGPmca3RfwdsDsRrT3LX1r',
    name: 'Phantasia (Solana)',
    nativeAsset: 'SOL',
    type: 'SOL_ASSET'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'FASTEX_BAHAMUT',
    name: 'Fastex Bahamut',
    nativeAsset: 'FASTEX_BAHAMUT',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '',
    decimals: 8,
    id: 'FB_ATHENA_TEST',
    name: 'FB Private Test',
    nativeAsset: 'FB_ATHENA_TEST',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '0xF4d861575ecC9493420A3f5a14F85B13f0b50EB3',
    decimals: 18,
    id: 'FCL',
    name: 'Fractal Protocol Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x956F47F50A910163D8BF957Cf5846D573E7f87CA',
    decimals: 18,
    id: 'FEI',
    name: 'Fei USD',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xaea46A60368A7bD060eec7DF8CBa43b7EF41Ad85',
    decimals: 18,
    id: 'FET',
    name: 'Fetch',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x0D8Ce2A99Bb6e3B7Db580eD848240e4a0F9aE153',
    decimals: 18,
    id: 'FIL_BSC',
    name: 'Binance-Peg Filecoin (BSC)',
    nativeAsset: 'BNB_BSC',
    type: 'BEP20'
  },
  {
    contractAddress: '0xef3A930e1FfFFAcd2fc13434aC81bD278B0ecC8d',
    decimals: 18,
    id: 'FIS',
    name: 'StaFi',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x3a3Df212b7AA91Aa0402B9035b098891d276572B',
    decimals: 18,
    id: 'FISH_POLYGON',
    name: 'Polycat Finance (Polygon)',
    nativeAsset: 'MATIC_POLYGON',
    type: 'ERC20'
  },
  {
    contractAddress: '0xFcF8eda095e37A41e002E266DaAD7efC1579bc0A',
    decimals: 18,
    id: 'FLEX',
    name: 'FLEX Coin',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x98Dd7eC28FB43b3C4c770AE532417015fa939Dd3',
    decimals: 18,
    id: 'FLEX_SMARTBCH',
    name: 'FLEX Coin (SmartBCH)',
    nativeAsset: 'SMARTBCH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x2B93824ad1c8c2DD79351FaCaE9473eAEf062366',
    decimals: 18,
    id: 'FLEXBTC',
    name: 'flexBTC',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x40fB4096E0ACbf97D0087C3b7e4c6794Aa24a32f',
    decimals: 18,
    id: 'FLEXETH',
    name: 'flexETH',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xa774FFB4AF6B0A91331C084E1aebAE6Ad535e6F3',
    decimals: 18,
    id: 'FLEXUSD',
    name: 'flexUSD',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x7b2B3C5308ab5b2a1d9a94d20D35CCDf61e05b72',
    decimals: 18,
    id: 'FLEXUSD_SMARTBCH',
    name: 'flexUSD (SmartBCH)',
    nativeAsset: 'SMARTBCH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x43f11c02439e2736800433b4594994Bd43Cd066D',
    decimals: 9,
    id: 'FLOKI',
    name: 'FLOKI old',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x2B3F34e9D4b127797CE6244Ea341a83733ddd6E4',
    decimals: 9,
    id: 'FLOKI_BSC',
    name: 'FLOKI old (BSC)',
    nativeAsset: 'BNB_BSC',
    type: 'BEP20'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'FLR',
    name: 'Flare',
    nativeAsset: 'FLR',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '0x6243d8CEA23066d098a15582d81a598b4e8391F4',
    decimals: 18,
    id: 'FLX',
    name: 'Flex Ungovernance Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x7bf3B1922F00C106865fE97a9767b445975D0f71',
    decimals: 18,
    id: 'FLY',
    name: 'Fly Coin',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x85f6eB2BD5a062f5F8560BE93FB7147e16c81472',
    decimals: 4,
    id: 'FLY_1',
    name: 'Franklin',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x314f951d144b397a088EA9eAc5218bdC7db2Ed4a',
    decimals: 18,
    id: 'FLY_OLD',
    name: 'Fly Coin (Old)',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x67c4729aD44201972E8Bf5Ad2addaBE9DFea4e37',
    decimals: 18,
    id: 'FLY_SMARTBCH',
    name: 'Fly Coin (SmartBCH)',
    nativeAsset: 'SMARTBCH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x4946Fcea7C692606e8908002e55A582af44AC121',
    decimals: 18,
    id: 'FOAM',
    name: 'FOAM',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x4C2e59D098DF7b6cBaE0848d66DE2f8A4889b9C3',
    decimals: 18,
    id: 'FODL',
    name: 'Fodl',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xe14026c2f4EdD463791DA1991c74Cf16975942f6',
    decimals: 18,
    id: 'FOLKVANGUSD',
    name: 'FolkvangUSD',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x1FCdcE58959f536621d76f5b7FfB955baa5A672F',
    decimals: 18,
    id: 'FOR',
    name: 'The Force Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xDb298285FE4C5410B05390cA80e8Fbe9DE1F259B',
    decimals: 18,
    id: 'FOREX',
    name: 'handleFOREX',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x77FbA179C79De5B7653F68b5039Af940AdA60ce0',
    decimals: 18,
    id: 'FORTH',
    name: 'Ampleforth Governance',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xc770EEfAd204B5180dF6a14Ee197D99d808ee52d',
    decimals: 18,
    id: 'FOX',
    name: 'FOX',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x853d955aCEf822Db058eb8505911ED77F175b99e',
    decimals: 18,
    id: 'FRAX',
    name: 'Frax',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xD24C2Ad096400B6FBcd2ad8B24E7acBc21A1da64',
    decimals: 18,
    id: 'FRAX_AVAX',
    name: 'Frax (Avalanche)',
    nativeAsset: 'AVAX',
    type: 'ERC20'
  },
  {
    contractAddress: '0xf8C3527CC04340b208C854E985240c02F7B7793f',
    decimals: 18,
    id: 'FRONT',
    name: 'Frontier Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xD0352a019e9AB9d757776F532377aAEbd36Fd541',
    decimals: 18,
    id: 'FSN',
    name: 'Fusion',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x0E192d382a36De7011F795Acc4391Cd302003606',
    decimals: 18,
    id: 'FST',
    name: 'Futureswap Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x274AA8B58E8C57C4e347C8768ed853Eb6D375b48',
    decimals: 18,
    id: 'FSUSHI',
    name: 'FARM_SUSHI',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x4E15361FD6b4BB609Fa63C81A2be19d873717870',
    decimals: 18,
    id: 'FTM',
    name: 'Fantom Token (ERC20)',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xAD29AbB318791D579433D831ed122aFeAf29dcfe',
    decimals: 18,
    id: 'FTM_BSC',
    name: 'Fantom (BSC)',
    nativeAsset: 'BNB_BSC',
    type: 'BEP20'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'FTM_FANTOM',
    name: 'Fantom',
    nativeAsset: 'FTM_FANTOM',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '0x50D1c9771902476076eCFc8B2A83Ad6b9355a4c9',
    decimals: 18,
    id: 'FTT',
    name: 'FTX Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 8,
    id: 'FTT_SOL',
    issuerAddress: 'EzfgjvkSwthhgHaceR3LnKXUoRkP6NUhfghdaHAj1tUv',
    name: 'FTX Token (Solana)',
    nativeAsset: 'SOL',
    type: 'SOL_ASSET'
  },
  {
    contractAddress: '0x419D0d8BdD9aF5e606Ae2232ed285Aff190E711b',
    decimals: 8,
    id: 'FUN',
    name: 'FunFair',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x35bD01FC9d6D5D81CA9E055Db88Dc49aa2c699A8',
    decimals: 18,
    id: 'FWB',
    name: 'Friends With Benefits Pro',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x8a40c222996f9F3431f63Bf80244C36822060f12',
    decimals: 18,
    id: 'FXF',
    name: 'Finxflo',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x3432B6A60D23Ca0dFCa7761B7ab56459D9C964D0',
    decimals: 18,
    id: 'FXS',
    name: 'Frax Share',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x214DB107654fF987AD859F34125307783fC8e387',
    decimals: 18,
    id: 'FXS_AVAX',
    name: 'Frax Share (Avalanche)',
    nativeAsset: 'AVAX',
    type: 'ERC20'
  },
  {
    contractAddress: '0xaaEfF6C96F952Fc67379dcFa1667fC32AF02069B',
    decimals: 18,
    id: 'FXTE',
    name: 'FutureX Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x15D4c048F83bd7e37d49eA4C83a07267Ec4203dA',
    decimals: 8,
    id: 'GALA',
    name: 'Gala V1',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xd1d2Eb1B1e90B638588728b4130137D262C87cae',
    decimals: 8,
    id: 'GALA2',
    name: 'Gala V2',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x63f88A2298a5c4AEE3c216Aa6D926B184a4b2437',
    decimals: 18,
    id: 'GAME',
    name: 'Game Credits',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 9,
    id: 'GARI_SOL',
    issuerAddress: 'CKaKtYvz6dKPyMvYq9Rh3UBrnNqYZAyd7iF4hJtjUvks',
    name: 'Gari (Solana)',
    nativeAsset: 'SOL',
    type: 'SOL_ASSET'
  },
  {
    contractAddress: '0x9d7630aDF7ab0b0CB00Af747Db76864df0EC82E4',
    decimals: 18,
    id: 'GATE',
    name: 'GATE',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x86B4dBE5D203e634a12364C0e428fa242A3FbA98',
    decimals: 18,
    id: 'GBPT_ETH_APNR',
    name: 'poundtoken',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xc67B12049c2D0CF6e476BC64c7F82fc6C63cFFc5',
    decimals: 8,
    id: 'GDT',
    name: 'Globe Derivative Exchange',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 9,
    id: 'GENE_SOL',
    issuerAddress: 'GENEtH5amGSi8kHAtQoezp1XEXwZJ8vcuePYnXdKrMYz',
    name: 'Genopets (Solana)',
    nativeAsset: 'SOL',
    type: 'SOL_ASSET'
  },
  {
    contractAddress: '0x8a854288a5976036A725879164Ca3e91d30c6A1B',
    decimals: 18,
    id: 'GET',
    name: 'GET Protocol',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xAaEf88cEa01475125522e117BFe45cF32044E238',
    decimals: 18,
    id: 'GF',
    name: 'GuildFi Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x7F969C4D388Ca0AE39A4FdDB1A6f89878CA2fBf8',
    decimals: 18,
    id: 'GGC',
    name: 'GGCOIN',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x3F382DbD960E3a9bbCeaE22651E88158d2791550',
    decimals: 18,
    id: 'GHST',
    name: 'Aavegotchi GHST Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x038a68FF68c393373eC894015816e33Ad41BD564',
    decimals: 18,
    id: 'GLCH',
    name: 'Glitch',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x7DD9c5Cba05E151C895FDe1CF355C9A1D5DA6429',
    decimals: 18,
    id: 'GLM',
    name: 'Golem Network Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'GLMR_GLMR',
    name: 'Moonbeam',
    nativeAsset: 'GLMR_GLMR',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '',
    decimals: 9,
    id: 'GMT_SOL',
    issuerAddress: '7i5KKsX2weiTkry7jA4ZwSuXGhs5eJBEjY8vVxR4pfRx',
    name: 'GMT _Solana_',
    nativeAsset: 'SOL',
    type: 'SOL_ASSET'
  },
  {
    contractAddress: '0x6810e776880C02933D47DB1b9fc05908e5386b96',
    decimals: 18,
    id: 'GNO',
    name: 'Gnosis',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xa74476443119A942dE498590Fe1f2454d7D4aC0d',
    decimals: 18,
    id: 'GNT',
    name: 'Golem',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 9,
    id: 'GOFX_SOL',
    issuerAddress: 'GFX1ZjR2P15tmrSwow6FjyDYcEkoFb4p4gJCpLBjaxHD',
    name: 'GooseFX',
    nativeAsset: 'SOL',
    type: 'SOL_ASSET'
  },
  {
    contractAddress: '0x0ab87046fBb341D058F17CBC4c1133F25a20a52f',
    decimals: 18,
    id: 'GOHM',
    name: 'Governance OHM',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xeEAA40B28A2d1b0B08f6f97bB1DD4B75316c6107',
    decimals: 18,
    id: 'GOVI',
    name: 'GOVI',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x71dF9Dd3e658f0136c40E2E8eC3988a5226E9A67',
    decimals: 18,
    id: 'GRAPEFRUITUSD',
    name: 'GrapefruitUSD',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x09e64c2B61a5f1690Ee6fbeD9baf5D6990F8dFd0',
    decimals: 18,
    id: 'GRO',
    name: 'Growth',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xc944E90C64B2c07662A292be6244BDf05Cda44a7',
    decimals: 18,
    id: 'GRT',
    name: 'Graph Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x228ba514309FFDF03A81a205a6D040E429d6E80C',
    decimals: 18,
    id: 'GSC',
    name: 'Global Social Chain',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xe530441f4f73bDB6DC2fA5aF7c3fC5fD551Ec838',
    decimals: 4,
    id: 'GSE',
    name: 'GSENetwork',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xB70835D7822eBB9426B56543E391846C107bd32C',
    decimals: 18,
    id: 'GTC',
    name: 'Game.com',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xDe30da39c46104798bB5aA3fe8B9e0e1F348163F',
    decimals: 18,
    id: 'GTC_ETH',
    name: 'Gitcoin',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'GUN_TEST',
    name: 'GUN_TEST',
    nativeAsset: 'GUN_TEST',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '0xf7B098298f7C69Fc14610bf71d5e02c60792894C',
    decimals: 3,
    id: 'GUP',
    name: 'Matchpool',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x056Fd409E1d7A124BD7017459dFEa2F387b6d5Cd',
    decimals: 2,
    id: 'GUSD',
    name: 'Gemini USD',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xC08512927D12348F6620a698105e1BAac6EcD911',
    decimals: 6,
    id: 'GYEN',
    name: 'GMO JPY',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x4AC00f287f36A6Aad655281fE1cA6798C9cb727b',
    decimals: 18,
    id: 'GZE',
    name: 'GazeCoin',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 8,
    id: 'HBAR',
    name: 'Hedera Hashgraph',
    nativeAsset: 'HBAR',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '',
    decimals: 8,
    id: 'HBAR_TEST',
    name: 'Hedera Hashgraph Test',
    nativeAsset: 'HBAR_TEST',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '',
    decimals: 6,
    id: 'HBB_SPL',
    issuerAddress: 'HBB111SCo9jkCejsZfz8Ec8nH7T6THF8KEKSnvwT6XK6',
    name: 'Hubble Protocol Token (SPL)',
    nativeAsset: 'SOL',
    type: 'SOL_ASSET'
  },
  {
    contractAddress: '0x0316EB71485b0Ab14103307bf65a021042c6d380',
    decimals: 18,
    id: 'HBTC',
    name: 'Huobi BTC',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xE34e1944E776f39B9252790a0527eBDa647aE668',
    decimals: 18,
    id: 'HBZ',
    name: 'HBZ coin',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xF1290473E210b2108A85237fbCd7b6eb42Cc654F',
    decimals: 18,
    id: 'HEDG',
    name: 'HEDG',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x584bC13c7D411c00c01A62e8019472dE68768430',
    decimals: 18,
    id: 'HEGIC',
    name: 'Hegic',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x49C7295ff86EaBf5bf58C6eBC858DB4805738c01',
    decimals: 18,
    id: 'HERA_BSC',
    name: 'Hero Arena',
    nativeAsset: 'BNB_BSC',
    type: 'BEP20'
  },
  {
    contractAddress: '0x2b591e99afE9f32eAA6214f7B7629768c40Eeb39',
    decimals: 8,
    id: 'HEX',
    name: 'HEX',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x77087aB5Df23cFB52449A188e80e9096201c2097',
    decimals: 18,
    id: 'HI_BSC',
    name: 'hi Dollar (BSC)',
    nativeAsset: 'BNB_BSC',
    type: 'BEP20'
  },
  {
    contractAddress: '0xd1ba9BAC957322D6e8c07a160a3A8dA11A0d2867',
    decimals: 18,
    id: 'HMT',
    name: 'Human Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 8,
    id: 'HNT_SOL',
    issuerAddress: 'hntyVP6YFm1Hg25TN9WGLqM12b8TQmcknKrdu1oxWux',
    name: 'Helium Network Token (Solana)',
    nativeAsset: 'SOL',
    type: 'SOL_ASSET'
  },
  {
    contractAddress: '0x6c6EE5e31d828De241282B9606C8e98Ea48526E2',
    decimals: 18,
    id: 'HOT1',
    name: 'Holo',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x9AF839687F6C94542ac5ece2e317dAAE355493A1',
    decimals: 18,
    id: 'HOT2',
    name: 'Hydro Protocol',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x554C20B7c486beeE439277b4540A434566dC4C02',
    decimals: 18,
    id: 'HST',
    name: 'Decision Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x6f259637dcD74C767781E37Bc6133cd6A68aa161',
    decimals: 18,
    id: 'HT',
    name: 'Huobi Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'HT_CHAIN',
    name: 'HT Chain',
    nativeAsset: 'HT_CHAIN',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'HT_CHAIN_TEST',
    name: 'HT Chain Test',
    nativeAsset: 'HT_CHAIN_TEST',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '0xdF574c24545E5FfEcb9a659c229253D4111d87e1',
    decimals: 8,
    id: 'HUSD',
    name: 'Huobi USD',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x4bD70556ae3F8a6eC6C4080A0C327B24325438f3',
    decimals: 18,
    id: 'HXRO',
    name: 'Hxro',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 2,
    id: 'IBAN_CHF',
    name: 'CHF (IBAN)',
    nativeAsset: 'IBAN_CHF',
    type: 'FIAT'
  },
  {
    contractAddress: '',
    decimals: 2,
    id: 'IBAN_EUR',
    name: 'EUR (IBAN)',
    nativeAsset: 'IBAN_EUR',
    type: 'FIAT'
  },
  {
    contractAddress: '',
    decimals: 2,
    id: 'IBAN_SGD',
    name: 'SGD (IBAN)',
    nativeAsset: 'IBAN_SGD',
    type: 'FIAT'
  },
  {
    contractAddress: '',
    decimals: 2,
    id: 'IBAN_USD',
    name: 'USD (IBAN)',
    nativeAsset: 'IBAN_USD',
    type: 'FIAT'
  },
  {
    contractAddress: '0xf16e81dce15B08F326220742020379B855B87DF9',
    decimals: 18,
    id: 'ICE',
    name: 'Ice Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xB705268213D593B8FD88d3FDEFF93AFF5CbDcfAE',
    decimals: 18,
    id: 'IDEX',
    name: 'IDEX Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x61fd1c62551850D0c04C76FcE614cBCeD0094498',
    decimals: 8,
    id: 'IDK',
    name: 'IDKToken',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x12c5E73Ddb44cD70225669B9F6f0d9DE5455Bc31',
    decimals: 18,
    id: 'IDON',
    name: 'Idoneus Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x998FFE1E43fAcffb941dc337dD0468d52bA5b48A',
    decimals: 2,
    id: 'IDRT',
    name: 'Rupiah',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x66207E39bb77e6B99aaB56795C7c340C08520d83',
    decimals: 2,
    id: 'IDRTBEP_BSC',
    name: 'Rupiah Token (BSC)',
    nativeAsset: 'BNB_BSC',
    type: 'BEP20'
  },
  {
    contractAddress: '0x9f059eDcf1C111e9C5987f884abBfEc0F80acFbB',
    decimals: 2,
    id: 'IDRTBEP_BSC_TEST',
    name: 'Rupiah Token (BSC TEST)',
    nativeAsset: 'BNB_TEST',
    type: 'BEP20'
  },
  {
    contractAddress: '0xF784682C82526e245F50975190EF0fff4E4fC077',
    decimals: 8,
    id: 'ILK',
    name: 'Inlock Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x767FE9EDC9E0dF98E07454847909b5E959D7ca0E',
    decimals: 18,
    id: 'ILV',
    name: 'Illuvium',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x13119E34E140097a507B07a5564bDe1bC375D9e6',
    decimals: 18,
    id: 'IMT',
    name: 'Moneytoken',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xF57e7e7C23978C3cAEC3C3548E3D615c346e79fF',
    decimals: 18,
    id: 'IMX_ERC20',
    name: 'Immutable X',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'IMX_ZKEVM',
    name: 'Immutable zkEVM',
    nativeAsset: 'IMX_ZKEVM',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'IMX_ZKEVM_TEST',
    name: 'Immutable zkEVM Test',
    nativeAsset: 'IMX_ZKEVM_TEST',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '0x17Aa18A4B64A55aBEd7FA543F2Ba4E91f2dcE482',
    decimals: 18,
    id: 'INB',
    name: 'Insight Chain',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x0954906da0Bf32d5479e25f46056d22f08464cab',
    decimals: 18,
    id: 'INDEX',
    name: 'Index',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xe28b3B32B6c345A34Ff64674606124Dd5Aceca30',
    decimals: 18,
    id: 'INJ',
    name: 'Injective Token (Ethereum)',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'INJ_INJ',
    name: 'Injective',
    nativeAsset: 'INJ_INJ',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'INJ_TEST',
    name: 'Injective Test',
    nativeAsset: 'INJ_TEST',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '0x5B2e4a700dfBc560061e957edec8F6EeEb74a320',
    decimals: 10,
    id: 'INS',
    name: 'Insolar',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x6f40d4A6237C257fff2dB00FA0510DeEECd303eb',
    decimals: 18,
    id: 'INST',
    name: 'Instadapp',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x544c42fBB96B39B21DF61cf322b5EDC285EE7429',
    decimals: 18,
    id: 'INSUR',
    name: 'InsurAce',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xBBC7f7A6AADAc103769C66CBC69AB720f7F9Eae3',
    decimals: 18,
    id: 'INX',
    name: 'INX token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xa8006C4ca56F24d6836727D106349320dB7fEF82',
    decimals: 8,
    id: 'INXT',
    name: 'Internxt',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x02D3A27Ac3f55d5D91Fb0f52759842696a864217',
    decimals: 18,
    id: 'IONX',
    name: 'Charged Particles - IONX',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xFA1a856Cfa3409CFa145Fa4e20Eb270dF3EB21ab',
    decimals: 18,
    id: 'IOST',
    name: 'IOST',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xd944f1D1e9d5f9Bb90b62f9D45e447D989580782',
    decimals: 6,
    id: 'IOTA_BSC',
    name: 'MIOTAC (BSC)',
    nativeAsset: 'BNB_BSC',
    type: 'BEP20'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'IOTA_EVM',
    name: 'IOTA EVM',
    nativeAsset: 'IOTA_EVM',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '0x6fB3e0A217407EFFf7Ca062D46c26E5d60a14d69',
    decimals: 18,
    id: 'IOTX',
    name: 'IoTeX',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'IOTX_IOTEX',
    name: 'IoTex',
    nativeAsset: 'IOTX_IOTEX',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '0x001F0aA5dA15585e5b2305DbaB2bac425ea71007',
    decimals: 18,
    id: 'IPSX',
    name: 'IP Exchange',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xF88b137cfa667065955ABD17525e89EDCF4D6426',
    decimals: 18,
    id: 'ITG',
    name: 'iTrust Governance Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x585E7bC75089eD111b656faA7aeb1104F5b96c15',
    decimals: 8,
    id: 'JLINK_AVAX',
    name: 'Banker Joe Link (Avalanche)',
    nativeAsset: 'AVAX',
    type: 'ERC20'
  },
  {
    contractAddress: '0xeD8CBD9F0cE3C6986b22002F03c6475CEb7a6256',
    decimals: 18,
    id: 'JLP_AVAX',
    name: 'Joe LP Token (Avalanche)',
    nativeAsset: 'AVAX',
    type: 'ERC20'
  },
  {
    contractAddress: '0x6e84a6216eA6dACC71eE8E6b0a5B7322EEbC0fDd',
    decimals: 18,
    id: 'JOE_AVAX',
    name: 'JoeToken (Avalanche)',
    nativeAsset: 'AVAX',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 9,
    id: 'JTO_SOL',
    issuerAddress: 'jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL',
    name: 'JITO (Solana)',
    nativeAsset: 'SOL',
    type: 'SOL_ASSET'
  },
  {
    contractAddress: '0x4B1E80cAC91e2216EEb63e29B957eB91Ae9C2Be8',
    decimals: 18,
    id: 'JUP',
    name: 'Jupiter',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 6,
    id: 'JUP_SOL',
    issuerAddress: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
    name: 'Jupiter (Solana)',
    nativeAsset: 'SOL',
    type: 'SOL_ASSET'
  },
  {
    contractAddress: '0x16EB2971863587fb93E33619772361ecc013cdcC',
    decimals: 18,
    id: 'KARD',
    name: 'Kard Coin',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x2BEb7C3c63Df4C2167839cD7F532338d15beB441',
    decimals: 18,
    id: 'KATLAUSD',
    name: 'KatlaUSD',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x08d1E0A7fBd4eDBF56D81Da21D1b0c9c95Fb507F',
    decimals: 18,
    id: 'KAVA',
    name: 'Kava',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'KAVA_KAVA',
    name: 'KAVA',
    nativeAsset: 'KAVA_KAVA',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '0xf3586684107CE0859c44aa2b2E0fB8cd8731a15a',
    decimals: 7,
    id: 'KBC',
    name: 'Karatgold Coin',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xf34960d9d60be18cC1D5Afc1A6F012A723a28811',
    decimals: 6,
    id: 'KCS',
    name: 'KuCoin Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x95E40E065AFB3059dcabe4aaf404c1F92756603a',
    decimals: 18,
    id: 'KDAG',
    name: 'King DAG',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x85Eee30c52B0b379b046Fb0F85F4f3Dc3009aFEC',
    decimals: 18,
    id: 'KEEP',
    name: 'Keep Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x4ABB9cC67BD3da9Eb966d1159A71a0e68BD15432',
    decimals: 18,
    id: 'KEL',
    name: 'KelVpn Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x4CC19356f2D37338b9802aa8E8fc58B0373296E7',
    decimals: 18,
    id: 'KEY',
    name: 'SelfKey',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xEF53462838000184F35f7D991452e5f25110b207',
    decimals: 18,
    id: 'KFT',
    name: 'Knit Finance',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x818Fc6C2Ec5986bc6E2CBf00939d90556aB12ce5',
    decimals: 18,
    id: 'KIN',
    name: 'Kin',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 5,
    id: 'KIN_SOL',
    issuerAddress: 'kinXdEcpDQeHPEuQnqmUgtYykqKGVFq6CeVX5iAHJq6',
    name: 'KIN (Solana)',
    nativeAsset: 'SOL',
    type: 'SOL_ASSET'
  },
  {
    contractAddress: '0xCbfef8fdd706cde6F208460f2Bf39Aa9c785F05D',
    decimals: 18,
    id: 'KINE',
    name: 'Kine Governance Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xB1191F691A355b43542Bea9B8847bc73e7Abb137',
    decimals: 18,
    id: 'KIRO',
    name: 'Kirobo',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'KLAY_KAIA',
    name: 'Kaia',
    nativeAsset: 'KLAY_KAIA',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '0xdeFA4e8a7bcBA345F687a2f1456F5Edd9CE97202',
    decimals: 18,
    id: 'KNC',
    name: 'Kyber Network Crystal v2',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xdd974D5C2e2928deA5F71b9825b8b646686BD200',
    decimals: 18,
    id: 'KNC_OLD',
    name: 'Kyber Network (Old)',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x7c3E3eAE4d893d11C61E74d5187C962Ba5744A3B',
    decimals: 18,
    id: 'KOKO',
    name: 'Kokoswap Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x7320c128e89bA4584Ab02ed1C9c96285b726443C',
    decimals: 18,
    id: 'KOKO_BSC',
    name: 'Kokoswap Token',
    nativeAsset: 'BNB_BSC',
    type: 'BEP20'
  },
  {
    contractAddress: '0x1cEB5cB57C4D4E2b2433641b95Dd330A33185A44',
    decimals: 18,
    id: 'KP3R',
    name: 'Keep3rV1',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 12,
    id: 'KSM',
    name: 'Kusama',
    nativeAsset: 'KSM',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '0x2aa69E8D25C045B659787BC1f03ce47a388DB6E8',
    decimals: 18,
    id: 'KSM_BSC',
    name: 'Kusama (BSC)',
    nativeAsset: 'BNB_BSC',
    type: 'BEP20'
  },
  {
    contractAddress: '0xac826952bc30504359a099c3a486d44E97415c77',
    decimals: 6,
    id: 'KUSDC',
    name: 'kUSDCoin',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x3a859b9ea4998D344547283C7Ce8EBc4aBb77656',
    decimals: 0,
    id: 'KVT',
    name: 'KinesisVelocityToken',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'LAC',
    name: 'LaCoin (LAC)',
    nativeAsset: 'LAC',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '0xfD107B473AB90e8Fbd89872144a3DC92C40Fa8C9',
    decimals: 18,
    id: 'LALA',
    name: 'LALA World',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 6,
    id: 'LARIX_SOL',
    issuerAddress: 'Lrxqnh6ZHKbGy3dcrCED43nsoLkM1LTzU2jRfWe8qUC',
    name: 'Larix (Solana)',
    nativeAsset: 'SOL',
    type: 'SOL_ASSET'
  },
  {
    contractAddress: '0x77d547256A2cD95F32F67aE0313E450Ac200648d',
    decimals: 8,
    id: 'LAZIO',
    name: 'FC Lazio Fan Token',
    nativeAsset: 'BNB_BSC',
    type: 'BEP20'
  },
  {
    contractAddress: '0xfe5F141Bf94fE84bC28deD0AB966c16B17490657',
    decimals: 18,
    id: 'LBA',
    name: 'Cred',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x5102791cA02FC3595398400BFE0e33d7B6C82267',
    decimals: 18,
    id: 'LDC',
    name: 'Leadcoin',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32',
    decimals: 18,
    id: 'LDO',
    name: 'Lido DAO Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 8,
    id: 'LDO_SOL',
    issuerAddress: 'HZRCwxP2Vq9PCpPXooayhJ2bxTpo5xfpQrwB1svh332p',
    name: 'Lido DAO Token (Solana)',
    nativeAsset: 'SOL',
    type: 'SOL_ASSET'
  },
  {
    contractAddress: '0x80fB784B7eD66730e8b1DBd9820aFD29931aab03',
    decimals: 18,
    id: 'LEND',
    name: 'ETHLend',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x2AF5D2aD76741191D15Dfe7bF6aC92d4Bd912Ca3',
    decimals: 18,
    id: 'LEO',
    name: 'Bitfinex LEO Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xFA3118B34522580c35Ae27F6cf52da1dBb756288',
    decimals: 6,
    id: 'LET',
    name: 'LinkEye Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x1977A9FE002F6dBfFda79b8459Cb4F7036100d41',
    decimals: 6,
    id: 'LGCY',
    name: 'Legacy Coin',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x0a50C93c762fDD6E56D86215C24AaAD43aB629aa',
    decimals: 8,
    id: 'LGO',
    name: 'LGO Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x02F61Fd266DA6E8B102D4121f5CE7b992640CF98',
    decimals: 18,
    id: 'LIKE',
    name: 'LikeCoin',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 9,
    id: 'LIKE_SOL',
    issuerAddress: '3bRTivrVsitbmCTGtqwp7hxXPsybkjn4XLNtPsHqa3zR',
    name: 'Only1 (Solana)',
    nativeAsset: 'SOL',
    type: 'SOL_ASSET'
  },
  {
    contractAddress: '0x9D0B65a76274645B29e4cc41B8f23081fA09f4A3',
    decimals: 18,
    id: 'LIME',
    name: 'iMe Lab',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x3E9BC21C9b189C09dF3eF1B824798658d5011937',
    decimals: 18,
    id: 'LINA',
    name: 'Linear Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'LINEA',
    name: 'Ethereum (Linea)',
    nativeAsset: 'LINEA',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'LINEA_SEPOLIA_TEST',
    name: 'Linea Sepolia Test',
    nativeAsset: 'LINEA_SEPOLIA_TEST',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'LINEA_TEST',
    name: 'Ethereum (Linea Test)',
    nativeAsset: 'LINEA_TEST',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
    decimals: 18,
    id: 'LINK',
    name: 'Chainlink',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD',
    decimals: 18,
    id: 'LINK_BSC',
    name: 'Binance-Peg ChainLink (BSC)',
    nativeAsset: 'BNB_BSC',
    type: 'BEP20'
  },
  {
    contractAddress: '0x5947BB275c521040051D82396192181b413227A3',
    decimals: 18,
    id: 'LINK_E_AVAX',
    name: 'Chainlink Token (Avalanche)',
    nativeAsset: 'AVAX',
    type: 'ERC20'
  },
  {
    contractAddress: '0xb3654dc3D10Ea7645f8319668E8F54d2574FBdC8',
    decimals: 18,
    id: 'LINK_FTM',
    name: 'ChainLink (FTM)',
    nativeAsset: 'FTM_FANTOM',
    type: 'ERC20'
  },
  {
    contractAddress: '0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39',
    decimals: 18,
    id: 'LINK_POLYGON',
    name: 'ChainLink Token (Polygon)',
    nativeAsset: 'MATIC_POLYGON',
    type: 'ERC20'
  },
  {
    contractAddress: '0x2167FB82309CF76513E83B25123f8b0559d6b48f',
    decimals: 18,
    id: 'LION',
    name: 'LionCoin',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'LISK',
    name: 'Lisk',
    nativeAsset: 'LISK',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '0xb59490aB09A0f526Cc7305822aC65f2Ab12f9723',
    decimals: 18,
    id: 'LIT',
    name: 'Litentry',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x80CE3027a70e0A928d9268994e9B85d03Bd4CDcf',
    decimals: 18,
    id: 'LKR',
    name: 'Polkalokr',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x25B6325f5BB1c1E03cfbC3e53F470E1F1ca022E3',
    decimals: 18,
    id: 'LML',
    name: 'LML',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x9c23D67AEA7B95D80942e3836BCDF7E708A747C2',
    decimals: 18,
    id: 'LOCI',
    name: 'LOCIcoin',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x897f505d9637622219e4687eC1A71b4Acf204816',
    decimals: 18,
    id: 'LODE',
    name: 'LODE Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xf4d2888d29D722226FafA5d9B24F9164c092421E',
    decimals: 18,
    id: 'LOOKS',
    name: 'LooksRare Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x42476F744292107e34519F9c357927074Ea3F75D',
    decimals: 18,
    id: 'LOOM',
    name: 'Loom Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xA4e8C3Ec456107eA67d3075bF9e3DF3A75823DB0',
    decimals: 18,
    id: 'LOOM_OLD',
    name: 'Loom Token(Old)',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x6149C26Cd2f7b5CCdb32029aF817123F6E37Df5B',
    decimals: 18,
    id: 'LPOOL',
    name: 'Launchpool token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x58b6A8A3302369DAEc383334672404Ee733aB239',
    decimals: 18,
    id: 'LPT',
    name: 'Livepeer Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x6DEA81C8171D0bA574754EF6F8b412F2Ed88c54D',
    decimals: 18,
    id: 'LQTY',
    name: 'LQTY',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xBBbbCA6A901c926F240b89EacB641d8Aec7AEafD',
    decimals: 18,
    id: 'LRC',
    name: 'Loopring',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 8,
    id: 'LTC',
    name: 'Litecoin',
    nativeAsset: 'LTC',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '0x4338665CBB7B2485A8855A139b75D5e34AB0DB94',
    decimals: 18,
    id: 'LTC_BSC',
    name: 'Binance-Peg Litecoin (BSC)',
    nativeAsset: 'BNB_BSC',
    type: 'BEP20'
  },
  {
    contractAddress: '',
    decimals: 8,
    id: 'LTC_TEST',
    name: 'Litecoin Test',
    nativeAsset: 'LTC_TEST',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '0x3DB6Ba6ab6F95efed1a6E794caD492fAAabF294D',
    decimals: 8,
    id: 'LTO',
    name: 'LTO Network Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xa393473d64d2F9F026B60b6Df7859A689715d092',
    decimals: 8,
    id: 'LTX',
    name: 'Lattice Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 7,
    id: 'LU2426951195_XLM_TEST',
    issuerAddress: 'GD4MGD3UZ5QY6NLH2FMXKOUCHH4NA3NRT3H6KUU5UMDWE52PIPETFBY2',
    name: 'LU2426951195 (Stellar Test)',
    nativeAsset: 'XLM_TEST',
    type: 'XLM_ASSET'
  },
  {
    contractAddress: '',
    decimals: 6,
    id: 'LUNA2',
    name: 'Terra Luna 2.0',
    nativeAsset: 'LUNA2',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '',
    decimals: 6,
    id: 'LUNA2_TEST',
    name: 'Terra Luna 2.0 Test',
    nativeAsset: 'LUNA2_TEST',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '0x5f98805A4E8be255a32880FDeC7F6728C6568bA0',
    decimals: 18,
    id: 'LUSD',
    name: 'LUSD Stablecoin',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xA8b919680258d369114910511cc87595aec0be6D',
    decimals: 18,
    id: 'LYXE',
    name: 'LUKSO',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x0F5D2fB29fb7d3CFeE444a200298f468908cC942',
    decimals: 18,
    id: 'MANA',
    name: 'Decentraland',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'MANTLE',
    name: 'Mantle',
    nativeAsset: 'MANTLE',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'MANTLE_TEST',
    name: 'Mantle Sepolia',
    nativeAsset: 'MANTLE_TEST',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '0x16CDA4028e9E872a38AcB903176719299beAed87',
    decimals: 18,
    id: 'MARS4',
    name: 'MARS4',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x69af81e73A73B40adF4f3d4223Cd9b1ECE623074',
    decimals: 18,
    id: 'MASK',
    name: 'Mask Network',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0',
    decimals: 18,
    id: 'MATIC',
    name: 'Matic Token (Ethereum)',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xCC42724C6683B7E57334c4E856f4c9965ED682bD',
    decimals: 18,
    id: 'MATIC_BSC',
    name: 'Matic Token (BSC)',
    nativeAsset: 'BNB_BSC',
    type: 'BEP20'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'MATIC_POLYGON',
    name: 'Matic Gas Token (Polygon)',
    nativeAsset: 'MATIC_POLYGON',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '',
    decimals: 6,
    id: 'MBS_SOL',
    issuerAddress: 'Fm9rHUTF5v3hwMLbStjZXqNBBoZyGriQaFM6sTFz3K8A',
    name: 'MonkeyBucks (Solana)',
    nativeAsset: 'SOL',
    type: 'SOL_ASSET'
  },
  {
    contractAddress: '0x949D48EcA67b17269629c7194F4b727d4Ef9E5d6',
    decimals: 18,
    id: 'MC_ETH',
    name: 'Merit Circle',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x4e352cF164E64ADCBad318C3a1e222E9EBa4Ce42',
    decimals: 18,
    id: 'MCB',
    name: 'MCDEX Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xB63B606Ac810a52cCa15e44bB630fd42D8d1d83d',
    decimals: 8,
    id: 'MCO',
    name: 'Crypto.com',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xfC98e825A2264D890F9a1e68ed50E1526abCcacD',
    decimals: 18,
    id: 'MCO2',
    name: 'Moss Carbon Credit',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x51DB5Ad35C671a87207d88fC11d593AC0C8415bd',
    decimals: 18,
    id: 'MDA',
    name: 'Moeda Loyalty Points',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 6,
    id: 'MDF_SOL',
    issuerAddress: 'ALQ9KMWjFmxVbew3vMkJj3ypbAKuorSgGst6svCHEe2z',
    name: 'MatrixETF DAO Finance (Solana)',
    nativeAsset: 'SOL',
    type: 'SOL_ASSET'
  },
  {
    contractAddress: '0x947AEb02304391f8fbE5B25D7D98D649b57b1788',
    decimals: 18,
    id: 'MDX',
    name: 'MANDALA EXCHANGE TOKEN',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 6,
    id: 'MEAN_SOL',
    issuerAddress: 'MEANeD3XDdUmNMsRGjASkSWdC8prLYsoRJ61pPeHctD',
    name: 'MEAN (Solana)',
    nativeAsset: 'SOL',
    type: 'SOL_ASSET'
  },
  {
    contractAddress: '0x42dbBd5ae373FEA2FC320F62d44C058522Bb3758',
    decimals: 18,
    id: 'MEM',
    name: 'Memecoin',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xD5525D397898e5502075Ea5E830d8914f6F0affe',
    decimals: 8,
    id: 'MEME',
    name: 'MEME',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xDF2C7238198Ad8B389666574f2d8bc411A4b7428',
    decimals: 18,
    id: 'MFT',
    name: 'Mainframe',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x40395044Ac3c0C57051906dA938B54BD6557F212',
    decimals: 8,
    id: 'MGO',
    name: 'MobileGo',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x99D8a9C45b2ecA8864373A26D1459e3Dff1e17F3',
    decimals: 18,
    id: 'MIM',
    name: 'Magic Internet Money',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xa3Fa99A148fA48D14Ed51d610c367C61876997F1',
    decimals: 18,
    id: 'MIMATIC_POLYGON',
    name: 'miMATIC (Polygon)',
    nativeAsset: 'MATIC_POLYGON',
    type: 'ERC20'
  },
  {
    contractAddress: '0x90B831fa3Bebf58E9744A14D638E25B4eE06f9Bc',
    decimals: 18,
    id: 'MIMO',
    name: 'MIMO Parallel Governance Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x09a3EcAFa817268f77BE1283176B946C4ff2E608',
    decimals: 18,
    id: 'MIR',
    name: 'Wrapped MIR Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x68E374F856bF25468D365E539b700b648Bf94B67',
    decimals: 18,
    id: 'MIST_BSC',
    name: 'Mist',
    nativeAsset: 'BNB_BSC',
    type: 'BEP20'
  },
  {
    contractAddress: '0x3893b9422Cd5D70a81eDeFfe3d5A1c6A978310BB',
    decimals: 18,
    id: 'MITH',
    name: 'Mithril',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x4a527d8fc13C5203AB24BA0944F4Cb14658D1Db6',
    decimals: 18,
    id: 'MITX',
    name: 'Morpheus Labs',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2',
    decimals: 18,
    id: 'MKR',
    name: 'Maker',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x5f0Da599BB2ccCfcf6Fdfd7D81743B6020864350',
    decimals: 18,
    id: 'MKR_BSC',
    name: 'Binance-Peg Maker (BSC)',
    nativeAsset: 'BNB_BSC',
    type: 'BEP20'
  },
  {
    contractAddress: '0xec67005c4E498Ec7f55E092bd1d35cbC47C91892',
    decimals: 18,
    id: 'MLN',
    name: 'Melon',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x9506d37f70eB4C3d79C398d326C871aBBf10521d',
    decimals: 18,
    id: 'MLT_ERC20',
    name: 'MILC Platform',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 9,
    id: 'MNDE_SOL',
    issuerAddress: 'MNDEFzGvMt87ueuHvVU9VcTqsAP5b3fTGPsHuuPA5ey',
    name: 'Marinade (Solana)',
    nativeAsset: 'SOL',
    type: 'SOL_ASSET'
  },
  {
    contractAddress: '',
    decimals: 6,
    id: 'MNGO_SOL',
    issuerAddress: 'MangoCzJ36AjZyKwVj3VnYU4GTonjfVEnJmvvWaxLac',
    name: 'Mango',
    nativeAsset: 'SOL',
    type: 'SOL_ASSET'
  },
  {
    contractAddress: '0xb96525143f23F2e9B2B2B260FCcd8AfC260656c8',
    decimals: 18,
    id: 'MOUNTAIN',
    name: 'Mountain',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x4206Fc377c22eB4778B5DAc3C28d0fa92db43AE4',
    decimals: 18,
    id: 'MOUNTAINVUSD',
    name: 'MountainVUSD',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'MOVR_MOVR',
    name: 'Moonriver',
    nativeAsset: 'MOVR_MOVR',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '0x33349B282065b0284d756F0577FB39c158F935e6',
    decimals: 18,
    id: 'MPL',
    name: 'Maple Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 9,
    id: 'MSOL_SOL',
    issuerAddress: 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So',
    name: 'Marinade staked SOL (Solana)',
    nativeAsset: 'SOL',
    type: 'SOL_ASSET'
  },
  {
    contractAddress: '0xa3BeD4E1c75D00fa6f4E5E6922DB7261B5E9AcD2',
    decimals: 18,
    id: 'MTA',
    name: 'Meta',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xF501dd45a1198C2E1b5aEF5314A68B9006D842E0',
    decimals: 18,
    id: 'MTA_POLYGON',
    name: 'Meta Polygon',
    nativeAsset: 'MATIC_POLYGON',
    type: 'ERC20'
  },
  {
    contractAddress: '0xF433089366899D83a9f26A773D59ec7eCF30355e',
    decimals: 8,
    id: 'MTL',
    name: 'Metal',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xe2f2a5C287993345a840Db3B0845fbC70f5935a5',
    decimals: 18,
    id: 'MUSD',
    name: 'mStable USD',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x3564ad35b9E95340E5Ace2D6251dbfC76098669B',
    decimals: 6,
    id: 'MUSDC',
    name: 'DMM: USDC',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x8E766F57F7d16Ca50B4A0b90b88f6468A09b0439',
    decimals: 18,
    id: 'MXM',
    name: 'Maximine Coin',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xa645264C5603E96c3b0B078cdab68733794B0A71',
    decimals: 8,
    id: 'MYST',
    name: 'Mysterium',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xDf282f170f3C32AC9c49f3f5Be1D68e5aE6Eb742',
    decimals: 8,
    id: 'NAKA',
    name: 'Nakamoto Debt Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x4a615bB7166210CCe20E6642a6f8Fb5d4D044496',
    decimals: 18,
    id: 'NAOS',
    name: 'NAOSToken',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 4,
    id: 'NAXAR_SOL',
    issuerAddress: 'Fp4gjLpTsPqBN6xDGpDHwtnuEofjyiZKxxZxzvJnjxV6',
    name: 'Naxar (Solana)',
    nativeAsset: 'SOL',
    type: 'SOL_ASSET'
  },
  {
    contractAddress: '0x809826cceAb68c387726af962713b64Cb5Cb3CCA',
    decimals: 18,
    id: 'NCASH',
    name: 'NucleusVision',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 24,
    id: 'NEAR',
    name: 'NEAR Protocol',
    nativeAsset: 'NEAR',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '0x1Fa4a73a3F0133f0025378af00236f3aBDEE5D63',
    decimals: 18,
    id: 'NEAR_BSC',
    name: 'Binance-Peg NEAR Protocol',
    nativeAsset: 'BNB_BSC',
    type: 'BEP20'
  },
  {
    contractAddress: '',
    decimals: 24,
    id: 'NEAR_TEST',
    name: 'NEAR Protocol Test',
    nativeAsset: 'NEAR_TEST',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '0xCc80C051057B774cD75067Dc48f8987C4Eb97A5e',
    decimals: 18,
    id: 'NEC',
    name: 'Ethfinex Nectar Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 9,
    id: 'NEST_SOL',
    issuerAddress: 'Czt7Fc4dz6BpLh2vKiSYyotNK2uPPDhvbWrrLeD9QxhV',
    name: 'Nest Arcade (Solana)',
    nativeAsset: 'SOL',
    type: 'SOL_ASSET'
  },
  {
    contractAddress: '0xB62132e35a6c13ee1EE0f84dC5d40bad8d815206',
    decimals: 18,
    id: 'NEXO',
    name: 'Nexo',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xcB8d1260F9c92A3A545d409466280fFdD7AF7042',
    decimals: 18,
    id: 'NFT',
    name: 'NFT Protocol',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xEF40B859D21e4d566a3d713e756197c021BffaAa',
    decimals: 6,
    id: 'NFT1',
    name: 'APENFT',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x87d73E916D7057945c9BcD8cdd94e42A6F47f776',
    decimals: 18,
    id: 'NFTX',
    name: 'NFTX',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xf71982762D141f8679Eb944fAec8cEC415fB5E23',
    decimals: 18,
    id: 'NIAX',
    name: 'NIAXToken',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x25de492f43661Af568f46C0a3F39850Aa1D066A0',
    decimals: 18,
    id: 'NIBBIOUSD',
    name: 'NibbioUSD',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x7e291890B01E5181f7ecC98D79ffBe12Ad23df9e',
    decimals: 18,
    id: 'NIF',
    name: 'Unifty',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x7c8155909cd385F120A56eF90728dD50F9CcbE52',
    decimals: 15,
    id: 'NII',
    name: 'Nahmii',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x852e5427c86A3b46DD25e5FE027bb15f53c4BCb8',
    decimals: 15,
    id: 'NIIFI',
    name: 'NiiFiToken',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 6,
    id: 'NINJA_SOL',
    issuerAddress: 'FgX1WD9WzMU3yLwXaFSarPfkgzjLb2DZCqmkx9ExpuvJ',
    name: 'NINJA',
    nativeAsset: 'SOL',
    type: 'SOL_ASSET'
  },
  {
    contractAddress: '0xc813EA5e3b48BEbeedb796ab42A30C5599b01740',
    decimals: 4,
    id: 'NIOX',
    name: 'Autonio',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x5Cf04716BA20127F1E2297AdDCf4B5035000c9eb',
    decimals: 18,
    id: 'NKN',
    name: 'NKN',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x1776e1F26f98b1A5dF9cD347953a26dd3Cb46671',
    decimals: 18,
    id: 'NMR',
    name: 'Numeraire',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xa8c8CfB141A3bB59FEA1E2ea6B79b5ECBCD7b6ca',
    decimals: 18,
    id: 'NOIA',
    name: 'NOIA Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 9,
    id: 'NOTCOIN_TON',
    issuerAddress: 'EQAvlWFDxGF2lXm67y4yzC17wYKD9A0guwPkMs1gOsM__NOT',
    name: 'Notcoin (Ton)',
    nativeAsset: 'TON',
    type: 'TON_ASSET'
  },
  {
    contractAddress: '0xCFEAead4947f0705A14ec42aC3D44129E1Ef3eD5',
    decimals: 8,
    id: 'NOTE_ETH',
    name: 'Notional',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x25aE7B9808F6Cc3B5E9b8699b62b0395C3F01BE0',
    decimals: 18,
    id: 'NOTEUSD',
    name: 'noteUSD',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x97fB6Fc2AD532033Af97043B563131C5204F8A35',
    decimals: 18,
    id: 'NPLC',
    name: 'Plus-Coin',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 6,
    id: 'NPT_TRX',
    issuerAddress: 'TQTShAfjdRztg8id1mrQPaNT6ccdK1HviG',
    name: 'NPT (Tron)',
    nativeAsset: 'TRX',
    type: 'TRON_TRC20'
  },
  {
    contractAddress: '0xA15C7Ebe1f07CaF6bFF097D8a589fb8AC49Ae5B3',
    decimals: 18,
    id: 'NPXS',
    name: 'Pundi X',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x20945cA1df56D237fD40036d47E866C7DcCD2114',
    decimals: 18,
    id: 'NSURE',
    name: 'Nsure Network Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 6,
    id: 'NTRN',
    name: 'Neutron',
    nativeAsset: 'NTRN',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '0x4fE83213D56308330EC302a8BD641f1d0113A4Cc',
    decimals: 18,
    id: 'NU',
    name: 'NuCypher',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 7,
    id: 'NXDB',
    issuerAddress: 'GBG4NNAO36LKRDOUE3J3TPZYXGF2J34CW4FRFE5SLL65ED54E7LFBMKK',
    name: 'Nicoswap coin (DigitalBits)',
    nativeAsset: 'XDB',
    type: 'XDB_ASSET'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'OAS',
    name: 'Oasys',
    nativeAsset: 'OAS',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'OAS_TEST',
    name: 'Oasys Test',
    nativeAsset: 'OAS_TEST',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '0x2F109021aFe75B949429fe30523Ee7C0D5B27207',
    decimals: 18,
    id: 'OCC',
    name: 'OCC',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x967da4048cD07aB37855c090aAF366e4ce1b9F48',
    decimals: 18,
    id: 'OCEAN',
    name: 'Ocean Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x4092678e4E78230F46A1534C0fbc8fA39780892B',
    decimals: 18,
    id: 'OCN',
    name: 'Odyssey',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x7240aC91f01233BaAf8b064248E80feaA5912BA3',
    decimals: 18,
    id: 'OCTO',
    name: 'Octo.fi',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x8207c1FfC5B6804F6024322CcF34F29c3541Ae26',
    decimals: 18,
    id: 'OGN',
    name: 'OriginToken',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x383518188C0C6d7730D91b2c03a03C837814a899',
    decimals: 9,
    id: 'OHM',
    name: 'Olympus',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x75231F58b43240C9718Dd58B4967c5114342a86c',
    decimals: 18,
    id: 'OKB',
    name: 'OKB',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x6595b8fD9C920C81500dCa94e53Cdc712513Fb1f',
    decimals: 18,
    id: 'OLY',
    name: 'Olyseum',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x3593D125a4f7849a1B059E64F4517A86Dd60c95d',
    decimals: 18,
    id: 'OM',
    name: 'MANTRA DAO',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x76e63a3E7Ba1e2E61D3DA86a87479f983dE89a7E',
    decimals: 18,
    id: 'OMEN_POLYGON',
    name: 'Augury Finance (Polygon)',
    nativeAsset: 'MATIC_POLYGON',
    type: 'ERC20'
  },
  {
    contractAddress: '0xd26114cd6EE289AccF82350c8d8487fedB8A0C07',
    decimals: 18,
    id: 'OMG',
    name: 'OmiseGO',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xaBc6790673a60b8A7f588450f59D2d256b1aeF7F',
    decimals: 18,
    id: 'OMN_BSC',
    name: 'OMNI Coin',
    nativeAsset: 'BNB_BSC',
    type: 'BEP20'
  },
  {
    contractAddress: '',
    decimals: 8,
    id: 'OMNI_TEST',
    name: 'Omni Test',
    nativeAsset: 'BTC_TEST',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '0x03fF0ff224f904be3118461335064bB48Df47938',
    decimals: 18,
    id: 'ONE_BSC',
    name: 'Harmony ONE (BSC)',
    nativeAsset: 'BNB_BSC',
    type: 'BEP20'
  },
  {
    contractAddress: '0xd341d1680Eeee3255b8C4c75bCCE7EB57f144dAe',
    decimals: 18,
    id: 'ONG',
    name: 'SoMee.Social',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xFd7B3A77848f1C2D67E05E54d78d174a0C850335',
    decimals: 18,
    id: 'ONT_BSC',
    name: 'Binance-Peg Ontology Token (BSC)',
    nativeAsset: 'BNB_BSC',
    type: 'BEP20'
  },
  {
    contractAddress: '0x9D86b1B2554ec410ecCFfBf111A6994910111340',
    decimals: 8,
    id: 'OPENC',
    name: 'OPEN Chain',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x888888888889C00c67689029D7856AAC1065eC11',
    decimals: 18,
    id: 'OPIUM',
    name: 'Opium Governance Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x80D55c03180349Fff4a229102F62328220A96444',
    decimals: 18,
    id: 'OPUL',
    name: 'OpulousToken',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xEE1CeA7665bA7aa97e982EdeaeCb26B59a04d035',
    decimals: 18,
    id: 'ORAO',
    name: 'ORAO Network',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xff56Cc6b1E6dEd347aA0B7676C85AB0B3D08B0FA',
    decimals: 18,
    id: 'ORBS',
    name: 'Orbs',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x662b67d00A13FAf93254714DD601F5Ed49Ef2F51',
    decimals: 18,
    id: 'ORC',
    name: 'Orbit Chain',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 6,
    id: 'ORCA_SOL',
    issuerAddress: 'orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE',
    name: 'Orca',
    nativeAsset: 'SOL',
    type: 'SOL_ASSET'
  },
  {
    contractAddress: '0x0258F474786DdFd37ABCE6df6BBb1Dd5dfC4434a',
    decimals: 8,
    id: 'ORN',
    name: 'Orion Protocol',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 6,
    id: 'OSMO',
    name: 'Osmosis',
    nativeAsset: 'OSMO',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '',
    decimals: 6,
    id: 'OSMO_TEST',
    name: 'Osmosis Test',
    nativeAsset: 'OSMO_TEST',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '0x2C4e8f2D746113d0696cE89B35F0d8bF88E0AEcA',
    decimals: 18,
    id: 'OST',
    name: 'OST',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x2401D75Bf6E88EF211e51BD3E15415860025fDb9',
    decimals: 8,
    id: 'OT',
    name: 'O Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x2A8e1E676Ec238d8A992307B495b45B3fEAa5e86',
    decimals: 18,
    id: 'OUSD',
    name: 'Origin Dollar',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x4575f41308EC1483f3d399aa9a2826d74Da13Deb',
    decimals: 18,
    id: 'OXT',
    name: 'Orchid',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x46c9757C5497c5B1f2eb73aE79b6B67D119B0B58',
    decimals: 18,
    id: 'PACT_CELO',
    name: 'impactMarket (CELO)',
    nativeAsset: 'CELO',
    type: 'ERC20'
  },
  {
    contractAddress: '0x1614F18Fc94f47967A3Fbe5FfcD46d4e7Da3D787',
    decimals: 18,
    id: 'PAID',
    name: 'PAID Network',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xea5f88E54d982Cbb0c441cde4E79bC305e5b43Bc',
    decimals: 18,
    id: 'PARETO',
    name: 'PARETO Rewards',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xeE4458e052B533b1aABD493B5f8c4d85D7B263Dc',
    decimals: 6,
    id: 'PASS',
    name: 'Blockpass',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x8E870D67F660D95d5be530380D0eC0bd388289E1',
    decimals: 18,
    id: 'PAX',
    name: 'PAX Dollar',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x45804880De22913dAFE09f4980848ECE6EcbAf78',
    decimals: 18,
    id: 'PAXG',
    name: 'Paxos Gold',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xB97048628DB6B661D4C2aA833e95Dbe1A905B280',
    decimals: 18,
    id: 'PAY',
    name: 'TenXPay',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x7e9928aFe96FefB820b85B4CE6597B8F660Fe4F4',
    decimals: 18,
    id: 'PBNB_POLYGON',
    name: 'Orbit Bridge Polygon Binance Coin (Polygon)',
    nativeAsset: 'MATIC_POLYGON',
    type: 'ERC20'
  },
  {
    contractAddress: '0xD528cf2E081f72908e086F8800977df826B5a483',
    decimals: 18,
    id: 'PBX_ETH',
    name: 'Paribus',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x334cBb5858417Aee161B53Ee0D5349cCF54514CF',
    decimals: 18,
    id: 'PCDAI',
    name: 'PoolTogether Dai Ticket (Compound)',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xD81b1A8B1AD00Baa2D6609E0BAE28A38713872f7',
    decimals: 6,
    id: 'PCUSDC',
    name: 'PoolTogether USDC Ticket (Compound)',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 0,
    id: 'PCUST',
    name: 'Philanthropic Credit',
    nativeAsset: 'BTC',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '0x56e13ba0b311eDFEA176505B4fB7F2696778913C',
    decimals: 0,
    id: 'PCUST_ERC20',
    name: 'Philanthropic Credit (ERC20)',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'PEAQ',
    name: 'Peaq',
    nativeAsset: 'PEAQ',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '',
    decimals: 2,
    id: 'PEERACCOUNTTRANSFER_CHF',
    name: 'CHF (Peer Transfer)',
    nativeAsset: 'PEERACCOUNTTRANSFER_CHF',
    type: 'FIAT'
  },
  {
    contractAddress: '',
    decimals: 2,
    id: 'PEERACCOUNTTRANSFER_EUR',
    name: 'EUR (Peer Transfer)',
    nativeAsset: 'PEERACCOUNTTRANSFER_EUR',
    type: 'FIAT'
  },
  {
    contractAddress: '',
    decimals: 2,
    id: 'PEERACCOUNTTRANSFER_SGD',
    name: 'SGD (Peer Transfer)',
    nativeAsset: 'PEERACCOUNTTRANSFER_SGD',
    type: 'FIAT'
  },
  {
    contractAddress: '',
    decimals: 2,
    id: 'PEERACCOUNTTRANSFER_USD',
    name: 'USD (Peer Transfer)',
    nativeAsset: 'PEERACCOUNTTRANSFER_USD',
    type: 'FIAT'
  },
  {
    contractAddress: '0x808507121B80c02388fAd14726482e061B8da827',
    decimals: 18,
    id: 'PENDLE',
    name: 'Pendle',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xbC396689893D065F41bc2C6EcbeE5e0085233447',
    decimals: 18,
    id: 'PERP',
    name: 'Perpetual',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x3F9BEC82c776c47405BcB38070d2395Fd18F89d3',
    decimals: 18,
    id: 'PHM',
    name: 'Phantom Protocol Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x4399AE7538c33cA24edD4C28C5dd7Ce9a80acF81',
    decimals: 18,
    id: 'PHM_BSC',
    name: 'Phantom Protocol Token (BSC)',
    nativeAsset: 'BNB_BSC',
    type: 'BEP20'
  },
  {
    contractAddress: '0xc2D31475a1fbce0725AD71665976F18502a37234',
    decimals: 0,
    id: 'PKC',
    name: 'PKC',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xe3818504c1B32bF1557b16C238B2E01Fd3149C17',
    decimals: 18,
    id: 'PLR',
    name: 'PILLAR',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xD8912C10681D8B21Fd3742244f44658dBA12264E',
    decimals: 18,
    id: 'PLU',
    name: 'Pluton',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x47DA5456bC2e1ce391b645Ce80F2E97192e4976a',
    decimals: 18,
    id: 'PLUG',
    name: 'Plug Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'PLUME',
    name: 'Plume',
    nativeAsset: 'PLUME',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '0x846C66cf71C43f80403B51fE3906B3599D63336f',
    decimals: 18,
    id: 'PMA',
    name: 'PumaPay',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x93ED3FBe21207Ec2E8f2d3c3de6e058Cb73Bc04d',
    decimals: 18,
    id: 'PNK',
    name: 'Pinakion',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x89Ab32156e46F46D02ade3FEcbe5Fc4243B9AAeD',
    decimals: 18,
    id: 'PNT',
    name: 'pNetwork Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x455e53CBB86018Ac2B8092FdCd39d8444aFFC3F6',
    decimals: 18,
    id: 'POL_ETH_9RYQ',
    name: 'Polygon Ecosystem Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 8,
    id: 'POLIS_SOL',
    issuerAddress: 'poLisWXnNRwC6oBu1vHiuKQzFjGL4XDSu4g9qjz9qVk',
    name: 'Star Atlas DAO',
    nativeAsset: 'SOL',
    type: 'SOL_ASSET'
  },
  {
    contractAddress: '0x83e6f1E41cdd28eAcEB20Cb649155049Fac3D5Aa',
    decimals: 18,
    id: 'POLS',
    name: 'PolkastarterToken',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x9992eC3cF6A55b00978cdDF2b27BC6882d88D1eC',
    decimals: 18,
    id: 'POLY',
    name: 'Polymath',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x57B946008913B82E4dF85f501cbAeD910e58D26C',
    decimals: 18,
    id: 'POND',
    name: 'Marlin POND',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x0cEC1A9154Ff802e7934Fc916Ed7Ca50bDE6844e',
    decimals: 18,
    id: 'POOL',
    name: 'PoolTogether',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x49f2145d6366099e13B10FbF80646C0F377eE7f6',
    decimals: 8,
    id: 'PORTO',
    name: 'FC Porto Fan Token',
    nativeAsset: 'BNB_BSC',
    type: 'BEP20'
  },
  {
    contractAddress: '0x595832F8FC6BF59c85C527fEC3740A1b7a361269',
    decimals: 6,
    id: 'POWR',
    name: 'Power Ledger',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x054D64b73d3D8A21Af3D764eFd76bCaA774f3Bb2',
    decimals: 18,
    id: 'PPAY',
    name: 'Plasma',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xd4fa1460F537bb9085d22C7bcCB5DD450Ef28e3a',
    decimals: 8,
    id: 'PPT',
    name: 'Populous',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xEC213F83defB583af3A000B1c0ada660b1902A0F',
    decimals: 18,
    id: 'PRE',
    name: 'Presearch',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x226bb599a12C826476e3A771454697EA52E9E220',
    decimals: 8,
    id: 'PRO',
    name: 'Propy',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xfc82bb4ba86045Af6F327323a46E80412b91b27d',
    decimals: 18,
    id: 'PROM',
    name: 'Token Prometeus Network',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x6fe56C0bcdD471359019FcBC48863d6c3e9d4F41',
    decimals: 18,
    id: 'PROPS',
    name: 'Props Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x8642A849D0dcb7a15a974794668ADcfbe4794B56',
    decimals: 18,
    id: 'PROS',
    name: 'Prosper',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 6,
    id: 'PRT_SOL',
    issuerAddress: 'PRT88RkA4Kg5z7pKnezeNH4mafTvtQdfFgpQTGRjz44',
    name: 'Parrot Protocol (Solana)',
    nativeAsset: 'SOL',
    type: 'SOL_ASSET'
  },
  {
    contractAddress: '0x2bf9671F00643afc813A6623074e0dDF6DB4Fc2B',
    decimals: 18,
    id: 'PSQ',
    name: 'PSQ',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xC57d533c50bC22247d49a368880fb49a1caA39F7',
    decimals: 18,
    id: 'PTF',
    name: 'PowerTrade Fuel Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x22d4002028f537599bE9f666d1c4Fa138522f9c8',
    decimals: 18,
    id: 'PTP_AVAX',
    name: 'Platypus',
    nativeAsset: 'AVAX',
    type: 'ERC20'
  },
  {
    contractAddress: '0xC229c69eB3BB51828D0cAA3509A05a51083898dd',
    decimals: 18,
    id: 'PTU',
    name: 'Pintu Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x0FD10b9899882a6f2fcb5c371E17e70FdEe00C38',
    decimals: 18,
    id: 'PUNDIX',
    name: 'Pundi X Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xf418588522d5dd018b425E472991E52EBBeEEEEE',
    decimals: 18,
    id: 'PUSH',
    name: 'Ethereum Push Notification Service',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x47e67BA66b0699500f18A53F94E2b9dB3D47437e',
    decimals: 18,
    id: 'PXG',
    name: 'PlayGame',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x95aA5d2DbD3c16ee3fdea82D5C6EC3E38CE3314f',
    decimals: 18,
    id: 'PXP',
    name: 'PointPay Crypto Banking Token V2',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x430EF9263E76DAE63c84292C3409D61c598E9682',
    decimals: 18,
    id: 'PYR',
    name: 'PYR Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 6,
    id: 'PYTH_SOL',
    issuerAddress: 'HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3',
    name: 'Pyth Network (Solana)',
    nativeAsset: 'SOL',
    type: 'SOL_ASSET'
  },
  {
    contractAddress: '0x6c3ea9036406852006290770BEdFcAbA0e23A0e8',
    decimals: 6,
    id: 'PYUSD_ETH',
    name: 'PayPal USD',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 6,
    id: 'PYUSD_SOL',
    issuerAddress: '2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo',
    name: 'PayPal USD (Solana)',
    nativeAsset: 'SOL',
    type: 'SOL_ASSET'
  },
  {
    contractAddress: '0x618E75Ac90b12c6049Ba3b27f5d5F8651b0037F6',
    decimals: 6,
    id: 'QASH',
    name: 'QASH',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x1602af2C782cC03F9241992E243290Fccf73Bb13',
    decimals: 18,
    id: 'QBIT',
    name: 'Qubitica',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x4A16BAf414b8e637Ed12019faD5Dd705735DB2e0',
    decimals: 2,
    id: 'QCAD',
    name: 'QCAD',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x9Adc7710E9d1b29d8a78c04d52D32532297C2Ef3',
    decimals: 18,
    id: 'QDT',
    name: 'QuadransToken',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x9e3a9F1612028eeE48F85cA85f8Bed2f37d76848',
    decimals: 18,
    id: 'QDX_BSC',
    name: 'Quidax Token (BSC)',
    nativeAsset: 'BNB_BSC',
    type: 'BEP20'
  },
  {
    contractAddress: '0x8729438EB15e2C8B576fCc6AeCdA6A148776C0F5',
    decimals: 18,
    id: 'QI_AVAX',
    name: 'BENQI (Avalanche)',
    nativeAsset: 'AVAX',
    type: 'ERC20'
  },
  {
    contractAddress: '0xEA26c4aC16D4a5A106820BC8AEE85fd0b7b2b664',
    decimals: 18,
    id: 'QKC',
    name: 'QuarkChain',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x4a220E6096B25EADb88358cb44068A3248254675',
    decimals: 18,
    id: 'QNT',
    name: 'Quant',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x99ea4dB9EE77ACD40B119BD1dC4E33e1C070b80d',
    decimals: 18,
    id: 'QSP',
    name: 'Quantstamp',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x35aF993EF3E89C076e41e463Fbd4CD00d3105cD1',
    decimals: 18,
    id: 'QUAKE',
    name: 'QuakeCoin',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x6c28AeF8977c9B773996d0e8376d2EE379446F2f',
    decimals: 18,
    id: 'QUICK',
    name: 'Quickswap (Old)',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x831753DD7087CaC61aB5644b308642cc1c33Dc13',
    decimals: 18,
    id: 'QUICK_POLYGON',
    name: 'Quickswap (Old Polygon)',
    nativeAsset: 'MATIC_POLYGON',
    type: 'ERC20'
  },
  {
    contractAddress: '0x31c8EAcBFFdD875c74b94b077895Bd78CF1E64A3',
    decimals: 18,
    id: 'RAD',
    name: 'Radicle',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x94804dc4948184fFd7355f62Ccbb221c9765886F',
    decimals: 18,
    id: 'RAGE',
    name: 'RageToken',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x33D0568941C0C64ff7e0FB4fbA0B11BD37deEd9f',
    decimals: 18,
    id: 'RAMP',
    name: 'RAMP DEFI',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x8519EA49c997f50cefFa444d240fB655e89248Aa',
    decimals: 18,
    id: 'RAMP_BSC',
    name: 'RAMP DEFI (BSC)',
    nativeAsset: 'BNB_BSC',
    type: 'BEP20'
  },
  {
    contractAddress: '0xba5BDe662c17e2aDFF1075610382B9B691296350',
    decimals: 18,
    id: 'RARE',
    name: 'SuperRare',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xFca59Cd816aB1eaD66534D82bc21E7515cE441CF',
    decimals: 18,
    id: 'RARI',
    name: 'Rarible',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x5245C0249e5EEB2A0838266800471Fd32Adb1089',
    decimals: 6,
    id: 'RAY',
    name: 'Raydium',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 6,
    id: 'RAY_SOL',
    issuerAddress: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
    name: 'Raydium (Solana)',
    nativeAsset: 'SOL',
    type: 'SOL_ASSET'
  },
  {
    contractAddress: '0xFc2C4D8f95002C14eD0a7aA65102Cac9e5953b5E',
    decimals: 18,
    id: 'RBLX',
    name: 'Rublix',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x6123B0049F904d730dB3C36a31167D9d4121fA6B',
    decimals: 18,
    id: 'RBN',
    name: 'Ribbon',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'RBTC',
    name: 'RSK Smart Bitcoin',
    nativeAsset: 'RBTC',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'RBTC_TEST',
    name: 'RSK Smart Bitcoin (Test)',
    nativeAsset: 'RBTC_TEST',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '0x431CD3C9AC9Fc73644BF68bF5691f4B83F9E104f',
    decimals: 18,
    id: 'RBW_POLYGON_UZYB',
    name: 'Rainbow Token',
    nativeAsset: 'MATIC_POLYGON',
    type: 'ERC20'
  },
  {
    contractAddress: '0xF970b8E36e23F7fC3FD752EeA86f8Be8D83375A6',
    decimals: 18,
    id: 'RCN',
    name: 'Ripio Credit Network',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x252739487C1fa66eaeaE7CED41d6358aB2a6bCa9',
    decimals: 8,
    id: 'RCOIN',
    name: 'ArCoin',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x2d919F19D4892381D58edeBeca66D5642Cef1a1f',
    decimals: 18,
    id: 'RDOC_RBTC',
    name: 'RIF Dollar on Chain (RSK)',
    nativeAsset: 'RBTC',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 9,
    id: 'REAL_SOL',
    issuerAddress: 'AD27ov5fVU2XzwsbvnFvb1JpCBaCB5dRXrczV9CqSVGb',
    name: 'Realy Token (Solana)',
    nativeAsset: 'SOL',
    type: 'SOL_ASSET'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'REDBELLY',
    name: 'Redbelly',
    nativeAsset: 'REDBELLY',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'REDBELLY_TEST',
    name: 'Redbelly Test',
    nativeAsset: 'REDBELLY_TEST',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '0xFE3E6a25e6b192A42a44ecDDCd13796471735ACf',
    decimals: 18,
    id: 'REEF',
    name: 'Reef.finance',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x408e41876cCCDC0F92210600ef50372656052a38',
    decimals: 18,
    id: 'REN',
    name: 'Republic',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D',
    decimals: 8,
    id: 'RENBTC',
    name: 'renBTC',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 8,
    id: 'RENDER_SOL',
    issuerAddress: 'rndrizKT3MK1iimdxRdWabcF7Zg7AR5T4nud4EkHBof',
    name: 'Render Token (Solana)',
    nativeAsset: 'SOL',
    type: 'SOL_ASSET'
  },
  {
    contractAddress: '0x1985365e9f78359a9B6AD760e32412f4a445E862',
    decimals: 18,
    id: 'REP',
    name: 'Augur',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x221657776846890989a759BA2973e427DfF5C9bB',
    decimals: 18,
    id: 'REPV2',
    name: 'Reputation',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x8f8221aFbB33998d8584A2B05749bA73c37a938a',
    decimals: 18,
    id: 'REQ',
    name: 'Request',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x557B933a7C2c45672B610F8954A3deB39a51A8Ca',
    decimals: 18,
    id: 'REVV',
    name: 'REVV',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xa1d6Df714F91DeBF4e0802A542E13067f31b8262',
    decimals: 18,
    id: 'RFOX',
    name: 'RFOX',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xd0929d411954c47438dc1d871dd6081F5C5e149c',
    decimals: 4,
    id: 'RFR',
    name: 'Refereum',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xD291E7a03283640FDc51b121aC401383A46cC623',
    decimals: 18,
    id: 'RGT',
    name: 'Rari Governance Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x168296bb09e24A88805CB9c33356536B980D3fC5',
    decimals: 8,
    id: 'RHOC',
    name: 'RChain',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x2AcC95758f8b5F583470ba265EB685a8F45fC9D5',
    decimals: 18,
    id: 'RIF_RBTC',
    name: 'RIF (RSK)',
    nativeAsset: 'RBTC',
    type: 'ERC20'
  },
  {
    contractAddress: '0xf4d27c56595Ed59B66cC7F03CFF5193e4bd74a61',
    decimals: 18,
    id: 'RIFP_RBTC',
    name: 'RIF Pro (RSK)',
    nativeAsset: 'RBTC',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 9,
    id: 'RIN_SOL',
    issuerAddress: 'E5ndSkaB17Dm7CsD22dvcjfrYSDLCxFcMd6z8ddCk5wp',
    name: 'Aldrin (Solana)',
    nativeAsset: 'SOL',
    type: 'SOL_ASSET'
  },
  {
    contractAddress: '0x9469D013805bFfB7D3DEBe5E7839237e535ec483',
    decimals: 18,
    id: 'RING',
    name: 'Darwinia Network Native Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x607F4C5BB672230e8672085532f7e901544a7375',
    decimals: 9,
    id: 'RLC',
    name: 'iExec RLC',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xf1f955016EcbCd7321c7266BccFB96c68ea5E49b',
    decimals: 18,
    id: 'RLY',
    name: 'Rally',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x8D5682941cE456900b12d47ac06a88b47C764CE1',
    decimals: 18,
    id: 'RMESH',
    name: 'RightMesh',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x6De037ef9aD2725EB40118Bb1702EBb27e4Aeb24',
    decimals: 18,
    id: 'RNDR',
    name: 'Render Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'RON',
    name: 'Ronin',
    nativeAsset: 'RON',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '0xfA5047c9c78B8877af97BDcb85Db743fD7313d4a',
    decimals: 18,
    id: 'ROOK',
    name: 'ROOK',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x7eaF9C89037e4814DC0d9952Ac7F888C784548DB',
    decimals: 18,
    id: 'ROYA',
    name: 'Royale',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xB4EFd85c19999D84251304bDA99E90B92300Bd93',
    decimals: 18,
    id: 'RPL',
    name: 'Rocket Pool (Old)',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xD33526068D116cE69F19A9ee46F0bd304F21A51f',
    decimals: 18,
    id: 'RPL2',
    name: 'Rocket Pool (New)',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x490c95bE16384E1f28B9e864e98fFEcFCBfF386d',
    decimals: 18,
    id: 'RPM',
    name: 'Repme',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x320623b8E4fF03373931769A31Fc52A4E78B5d70',
    decimals: 18,
    id: 'RSR',
    name: 'Reserve Rights (new contract)',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x8762db106B2c2A0bccB3A80d1Ed41273552616E8',
    decimals: 18,
    id: 'RSR_OLD',
    name: 'Reserve Rights (old)',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x196f4727526eA7FB1e17b2071B3d8eAA38486988',
    decimals: 18,
    id: 'RSV',
    name: 'Reserve',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 9,
    id: 'RUN_SOL',
    issuerAddress: '6F9XriABHfWhit6zmMUYAQBSy6XK5VF1cHXuW5LDpRtC',
    name: 'Run Token (Solana)',
    nativeAsset: 'SOL',
    type: 'SOL_ASSET'
  },
  {
    contractAddress: '0x3155BA85D5F96b2d030a4966AF206230e46849cb',
    decimals: 18,
    id: 'RUNE',
    name: 'THORChain ETH.RUNE',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xA9776B590bfc2f956711b3419910A5Ec1F63153E',
    decimals: 18,
    id: 'RUNE_BSC',
    name: 'Rune (BSC)',
    nativeAsset: 'BNB_BSC',
    type: 'BEP20'
  },
  {
    contractAddress: '',
    decimals: 8,
    id: 'RUNE_THOR',
    name: 'THORChain Rune',
    nativeAsset: 'RUNE_THOR',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '',
    decimals: 8,
    id: 'RUNE_THOR_TEST',
    name: 'THORChain Rune Test',
    nativeAsset: 'RUNE_THOR_TEST',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '0x8076C74C5e3F5852037F31Ff0093Eeb8c8ADd8D3',
    decimals: 9,
    id: 'SAFEMOON_BSC',
    name: 'SafeMoon (BSC)',
    nativeAsset: 'BNB_BSC',
    type: 'BEP20'
  },
  {
    contractAddress: '0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359',
    decimals: 18,
    id: 'SAI',
    name: 'Sai',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x4156D3342D5c385a87D264F90653733592000581',
    decimals: 8,
    id: 'SALT',
    name: 'SALT',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 9,
    id: 'SAMO_SOL',
    issuerAddress: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    name: 'Samoyed Coin (Solana)',
    nativeAsset: 'SOL',
    type: 'SOL_ASSET'
  },
  {
    contractAddress: '0x3845badAde8e6dFF049820680d1F14bD3903a5d0',
    decimals: 18,
    id: 'SAND',
    name: 'SAND',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x7697B462A7c4Ff5F8b55BDBC2F4076c2aF9cF51A',
    decimals: 18,
    id: 'SARCO',
    name: 'Sarcophagus',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xDf49C9f599A0A9049D97CFF34D0C30E468987389',
    decimals: 18,
    id: 'SATT',
    name: 'Smart Advertising Transaction Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 6,
    id: 'SB_SOL',
    issuerAddress: 'SuperbZyz7TsSdSoFAZ6RYHfAWe9NmjXBLVQpS8hqdx',
    name: 'SuperBonds Token (Solana)',
    nativeAsset: 'SOL',
    type: 'SOL_ASSET'
  },
  {
    contractAddress: '',
    decimals: 6,
    id: 'SBR_SOL',
    issuerAddress: 'Saber2gLauYim4Mvftnrasomsv6NvAuncvMEZwcLpD1',
    name: 'Saber Protocol Token (Solana)',
    nativeAsset: 'SOL',
    type: 'SOL_ASSET'
  },
  {
    contractAddress: '0x74FD51a98a4A1ECBeF8Cc43be801cce630E260Bd',
    decimals: 18,
    id: 'SCC',
    name: 'SiaCashCoin',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'SCROLL',
    name: 'Scroll Ethereum',
    nativeAsset: 'SCROLL',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'SCROLL_SEPOLIA_TEST',
    name: 'Scroll Sepolia Test',
    nativeAsset: 'SCROLL_SEPOLIA_TEST',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '',
    decimals: 9,
    id: 'SCT_SOL',
    issuerAddress: '4Te4KJgjtnZe4aE2zne8G4NPfrPjCwDmaiEx9rKnyDVZ',
    name: 'SolClout (Solana)',
    nativeAsset: 'SOL',
    type: 'SOL_ASSET'
  },
  {
    contractAddress: '',
    decimals: 9,
    id: 'SCY_SOL',
    issuerAddress: 'SCYfrGCw8aDiqdgcpdGjV6jp4UVVQLuphxTDLNWu36f',
    name: 'Synchrony (Solana)',
    nativeAsset: 'SOL',
    type: 'SOL_ASSET'
  },
  {
    contractAddress: '0x993864E43Caa7F7F12953AD6fEb1d1Ca635B875F',
    decimals: 18,
    id: 'SDAO',
    name: 'Singularity Dao',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'SEI',
    name: 'Sei',
    nativeAsset: 'SEI',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'SEI_TEST',
    name: 'Sei',
    nativeAsset: 'SEI_TEST',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '',
    decimals: 2,
    id: 'SEN_TEST_USD',
    name: 'Silvergate SEN Test',
    nativeAsset: 'SEN_TEST_USD',
    type: 'FIAT'
  },
  {
    contractAddress: '',
    decimals: 2,
    id: 'SEN_USD',
    name: 'Silvergate SEN',
    nativeAsset: 'SEN_USD',
    type: 'FIAT'
  },
  {
    contractAddress: '0x6745fAB6801e376cD24F03572B9C9B0D4EdDDCcf',
    decimals: 8,
    id: 'SENSE',
    name: 'Sense',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xD71eCFF9342A5Ced620049e616c5035F1dB98620',
    decimals: 18,
    id: 'SEUR',
    name: 'Synth sEUR',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xb753428af26E81097e7fD17f40c88aaA3E04902c',
    decimals: 18,
    id: 'SFI',
    name: 'Spice',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xed0849BF46CfB9845a2d900A0A4E593F2dD3673c',
    decimals: 18,
    id: 'SGA',
    name: 'Saga',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'SGB',
    name: 'Songbird',
    nativeAsset: 'SGB',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'SGB_LEGACY',
    name: 'Songbird (Legacy derivation)',
    nativeAsset: 'SGB_LEGACY',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '0xB2135AB9695a7678Dd590B1A996CB0f37BCB0718',
    decimals: 9,
    id: 'SGN',
    name: 'Signals Network',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xAEa8e1b6CB5c05D1dAc618551C76bcD578EA3524',
    decimals: 18,
    id: 'SGR',
    name: 'Sogur',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x232FB065D9d24c34708eeDbF03724f2e95ABE768',
    decimals: 18,
    id: 'SHEESHA_BSC',
    name: 'Sheesha Finance',
    nativeAsset: 'BNB_BSC',
    type: 'BEP20'
  },
  {
    contractAddress: '0xcba3eAe7f55D0F423AF43cC85E67ab0fBF87B61C',
    decimals: 18,
    id: 'SHFT',
    name: 'Shyft [ Byfrost ]',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xb17C88bDA07D28B3838E0c1dE6a30eAfBCF52D85',
    decimals: 18,
    id: 'SHFT_WRAPPED',
    name: 'Shyft _ Wrapped _',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE',
    decimals: 18,
    id: 'SHIB',
    name: 'SHIBA INU',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x2859e4544C4bB03966803b044A93563Bd2D0DD4D',
    decimals: 18,
    id: 'SHIB_BSC',
    name: 'SHIBA INU (BSC)',
    nativeAsset: 'BNB_BSC',
    type: 'BEP20'
  },
  {
    contractAddress: '',
    decimals: 8,
    id: 'SHIB_SOL',
    issuerAddress: 'CiKu4eHsVrc1eueVQeHn7qhXTcVu95gSQmBpX4utjL9z',
    name: 'SHIBA INU (Solana)',
    nativeAsset: 'SOL',
    type: 'SOL_ASSET'
  },
  {
    contractAddress: '',
    decimals: 6,
    id: 'SHILL_SOL',
    issuerAddress: '6cVgJUqo4nmvQpbgrDZwyfd6RwWw5bfnCamS3M9N1fd',
    name: 'Project SEED Token (Solana)',
    nativeAsset: 'SOL',
    type: 'SOL_ASSET'
  },
  {
    contractAddress: '0xe25b0BBA01Dc5630312B6A21927E578061A13f55',
    decimals: 18,
    id: 'SHIP',
    name: 'ShipChain',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x7BEF710a5759d197EC0Bf621c3Df802C2D60D848',
    decimals: 18,
    id: 'SHOPX',
    name: 'SPLYT SHOPX',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x7C84e62859D0715eb77d1b1C4154Ecd6aBB21BEC',
    decimals: 18,
    id: 'SHPING',
    name: 'Shping Coin',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xd98F75b1A3261dab9eEd4956c93F33749027a964',
    decimals: 2,
    id: 'SHR',
    name: 'ShareToken',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 7,
    id: 'SHX_XLM',
    issuerAddress: 'GDSTRSHXHGJ7ZIVRBXEYE5Q74XUVCUSEKEBR7UCHEUUEK72N7I7KJ6JH',
    name: 'Stronghold SHx (Stellar)',
    nativeAsset: 'XLM',
    type: 'XLM_ASSET'
  },
  {
    contractAddress: '0x549020a9Cb845220D66d3E9c6D9F9eF61C981102',
    decimals: 18,
    id: 'SIDUS',
    name: 'SIDUS',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 2,
    id: 'SIGNET_TEST_USD',
    name: 'Signet Test',
    nativeAsset: 'SIGNET_TEST_USD',
    type: 'FIAT'
  },
  {
    contractAddress: '',
    decimals: 2,
    id: 'SIGNET_USD',
    name: 'Signet',
    nativeAsset: 'SIGNET_USD',
    type: 'FIAT'
  },
  {
    contractAddress: '0x6D728fF862Bfe74be2aba30537E992A24F259a22',
    decimals: 18,
    id: 'SIH',
    name: 'Salient Investment Holding',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xd38BB40815d2B0c2d2c866e0c72c5728ffC76dd9',
    decimals: 18,
    id: 'SIS',
    name: 'Symbiosis',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x00c83aeCC790e8a4453e5dD3B0B4b3680501a7A7',
    decimals: 18,
    id: 'SKL',
    name: 'SKALE',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 6,
    id: 'SLC_SOL',
    issuerAddress: 'METAmTMXwdb8gYzyCPfXXFmZZw4rUsXX58PNsDg7zjL',
    name: 'Solice',
    nativeAsset: 'SOL',
    type: 'SOL_ASSET'
  },
  {
    contractAddress: '',
    decimals: 6,
    id: 'SLIM_SOL',
    issuerAddress: 'xxxxa1sKNGwFtw2kFn8XauW9xq8hBZ5kVtcSesTT9fW',
    name: 'Solanium (Solana)',
    nativeAsset: 'SOL',
    type: 'SOL_ASSET'
  },
  {
    contractAddress: '',
    decimals: 6,
    id: 'SLND_SOL',
    issuerAddress: 'SLNDpmoWTVADgEdndyvWzroNL7zSi1dF9PC3xHGtPwp',
    name: 'Solend (Solana)',
    nativeAsset: 'SOL',
    type: 'SOL_ASSET'
  },
  {
    contractAddress: '0xd4e7a6e2D03e4e48DfC27dd3f46DF1c176647E38',
    decimals: 18,
    id: 'SLP_D4E7A_ETH',
    name: 'SushiSwap LP Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xa8754b9Fa15fc18BB59458815510E40a12cD2014',
    decimals: 0,
    id: 'SLP_RON',
    name: 'Smooth Love Potion (Ronin)',
    nativeAsset: 'RON',
    type: 'ERC20'
  },
  {
    contractAddress: '0xCC8Fa225D80b9c7D42F96e9570156c65D6cAAa25',
    decimals: 0,
    id: 'SLP1',
    name: 'Smooth Love Potion',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x397FF1542f962076d0BFE58eA045FfA2d347ACa0',
    decimals: 18,
    id: 'SLPUSDCETH',
    name: 'SushiSwap USDC/ETH LP',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 6,
    id: 'SLRS_SOL',
    issuerAddress: 'SLRSSpSLUTP7okbCUBYStWCo1vUgyt775faPqz8HUMr',
    name: 'Solrise Finance (Solana)',
    nativeAsset: 'SOL',
    type: 'SOL_ASSET'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'SMARTBCH',
    name: 'SmartBCH',
    nativeAsset: 'SMARTBCH',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'SMR_SMR',
    name: 'Shimmer',
    nativeAsset: 'SMR_SMR',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'SMR_TEST',
    name: 'Shimmer Test',
    nativeAsset: 'SMR_TEST',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '0xF4134146AF2d511Dd5EA8cDB1C4AC88C57D60404',
    decimals: 18,
    id: 'SNC',
    name: 'SunContract',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xaeC2E87E0A235266D9C5ADc9DEb4b2E29b54D009',
    decimals: 0,
    id: 'SNGLS',
    name: 'SingularDTV',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x983F6d60db79ea8cA4eB9968C6aFf8cfA04B3c63',
    decimals: 18,
    id: 'SNM',
    name: 'SONM',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x744d70FDBE2Ba4CF95131626614a1763DF805B9E',
    decimals: 18,
    id: 'SNT',
    name: 'Status',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F',
    decimals: 18,
    id: 'SNX',
    name: 'Synthetix Network Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x23B608675a2B2fB1890d3ABBd85c5775c51691d5',
    decimals: 18,
    id: 'SOCKS',
    name: 'Unisocks Edition 0',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 6,
    id: 'SOETH_SOL',
    issuerAddress: '2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk',
    name: 'Wrapped Ethereum (Solana)',
    nativeAsset: 'SOL',
    type: 'SOL_ASSET'
  },
  {
    contractAddress: '0x04F2694C8fcee23e8Fd0dfEA1d4f5Bb8c352111F',
    decimals: 9,
    id: 'SOHM',
    name: 'Staked Olympus',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 9,
    id: 'SOL',
    name: 'Solana',
    nativeAsset: 'SOL',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '0x41848d32f281383F214C69B7b248DC7C2E0a7374',
    decimals: 18,
    id: 'SOL_BSC',
    name: 'Solana (BSC)',
    nativeAsset: 'BNB_BSC',
    type: 'BEP20'
  },
  {
    contractAddress: '',
    decimals: 6,
    id: 'SOL_MAPS_FD7T',
    issuerAddress: 'MAPS41MDahZ9QdKXhVa4dWB9RuyfV4XqhyAZ8XcYepb',
    name: 'MAPS (Solana)',
    nativeAsset: 'SOL',
    type: 'SOL_ASSET'
  },
  {
    contractAddress: '',
    decimals: 6,
    id: 'SOL_OXY_4TTN',
    issuerAddress: 'z3dn17yLaGMKffVogeFHQ9zWVcXgqgf3PQnDsNs2g6M',
    name: 'Oxygen (Solana)',
    nativeAsset: 'SOL',
    type: 'SOL_ASSET'
  },
  {
    contractAddress: '',
    decimals: 6,
    id: 'SOL_SRM_R62M',
    issuerAddress: 'SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt',
    name: 'Serum (Solana)',
    nativeAsset: 'SOL',
    type: 'SOL_ASSET'
  },
  {
    contractAddress: '',
    decimals: 9,
    id: 'SOL_TEST',
    name: 'Solana Test',
    nativeAsset: 'SOL_TEST',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '',
    decimals: 9,
    id: 'SOL_TTOKEN_CHGU',
    issuerAddress: 'FYEEA9iZJpad1ZCkigi9BvkCNcW4QNun23hEPrAfELDA',
    name: 'Solana Test Token',
    nativeAsset: 'SOL_TEST',
    type: 'SOL_ASSET'
  },
  {
    contractAddress: '',
    decimals: 6,
    id: 'SOL_USDC_PTHX',
    issuerAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    name: 'USD Coin (Solana)',
    nativeAsset: 'SOL',
    type: 'SOL_ASSET'
  },
  {
    contractAddress: '',
    decimals: 6,
    id: 'SOL_USDT_EWAY',
    issuerAddress: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    name: 'USDT (Solana)',
    nativeAsset: 'SOL',
    type: 'SOL_ASSET'
  },
  {
    contractAddress: '0x570A5D26f7765Ecb712C0924E4De545B89fD43dF',
    decimals: 18,
    id: 'SOL2_BSC',
    name: 'SOLANA BSC (2)',
    nativeAsset: 'BNB_BSC',
    type: 'BEP20'
  },
  {
    contractAddress: '0x446C9033E7516D820cc9a2ce2d0B7328b579406F',
    decimals: 8,
    id: 'SOLVE',
    name: 'Solve.Care',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 9,
    id: 'SOLX_SOL',
    issuerAddress: 'CH74tuRLTYcxG7qNJCsV9rghfLXJCQJbsu7i52a8F1Gn',
    name: 'Soldex (Solana)',
    nativeAsset: 'SOL',
    type: 'SOL_ASSET'
  },
  {
    contractAddress: '0x3E8FFc8c3Cb0DB3081Df85DeC91B63abBbe99F71',
    decimals: 18,
    id: 'SOME',
    name: 'Mixsome',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 9,
    id: 'SONAR_SOL',
    issuerAddress: 'sonarX4VtVkQemriJeLm6CKeW3GDMyiBnnAEMw1MRAE',
    name: 'Sonar Watch (Solana)',
    nativeAsset: 'SOL',
    type: 'SOL_ASSET'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'SONEIUM_MINATO_TEST',
    name: 'Soneium Minato Test',
    nativeAsset: 'SONEIUM_MINATO_TEST',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '0xEFc78fc7d48b64958315949279Ba181c2114ABBd',
    decimals: 18,
    id: 'SOV_RBTC',
    name: 'Sovryn Token (RSK)',
    nativeAsset: 'RBTC',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 2,
    id: 'SPEI_MXN',
    name: 'MXN (SPEI)',
    nativeAsset: 'SPEI_MXN',
    type: 'FIAT'
  },
  {
    contractAddress: '0x090185f2135308BaD17527004364eBcC2D37e5F6',
    decimals: 18,
    id: 'SPELL',
    name: 'Spell Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xE11829A7D5d8806BB36E118461a1012588faFD89',
    decimals: 18,
    id: 'SPICE_SMARTBCH',
    name: 'SPICE (SmartBCH)',
    nativeAsset: 'SMARTBCH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x1633b7157e7638C4d6593436111Bf125Ee74703F',
    decimals: 18,
    id: 'SPS_BSC',
    name: 'Splintershards (BSC)',
    nativeAsset: 'BNB_BSC',
    type: 'BEP20'
  },
  {
    contractAddress: '0xe516D78d784C77D479977BE58905B3f2b1111126',
    decimals: 18,
    id: 'SPWN',
    name: 'BitSpawn Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 9,
    id: 'SPWN_SOL',
    issuerAddress: '5U9QqCPhqXAJcEv9uyzFJd5zhN93vuPk1aNNkXnUfPnt',
    name: 'Bitspawn Token (Solana)',
    nativeAsset: 'SOL',
    type: 'SOL_ASSET'
  },
  {
    contractAddress: '0x476c5E26a75bd202a9683ffD34359C0CC15be0fF',
    decimals: 6,
    id: 'SRM',
    name: 'Serum',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x68d57c9a1C35f63E2c83eE8e49A64e9d70528D25',
    decimals: 18,
    id: 'SRN',
    name: 'SIRIN LABS Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x624d520BAB2E4aD83935Fa503fB130614374E850',
    decimals: 4,
    id: 'SSP',
    name: 'smartshare token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x0Ae055097C6d159879521C384F1D2123D1f195e6',
    decimals: 18,
    id: 'STAKE',
    name: 'STAKE',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x78474F29aF6D4EB0cfB3168eff1c117cf13569e8',
    decimals: 8,
    id: 'STDASH',
    name: 'stakedDASH',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xD79311EB6c74C408e678b8364B69B4744A5778f4',
    decimals: 10,
    id: 'STDOT',
    name: 'stakedDOT',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 9,
    id: 'STEP_SOL',
    issuerAddress: 'StepAscQoEioFxxWGnh2sLBDFp9d8rvKz2Yp39iDpyT',
    name: 'Step (Solana)',
    nativeAsset: 'SOL',
    type: 'SOL_ASSET'
  },
  {
    contractAddress: '0xDFe66B14D37C77F4E9b180cEb433d1b164f0281D',
    decimals: 18,
    id: 'STETH',
    name: 'stakedETH',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
    decimals: 18,
    id: 'STETH_ETH',
    name: 'Liquid staked Ether 2_0',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x3F1c547b21f65e10480dE3ad8E19fAAC46C95034',
    decimals: 18,
    id: 'STETH_ETH_TEST6_DZFA',
    name: 'Liquid staked Ether 2_0',
    nativeAsset: 'ETH_TEST6',
    type: 'ERC20'
  },
  {
    contractAddress: '0x160B1E5aaBFD70B2FC40Af815014925D71CEEd7E',
    decimals: 8,
    id: 'STFIRO',
    name: 'stakedFiro',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xAf5191B0De278C7286d6C7CC6ab6BB8A73bA2Cd6',
    decimals: 18,
    id: 'STG',
    name: 'StargateToken',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xD309142A629d07B023E5007feeF608d161B01156',
    decimals: 18,
    id: 'STGFBTC',
    name: 'stgfBTC',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xe2ff59F37C3F07100bdEb5F79B98131F18D9D28B',
    decimals: 18,
    id: 'STGFETH',
    name: 'stgfETH',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x8B6327a3050798b7A2843A6Edd0B310E97BEE113',
    decimals: 18,
    id: 'STGFUSD',
    name: 'stgfUSD',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x7A4B43dE058073F49774eA527Fc24Abd29e2738D',
    decimals: 18,
    id: 'STGFUSD_SMARTBCH',
    name: 'stgfUSD (SmartBCH)',
    nativeAsset: 'SMARTBCH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x4da27a545c0c5B758a6BA100e3a049001de870f5',
    decimals: 18,
    id: 'STKAAVE',
    name: 'Staked Aave',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x19FfA8fc52dF8982cEa39B492E56AbB2f8Abc644',
    decimals: 18,
    id: 'STMATIC',
    name: 'stakedMATIC',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xbE9375C6a420D2eEB258962efB95551A5b722803',
    decimals: 18,
    id: 'STMX',
    name: 'StormX',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xB64ef51C888972c908CFacf59B47C1AfBC0Ab8aC',
    decimals: 8,
    id: 'STORJ',
    name: 'Storj',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xD0a4b8946Cb52f0661273bfbC6fD0E0C75Fc6433',
    decimals: 18,
    id: 'STORM',
    name: 'Storm',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xDe7D85157d9714EADf595045CC12Ca4A5f3E2aDb',
    decimals: 18,
    id: 'STPT',
    name: 'STPT',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 9,
    id: 'STR_SOL',
    issuerAddress: '9zoqdwEBKWEi9G5Ze8BSkdmppxGgVv1Kw4LuigDiNr9m',
    name: 'Solster',
    nativeAsset: 'SOL',
    type: 'SOL_ASSET'
  },
  {
    contractAddress: '0x990f341946A3fdB507aE7e52d17851B87168017c',
    decimals: 18,
    id: 'STRONG',
    name: 'Strong',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 9,
    id: 'STSOL_SOL',
    issuerAddress: '7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj',
    name: 'Lido Staked SOL (Solana)',
    nativeAsset: 'SOL',
    type: 'SOL_ASSET'
  },
  {
    contractAddress: '0x0371A82e4A9d0A4312f3ee2Ac9c6958512891372',
    decimals: 18,
    id: 'STU',
    name: 'bitJob',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x006BeA43Baa3f7A6f765F14f10A1a1b08334EF45',
    decimals: 18,
    id: 'STX',
    name: 'Stox',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x0C63cAE5fcC2Ca3dDE60a35e50362220651eBEc8',
    decimals: 8,
    id: 'STXEM',
    name: 'stakedXEM',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x31B595e7cfDB624D10A3E7A562eD98c3567e3865',
    decimals: 8,
    id: 'STZEN',
    name: 'stakedZEN',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x8D75959f1E61EC2571aa72798237101F084DE63a',
    decimals: 18,
    id: 'SUB',
    name: 'Substratum',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x0763fdCCF1aE541A5961815C0872A8c5Bc6DE4d7',
    decimals: 18,
    id: 'SUKU',
    name: 'SUKU Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 6,
    id: 'SUNNY_SOL',
    issuerAddress: 'SUNNYWgPQmFxe9wTZzNK7iPnJ3vYDrkgnxJRJm1s3ag',
    name: 'Sunny Governance Token (Solana)',
    nativeAsset: 'SOL',
    type: 'SOL_ASSET'
  },
  {
    contractAddress: '0xe53EC727dbDEB9E2d5456c3be40cFF031AB40A55',
    decimals: 18,
    id: 'SUPER',
    name: 'SuperVerse',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x57Ab1ec28D129707052df4dF418D58a2D46d5f51',
    decimals: 18,
    id: 'SUSD',
    name: 'Synth sUSD',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x6B3595068778DD592e39A122f4f5a5cF09C90fE2',
    decimals: 18,
    id: 'SUSHI',
    name: 'Sushi Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x0b3F868E0BE5597D5DB7fEB59E1CADBb0fdDa50a',
    decimals: 18,
    id: 'SUSHI_POLYGON',
    name: 'SushiSwap (Polygon)',
    nativeAsset: 'MATIC_POLYGON',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 8,
    id: 'SUSHI_SOL',
    issuerAddress: 'ChVzxWRmrTeSgwd3Ui3UumcN8KX7VK3WaD4KGeSKpypj',
    name: 'SushiToken (Solana)',
    nativeAsset: 'SOL',
    type: 'SOL_ASSET'
  },
  {
    contractAddress: '',
    decimals: 6,
    id: 'SVT_SOL',
    issuerAddress: 'svtMpL5eQzdmB3uqK9NXaQkq8prGZoKQFNVJghdWCkV',
    name: 'Solvent',
    nativeAsset: 'SOL',
    type: 'SOL_ASSET'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'SWEAT_NEAR',
    issuerAddress: 'token.sweat',
    name: 'SWEAT',
    nativeAsset: 'NEAR',
    type: 'NEAR_ASSET'
  },
  {
    contractAddress: '0x48C3399719B582dD63eB5AADf12A40B4C3f52FA2',
    decimals: 18,
    id: 'SWISE',
    name: 'StakeWise',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xB8BAa0e4287890a5F79863aB62b7F175ceCbD433',
    decimals: 18,
    id: 'SWRV',
    name: 'Swerve DAO Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x8CE9137d39326AD0cD6491fb5CC0CbA0e089b6A9',
    decimals: 18,
    id: 'SXP',
    name: 'Swipe',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xf293d23BF2CDc05411Ca0edDD588eb1977e8dcd4',
    decimals: 18,
    id: 'SYLO',
    name: 'Sylo',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x0f2D719407FdBeFF09D87557AbB7232601FD9F29',
    decimals: 18,
    id: 'SYN',
    name: 'Synapse',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 9,
    id: 'SYP_SOL',
    issuerAddress: 'FnKE9n6aGjQoNWRBZXy4RW6LZVao7qwBonUbiD7edUmZ',
    name: 'Sypool (Solana)',
    nativeAsset: 'SOL',
    type: 'SOL_ASSET'
  },
  {
    contractAddress: '',
    decimals: 6,
    id: 't14_XRP_TEST_YB4D',
    issuerAddress: 'rDFUVuBZmdACfEm44ieCu73CE75pdi4fXa',
    name: 't14',
    nativeAsset: 'XRP_TEST',
    type: 'XRP_ASSET'
  },
  {
    contractAddress: '',
    decimals: 7,
    id: 'TAB1_XLM_OXFD_YK4G',
    issuerAddress: 'GCWAT6HJIHKNCA6UELZCIRLXP44RDVVPN2NOFNVLFOEOXG7GMK7AOSH3',
    name: 'TAB1 (Stellar Test)',
    nativeAsset: 'XLM_TEST',
    type: 'XLM_ASSET'
  },
  {
    contractAddress: '0xc27A2F05fa577a83BA0fDb4c38443c0718356501',
    decimals: 18,
    id: 'TAU',
    name: 'Lamden Tau',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xdFa3b0019EcF48c753B58908B5A21d11641bA56f',
    decimals: 18,
    id: 'TAU_BSC',
    name: 'Lamden',
    nativeAsset: 'BNB_BSC',
    type: 'BEP20'
  },
  {
    contractAddress: '0x00006100F7090010005F1bd7aE6122c3C2CF0090',
    decimals: 18,
    id: 'TAUD',
    name: 'TrueAUD',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x8dAEBADE922dF735c38C80C7eBD708Af50815fAa',
    decimals: 18,
    id: 'TBTC',
    name: 'tBTC',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x00000100F2A2bd000715001920eB70D229700085',
    decimals: 18,
    id: 'TCAD',
    name: 'TrueCAD',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xA72159FC390f0E3C6D415e658264c7c4051E9b87',
    decimals: 18,
    id: 'TCR_ARB',
    name: 'Tracer',
    nativeAsset: 'ETH-AETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x467Bccd9d29f223BcE8043b84E8C8B282827790F',
    decimals: 2,
    id: 'TEL',
    name: 'Telcoin',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'TELOS',
    name: 'TELOS',
    nativeAsset: 'TELOS',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'TELOS_TEST',
    name: 'Telos Test',
    nativeAsset: 'TELOS_TEST',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '0xDD16eC0F66E54d453e6756713E533355989040E4',
    decimals: 18,
    id: 'TEN',
    name: 'Tokenomy',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x00000000441378008EA67F4284A57932B1c000a5',
    decimals: 18,
    id: 'TGBP',
    name: 'TrueGBP',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x0000852600CEB001E08e00bC008be620d60031F2',
    decimals: 18,
    id: 'THKD',
    name: 'TrueHKD',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x1Cb3209D45B2a60B7fBCA1cCDBF87f674237A4aa',
    decimals: 4,
    id: 'THR',
    name: 'ThoreCoin',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x29CbD0510EEc0327992CD6006e63F9Fa8E7f33B7',
    decimals: 18,
    id: 'TIDAL',
    name: 'Tidal Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xb54f16fB19478766A268F172C9480f8da1a7c9C3',
    decimals: 9,
    id: 'TIME_AVAX',
    name: 'Time (Avalanche)',
    nativeAsset: 'AVAX',
    type: 'ERC20'
  },
  {
    contractAddress: '0x3A8cCCB969a61532d1E6005e2CE12C200caeCe87',
    decimals: 18,
    id: 'TITAN',
    name: 'TitanSwap',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x24E89bDf2f65326b94E36978A7EDeAc63623DAFA',
    decimals: 18,
    id: 'TKING',
    name: 'Tiger King',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x9f589e3eabe42ebC94A44727b3f3531C0c877809',
    decimals: 18,
    id: 'TKO',
    name: 'TKO (BSC)',
    nativeAsset: 'BNB_BSC',
    type: 'BEP20'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'TKX',
    name: 'TokenX',
    nativeAsset: 'TKX',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '0x888888848B652B3E3a0f34c96E00EEC0F3a23F72',
    decimals: 4,
    id: 'TLM1',
    name: 'Alien Worlds Trilium',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x08f5a9235B08173b7569F83645d2c7fB55e8cCD8',
    decimals: 8,
    id: 'TNT',
    name: 'Tierion',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x2e9d63788249371f1DFC918a52f8d799F4a38C94',
    decimals: 18,
    id: 'TOKE',
    name: 'Tokemak',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x4507cEf57C46789eF8d1a19EA45f4216bae2B528',
    decimals: 9,
    id: 'TOKEN_BSC_RLDP',
    name: 'TokenFi',
    nativeAsset: 'BNB_BSC',
    type: 'BEP20'
  },
  {
    contractAddress: '0x4507cEf57C46789eF8d1a19EA45f4216bae2B528',
    decimals: 9,
    id: 'TOKEN_ETH_JIKQ',
    name: 'TokenFi',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 9,
    id: 'TON',
    name: 'TON',
    nativeAsset: 'TON',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '',
    decimals: 9,
    id: 'TON_TEST',
    name: 'TON Test',
    nativeAsset: 'TON_TEST',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '0xdcD85914b8aE28c1E62f1C488E1D968D5aaFfE2b',
    decimals: 18,
    id: 'TOP',
    name: 'TOP Network',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x3Dd98C8A089dBCFF7e8FC8d4f532BD493501Ab7F',
    decimals: 8,
    id: 'TOWN',
    name: 'TownCoin',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xaA7a9CA87d3694B5755f213B5D04094b8d0F0A6F',
    decimals: 18,
    id: 'TRAC',
    name: 'OriginTrail',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x88dF592F8eb5D7Bd38bFeF7dEb0fBc02cf3778a0',
    decimals: 18,
    id: 'TRB',
    name: 'Tellor Tributes',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x0Ba45A8b5d5575935B8158a88C631E9F9C95a2e5',
    decimals: 18,
    id: 'TRB_L',
    name: 'Tellor Tributes (Legacy)',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xc7283b66Eb1EB5FB86327f08e1B5816b0720212B',
    decimals: 18,
    id: 'TRIBE',
    name: 'Tribe',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x4C19596f5aAfF459fA38B0f7eD92F11AE6543784',
    decimals: 8,
    id: 'TRU',
    name: 'TrueFi',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xA4d17AB1eE0efDD23edc2869E7BA96B89eEcf9AB',
    decimals: 18,
    id: 'TRUE',
    name: 'TrueChain',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 6,
    id: 'TRX',
    name: 'Tron',
    nativeAsset: 'TRX',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '0x85EAC5Ac2F758618dFa09bDbe0cf174e7d574D5B',
    decimals: 18,
    id: 'TRX_BSC',
    name: 'TRON (BSC)',
    nativeAsset: 'BNB_BSC',
    type: 'BEP20'
  },
  {
    contractAddress: '',
    decimals: 6,
    id: 'TRX_TEST',
    name: 'Tron Test',
    nativeAsset: 'TRX_TEST',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '',
    decimals: 6,
    id: 'TRX_USDC_6NU3',
    issuerAddress: 'TEkxiTehnzSmSe2XqrBj4w32RUN966rdz8',
    name: 'USD Coin (Tron)',
    nativeAsset: 'TRX',
    type: 'TRON_TRC20'
  },
  {
    contractAddress: '',
    decimals: 6,
    id: 'TRX_USDC_SKL5',
    issuerAddress: 'TFGBSrddCjLJAwuryZ9DUxtEmKv13BPjnh',
    name: 'USD Coin Test (Tron)',
    nativeAsset: 'TRX_TEST',
    type: 'TRON_TRC20'
  },
  {
    contractAddress: '',
    decimals: 6,
    id: 'TRX_USDT_S2UZ',
    issuerAddress: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
    name: 'USD Tether (Tron)',
    nativeAsset: 'TRX',
    type: 'TRON_TRC20'
  },
  {
    contractAddress: '0x2C537E5624e4af88A7ae4060C022609376C8D0EB',
    decimals: 6,
    id: 'TRYB',
    name: 'BiLira',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x564A341Df6C126f90cf3ECB92120FD7190ACb401',
    decimals: 6,
    id: 'TRYB_AVAX',
    name: 'BiLira (Avalanche)',
    nativeAsset: 'AVAX',
    type: 'ERC20'
  },
  {
    contractAddress: '0xC1fdbed7Dac39caE2CcC0748f7a80dC446F6a594',
    decimals: 6,
    id: 'TRYB_BSC',
    name: 'BiLira (BSC)',
    nativeAsset: 'BNB_BSC',
    type: 'BEP20'
  },
  {
    contractAddress: '',
    decimals: 6,
    id: 'TRYB_SOL',
    issuerAddress: 'A94X2fRy3wydNShU4dRaDyap2UuoeWJGWyATtyp61WZf',
    name: 'BiLira (Solana)',
    nativeAsset: 'SOL',
    type: 'SOL_ASSET'
  },
  {
    contractAddress: '0xD9baE39c725A1864b1133Ad0eF1640d02f79B78c',
    decimals: 18,
    id: 'TST',
    name: 'Touch Smart Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xa760e26aA76747020171fCF8BdA108dFdE8Eb930',
    decimals: 18,
    id: 'TTOKE',
    name: 'TokemakTokePool',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x9F599410D207f3D2828a8712e5e543AC2E040382',
    decimals: 18,
    id: 'TTT',
    name: 'Tapcoin',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 6,
    id: 'TTT_SPL',
    issuerAddress: 'FNFKRV3V8DtA3gVJN6UshMiLGYA8izxFwkNWmJbFjmRj',
    name: 'TabTrader (SOLANA)',
    nativeAsset: 'SOL',
    type: 'SOL_ASSET'
  },
  {
    contractAddress: '0x6558392AfdA386d1A6b451640e809a27153151d8',
    decimals: 18,
    id: 'TTTT_ETH_TEST6',
    name: 'TTTT_ETH_TEST6',
    nativeAsset: 'ETH_TEST6',
    type: 'ERC20'
  },
  {
    contractAddress: '0x0000000000085d4780B73119b644AE5ecd22b376',
    decimals: 18,
    id: 'TUSD',
    name: 'TrueUSD',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x1C20E891Bab6b1727d14Da358FAe2984Ed9B59EB',
    decimals: 18,
    id: 'TUSD_AVAX',
    name: 'TrueUSD (Avalanche)',
    nativeAsset: 'AVAX',
    type: 'ERC20'
  },
  {
    contractAddress: '0xd084B83C305daFD76AE3E1b4E1F1fe2eCcCb3988',
    decimals: 18,
    id: 'TVK',
    name: 'Terra Virtua Kolect',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x4463e6A3dEd0dBE3F6e15bC8420dFc55e5FeA830',
    decimals: 18,
    id: 'TXA',
    name: 'TXA',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x547b2F82ceCfAb9C2B1D36fddA96eF9F58C63B8C',
    decimals: 18,
    id: 'TXT',
    name: 'Taxa Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x8400D94A5cb0fa0D041a3788e395285d61c9ee5e',
    decimals: 8,
    id: 'UBT',
    name: 'UniBright',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x8a3d77e9d6968b780564936d15B09805827C21fa',
    decimals: 18,
    id: 'UCO',
    name: 'UnirisToken',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xD1E5b0FF1287aA9f9A268759062E4Ab08b9Dacbe',
    decimals: 18,
    id: 'UD',
    name: '.crypto',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x12f649A9E821F90BB143089a6e56846945892ffB',
    decimals: 18,
    id: 'UDOO',
    name: 'uDOO',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x0202Be363B8a4820f3F4DE7FaF5224fF05943AB1',
    decimals: 18,
    id: 'UFT',
    name: 'UniLend Finance Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x24692791Bc444c5Cd0b81e3CBCaba4b04Acd1F3B',
    decimals: 18,
    id: 'UKG',
    name: 'Unikoin Gold',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x04Fa0d235C4abf4BcF4787aF4CF447DE572eF828',
    decimals: 18,
    id: 'UMA',
    name: 'UMA Voting Token v1',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x5872E64C3f93363822D2B1e4717Be3398FDCEA51',
    decimals: 18,
    id: 'UMASK',
    name: 'Hashmask',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x6fC13EACE26590B80cCCAB1ba5d51890577D83B2',
    decimals: 18,
    id: 'UMB',
    name: 'Umbrella',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
    decimals: 18,
    id: 'UNI',
    name: 'Uniswap',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xBf5140A22578168FD562DCcF235E5D43A02ce9B1',
    decimals: 18,
    id: 'UNI_BSC',
    name: 'Binance-Peg Uniswap (BSC)',
    nativeAsset: 'BNB_BSC',
    type: 'BEP20'
  },
  {
    contractAddress: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
    decimals: 18,
    id: 'UNI_ETH_TEST5_IXAC',
    name: 'Uniswap',
    nativeAsset: 'ETH_TEST5',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 8,
    id: 'UNI_SOL',
    issuerAddress: '8FU95xFJhUUkyyCLU13HSzDLs7oC4QZdXQHL6SCeab36',
    name: 'Uniswap (Solana)',
    nativeAsset: 'SOL',
    type: 'SOL_ASSET'
  },
  {
    contractAddress: '0x9861F7187b58023d89B2C2b0767bdEE43345620A',
    decimals: 18,
    id: 'UNI-V2-2GT-2',
    name: 'Uniswap V2: 2GT 2',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x600Cf1C039e1fD31Bc4762a39D322Dd8977Dd1aB',
    decimals: 18,
    id: 'UNI-V2-SMOL',
    name: 'Uniswap V2: SMOL',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x64060aB139Feaae7f06Ca4E63189D86aDEb51691',
    decimals: 18,
    id: 'UNIM_POLYGON_LACR',
    name: 'Unicorn Milk',
    nativeAsset: 'MATIC_POLYGON',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 6,
    id: 'UNQ_SOL',
    issuerAddress: 'UNQtEecZ5Zb4gSSVHCAWUQEoNnSVEbWiKCi1v9kdUJJ',
    name: 'UNQ',
    nativeAsset: 'SOL',
    type: 'SOL_ASSET'
  },
  {
    contractAddress: '0xD13c7342e1ef687C5ad21b27c2b65D772cAb5C8c',
    decimals: 4,
    id: 'UOS',
    name: 'Ultra Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xc7461b398005e50BCc43c8e636378C6722E76c01',
    decimals: 8,
    id: 'UPBTC',
    name: 'Universal Bitcoin',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x6C103D85C15107Dce19F5a75fC746227e610AaBd',
    decimals: 2,
    id: 'UPEUR',
    name: 'Universal Euro',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xC86D054809623432210c107af2e3F619DcFbf652',
    decimals: 18,
    id: 'UPP',
    name: 'SENTINEL PROTOCOL',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x6CA88Cc8D9288f5cAD825053B6A1B179B05c76fC',
    decimals: 18,
    id: 'UPT',
    name: 'Universal Protocol Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x86367c0e517622DAcdab379f2de389c3C9524345',
    decimals: 2,
    id: 'UPUSD',
    name: 'Universal US Dollar',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x0557Df767419296474C3f551Bb0A0ED4c2DD3380',
    decimals: 5,
    id: 'UPXAU',
    name: 'Universal Gold',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 2,
    id: 'USD_BY_WIRE',
    name: 'USD (wire)',
    nativeAsset: 'USD_BY_WIRE',
    type: 'FIAT'
  },
  {
    contractAddress: '',
    decimals: 2,
    id: 'USD_BY_WIRE_TEST',
    name: 'USD Test (wire)',
    nativeAsset: 'USD_BY_WIRE_TEST',
    type: 'FIAT'
  },
  {
    contractAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    decimals: 6,
    id: 'USDC',
    name: 'USD Coin',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582',
    decimals: 6,
    id: 'USDC_AMOY_POLYGON_TEST_7WWV',
    name: 'USDC',
    nativeAsset: 'AMOY_POLYGON_TEST',
    type: 'ERC20'
  },
  {
    contractAddress: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
    decimals: 6,
    id: 'USDC_ARB',
    name: 'Bridged USDC (Arbitrum)',
    nativeAsset: 'ETH-AETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
    decimals: 6,
    id: 'USDC_ARB_3SBJ',
    name: 'USD Coin (Arbitrum)',
    nativeAsset: 'ETH-AETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
    decimals: 6,
    id: 'USDC_AVAX',
    name: 'USD Coin (Avalanche)',
    nativeAsset: 'AVAX',
    type: 'ERC20'
  },
  {
    contractAddress: '0x5425890298aed601595a70AB815c96711a31Bc65',
    decimals: 6,
    id: 'USDC_AVAX_FUJI',
    name: ' USD Coin (Avalanche Fuji)',
    nativeAsset: 'AVAXTEST',
    type: 'ERC20'
  },
  {
    contractAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    decimals: 6,
    id: 'USDC_BASECHAIN_ETH_5I5C',
    name: 'USD Coin',
    nativeAsset: 'BASECHAIN_ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
    decimals: 18,
    id: 'USDC_BSC',
    name: 'Binance-Peg USD Coin (BSC)',
    nativeAsset: 'BNB_BSC',
    type: 'BEP20'
  },
  {
    contractAddress: '0xcebA9300f2b948710d2653dD7B07f33A8B32118C',
    decimals: 6,
    id: 'USDC_CELO_ROI8',
    name: 'USDC',
    nativeAsset: 'CELO',
    type: 'ERC20'
  },
  {
    contractAddress: '0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664',
    decimals: 6,
    id: 'USDC_E_AVAX',
    name: 'USD Coin (Avalanche)',
    nativeAsset: 'AVAX',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 6,
    id: 'USDC_E_NEAR',
    issuerAddress: 'a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near',
    name: 'USD Coin Bridged',
    nativeAsset: 'NEAR',
    type: 'NEAR_ASSET'
  },
  {
    contractAddress: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
    decimals: 6,
    id: 'USDC_ETH_TEST5_0GER',
    name: 'USDC',
    nativeAsset: 'ETH_TEST5',
    type: 'ERC20'
  },
  {
    contractAddress: '0x04068DA6C83AFCFA0e13ba15A6696662335D5B75',
    decimals: 6,
    id: 'USDC_FANTOM',
    name: 'USD Coin (Fantom)',
    nativeAsset: 'FTM_FANTOM',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 6,
    id: 'USDC_NEAR',
    issuerAddress: '17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1',
    name: 'USD Coin',
    nativeAsset: 'NEAR',
    type: 'NEAR_ASSET'
  },
  {
    contractAddress: '',
    decimals: 6,
    id: 'USDC_NOBLE',
    name: 'USDC Noble',
    nativeAsset: 'USDC_NOBLE',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '',
    decimals: 6,
    id: 'USDC_NOBLE_TEST',
    name: 'USDC Noble Testnet',
    nativeAsset: 'USDC_NOBLE_TEST',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    decimals: 6,
    id: 'USDC_POLYGON',
    name: 'USD Coin (Polygon)',
    nativeAsset: 'MATIC_POLYGON',
    type: 'ERC20'
  },
  {
    contractAddress: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
    decimals: 6,
    id: 'USDC_POLYGON_NXTB',
    name: 'USD Coin (Polygon)',
    nativeAsset: 'MATIC_POLYGON',
    type: 'ERC20'
  },
  {
    contractAddress: '0xBdbe4D9e43E8f305AfE9462802B8691C45Caf596',
    decimals: 18,
    id: 'USDD',
    name: 'USD Digital',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x1c48f86ae57291F7686349F12601910BD8D470bb',
    decimals: 18,
    id: 'USDK',
    name: 'USDK',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xbdC7c08592Ee4aa51D06C27Ee23D5087D65aDbcD',
    decimals: 18,
    id: 'USDL_ETH_HYWN',
    name: 'Lift Dollar',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x674C6Ad92Fd080e4004b2312b45f796a192D27a0',
    decimals: 18,
    id: 'USDN',
    name: 'Neutrino USD',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x3A15461d8aE0F0Fb5Fa2629e9DA7D66A794a6e37',
    decimals: 18,
    id: 'USDRIF_RSK_14FQ',
    name: 'RIF US Dollar',
    nativeAsset: 'RBTC',
    type: 'ERC20'
  },
  {
    contractAddress: '0xA4Bdb11dc0a2bEC88d24A3aa1E6Bb17201112eBe',
    decimals: 6,
    id: 'USDS',
    name: 'StableUSD',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xc7198437980c041c805A1EDcbA50c1Ce5db95118',
    decimals: 6,
    id: 'USDT_AVAX',
    name: 'Tether USD (Avalanche)',
    nativeAsset: 'AVAX',
    type: 'ERC20'
  },
  {
    contractAddress: '0x55d398326f99059fF775485246999027B3197955',
    decimals: 18,
    id: 'USDT_BSC',
    name: 'Binance-Peg Tether (BSC)',
    nativeAsset: 'BNB_BSC',
    type: 'BEP20'
  },
  {
    contractAddress: '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd',
    decimals: 18,
    id: 'USDT_BSC_TEST',
    name: 'USDT Token (BSC Test)',
    nativeAsset: 'BNB_TEST',
    type: 'BEP20'
  },
  {
    contractAddress: '0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e',
    decimals: 6,
    id: 'USDT_CELO',
    name: 'Tether USD (Celo)',
    nativeAsset: 'CELO',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 6,
    id: 'USDT_E_NEAR',
    issuerAddress: 'dac17f958d2ee523a2206206994597c13d831ec7.factory.bridge.near',
    name: 'USDT Tether Bridged',
    nativeAsset: 'NEAR',
    type: 'NEAR_ASSET'
  },
  {
    contractAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    decimals: 6,
    id: 'USDT_ERC20',
    name: 'Tether USD (Ethereum)',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 6,
    id: 'USDT_NEAR',
    issuerAddress: 'usdt.tether-token.near',
    name: 'USD Tether',
    nativeAsset: 'NEAR',
    type: 'NEAR_ASSET'
  },
  {
    contractAddress: '',
    decimals: 8,
    id: 'USDT_OMNI',
    name: 'Tether (Omni)',
    nativeAsset: 'BTC',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    decimals: 6,
    id: 'USDT_POLYGON',
    name: '(PoS) Tether USD (Polygon)',
    nativeAsset: 'MATIC_POLYGON',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 6,
    id: 'USDT_TON',
    issuerAddress: 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs',
    name: 'Tether USD (Ton)',
    nativeAsset: 'TON',
    type: 'TON_ASSET'
  },
  {
    contractAddress: '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7',
    decimals: 6,
    id: 'USDT2_AVAX',
    name: 'TetherToken _Avalanche_ - USDT2',
    nativeAsset: 'AVAX',
    type: 'ERC20'
  },
  {
    contractAddress: '0x4000369AcfA25C8FE5d17fE3312e30C332beF633',
    decimals: 9,
    id: 'USG',
    name: 'US Gold',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xa47c8bf37f92aBed4A126BDA807A7b7498661acD',
    decimals: 18,
    id: 'UST',
    name: 'Wrapped UST Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x23396cF899Ca06c4472205fC903bDB4de249D6fC',
    decimals: 18,
    id: 'UST_BSC',
    name: 'Wrapped UST Token',
    nativeAsset: 'BNB_BSC',
    type: 'BEP20'
  },
  {
    contractAddress: '0xa693B19d2931d498c5B318dF961919BB4aee87a5',
    decimals: 6,
    id: 'UST_ETH',
    name: 'UST (Wormhole)',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 6,
    id: 'UST_SOL',
    issuerAddress: '9vMJfxuKxXBoEa7rM12mYLMwTacLMLDJqHozw96WQL8i',
    name: 'UST (Solana)',
    nativeAsset: 'SOL',
    type: 'SOL_ASSET'
  },
  {
    contractAddress: '0x340D2bdE5Eb28c1eed91B2f790723E3B160613B7',
    decimals: 18,
    id: 'VEE',
    name: 'BLOCKv',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xcB84d72e61e383767C4DFEb2d8ff7f4FB89abc6e',
    decimals: 18,
    id: 'VEGA',
    name: 'VEGA',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x5F0bc16D50F72d10b719dBF6845DE2E599eb5624',
    decimals: 18,
    id: 'VENT',
    name: 'VENT',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x37F04d2C3AE075Fad5483bB918491F656B12BDB6',
    decimals: 8,
    id: 'VEST',
    name: 'VestChain',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x4D61577d8Fd2208A0afb814ea089fDeAe19ed202',
    decimals: 18,
    id: 'VFOX_BSC',
    name: 'VFOX (BSC)',
    nativeAsset: 'BNB_BSC',
    type: 'BEP20'
  },
  {
    contractAddress: '0x3C4B6E6e1eA3D4863700D7F76b36B7f3D3f13E3d',
    decimals: 8,
    id: 'VGX_ETH',
    name: 'Voyager Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x2C974B2d0BA1716E644c1FC59982a89DDD2fF724',
    decimals: 18,
    id: 'VIB',
    name: 'Viberate',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'VICTION',
    name: 'Viction',
    nativeAsset: 'VICTION',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '0x2C9023bBc572ff8dc1228c7858A280046Ea8C9E5',
    decimals: 18,
    id: 'VID',
    name: 'VideoCoin',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xfeF4185594457050cC9c23980d301908FE057Bb1',
    decimals: 18,
    id: 'VIDT',
    name: 'VIDT Datalink',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xC77b230F31b517F1ef362e59c173C2BE6540B5E8',
    decimals: 18,
    id: 'VIDY',
    name: 'VidyCoin',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x3D3D35bb9bEC23b06Ca00fe472b50E7A4c692C30',
    decimals: 18,
    id: 'VIDYA',
    name: 'Vidya',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xF938424F7210f31dF2Aee3011291b658f872e91e',
    decimals: 18,
    id: 'VISR',
    name: 'VISOR',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'VLX_TEST',
    name: 'Velas Test (VLX)',
    nativeAsset: 'VLX_TEST',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'VLX_VLX',
    name: 'Velas (VLX)',
    nativeAsset: 'VLX_VLX',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '0xd0258a3fD00f38aa8090dfee343f10A9D4d30D3F',
    decimals: 18,
    id: 'VOXEL_POLYGON',
    name: 'VOXEL Token (Polygon)',
    nativeAsset: 'MATIC_POLYGON',
    type: 'ERC20'
  },
  {
    contractAddress: '0xF411903cbC70a74d22900a5DE66A2dda66507255',
    decimals: 18,
    id: 'VRA',
    name: 'VERA',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x1b40183EFB4Dd766f11bDa7A7c3AD8982e998421',
    decimals: 18,
    id: 'VSP',
    name: 'VesperToken',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xB0fFa8000886e57F86dd5264b9582b2Ad87b2b91',
    decimals: 18,
    id: 'W_ETH_S5P9',
    name: 'Wormhole Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 6,
    id: 'W_SOL',
    issuerAddress: '85VBFQZC9TZkfaptBWjvUw7YbZjy52A6mjtPGjstQAmQ',
    name: 'Wormhole',
    nativeAsset: 'SOL',
    type: 'SOL_ASSET'
  },
  {
    contractAddress: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7',
    decimals: 18,
    id: 'WAVAX_AVAX',
    name: 'Wrapped AVAX (Avalanche)',
    nativeAsset: 'AVAX',
    type: 'ERC20'
  },
  {
    contractAddress: '0x1cF4592ebfFd730c7dc92c1bdFFDfc3B9EfCf29a',
    decimals: 18,
    id: 'WAVES',
    name: 'WAVES token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    decimals: 18,
    id: 'WBNB_BSC',
    name: 'Wrapped BNB (BSC)',
    nativeAsset: 'BNB_BSC',
    type: 'BEP20'
  },
  {
    contractAddress: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    decimals: 8,
    id: 'WBTC',
    name: 'Wrapped BTC',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x50b7545627a5162F82A992c33b87aDc75187B218',
    decimals: 8,
    id: 'WBTC_AVAX',
    name: 'Wrapped BTC (Avalanche)',
    nativeAsset: 'AVAX',
    type: 'ERC20'
  },
  {
    contractAddress: '0xc221b7E65FfC80DE234bbB6667aBDd46593D34F0',
    decimals: 18,
    id: 'WCFG',
    name: 'Wrapped Centrifuge',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x61cc6aF18C351351148815c5F4813A16DEe7A7E4',
    decimals: 18,
    id: 'WCT_B6QT1TZK_TZBJ',
    name: 'WalletConnect',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xeF4461891DfB3AC8572cCf7C794664A8DD927945',
    decimals: 18,
    id: 'WCT_B7K5S6PF_H7HU',
    name: 'WalletConnect',
    nativeAsset: 'ETH-OPT',
    type: 'ERC20'
  },
  {
    contractAddress: '0x123151402076fc819B7564510989e475c9cD93CA',
    decimals: 8,
    id: 'WDGLD',
    name: 'wrapped-DGLD',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'WEMIX',
    name: 'WEMIX',
    nativeAsset: 'WEMIX',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'WEMIX_TEST',
    name: 'WEMIX Test',
    nativeAsset: 'WEMIX_TEST',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    decimals: 18,
    id: 'WETH',
    name: 'Wrapped Ether',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB',
    decimals: 18,
    id: 'WETH_E',
    name: 'Wrapped Ether (Avalanche)',
    nativeAsset: 'AVAX',
    type: 'ERC20'
  },
  {
    contractAddress: '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14',
    decimals: 18,
    id: 'WETH_ETH_TEST5_PU4S',
    name: 'Wrapped Ether',
    nativeAsset: 'ETH_TEST5',
    type: 'ERC20'
  },
  {
    contractAddress: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
    decimals: 18,
    id: 'WETH_POLYGON',
    name: 'Wrapped Ether (Polygon)',
    nativeAsset: 'MATIC_POLYGON',
    type: 'ERC20'
  },
  {
    contractAddress: '0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83',
    decimals: 18,
    id: 'WFTM_FANTOM',
    name: 'Wrapped Fantom (Fantom)',
    nativeAsset: 'FTM_FANTOM',
    type: 'ERC20'
  },
  {
    contractAddress: '0x9355372396e3F6daF13359B7b607a3374cc638e0',
    decimals: 4,
    id: 'WHALE',
    name: 'WHALE',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x0fa5B0608633c13f4E135F9b1F3570508B4f7046',
    decimals: 8,
    id: 'WHBAR',
    name: 'Wrapped Hbar',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x2a3bFF78B79A009976EeA096a51A948a3dC00e34',
    decimals: 18,
    id: 'WILD',
    name: 'Wilder',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xaeF0d72a118ce24feE3cD1d43d383897D05B4e99',
    decimals: 18,
    id: 'WIN_BSC',
    name: 'WINk',
    nativeAsset: 'BNB_BSC',
    type: 'BEP20'
  },
  {
    contractAddress: '0x667088b212ce3d06a1b553a7221E1fD19000d9aF',
    decimals: 18,
    id: 'WINGS',
    name: 'Wings',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x971fC3880aD395c165e812b029E7Df76FcB63eD8',
    decimals: 18,
    id: 'WIRE',
    name: 'Airwire',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xDecade1c6Bf2cD9fb89aFad73e4a519C867adcF5',
    decimals: 18,
    id: 'WIS',
    name: 'Experty Wisdom Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xd2877702675e6cEb975b4A1dFf9fb7BAF4C91ea9',
    decimals: 18,
    id: 'WLUNA',
    name: 'Wrapped LUNA Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
    decimals: 18,
    id: 'WMATIC_POLYGON',
    name: 'Wrapped Matic (Polygon)',
    nativeAsset: 'MATIC_POLYGON',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 12,
    id: 'WND',
    name: 'Westend',
    nativeAsset: 'WND',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '0x0d438F3b5175Bebc262bF23753C1E53d03432bDE',
    decimals: 18,
    id: 'WNXM',
    name: 'Wrapped NXM',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xBd356a39BFf2cAda8E9248532DD879147221Cf76',
    decimals: 18,
    id: 'WOM',
    name: 'WOM Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x4691937a7508860F876c9c0a2a617E7d9E945D4B',
    decimals: 18,
    id: 'WOO',
    name: 'Wootrade Network (Ethereum)',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x7A8d51b82b36Fa5B50fb77001D6d189E920d2f75',
    decimals: 18,
    id: 'WOPIUM',
    name: 'Wrapped Opium Governance Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'WORLDCHAIN',
    name: 'Worldchain',
    nativeAsset: 'WORLDCHAIN',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'WORLDCHAIN_TEST',
    name: 'Worldchain Test',
    nativeAsset: 'WORLDCHAIN_TEST',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '0xd1e2d5085b39B80C9948AeB1b9aA83AF6756bcc5',
    decimals: 9,
    id: 'WOXEN',
    name: 'Wrapped OXEN',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x4CF488387F035FF08c371515562CBa712f9015d4',
    decimals: 18,
    id: 'WPR',
    name: 'WePower',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x542fDA317318eBF1d3DEAf76E0b632741A7e677d',
    decimals: 18,
    id: 'WRBTC_RSK_VNPH',
    name: 'Wrapped BTC',
    nativeAsset: 'RBTC',
    type: 'ERC20'
  },
  {
    contractAddress: '0xFF0a024B66739357c4ED231fB3DBC0c8C22749F5',
    decimals: 8,
    id: 'WRX',
    name: 'Wazirx Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x8e17ed70334C87eCE574C9d537BC153d8609e2a3',
    decimals: 8,
    id: 'WRX_BSC',
    name: 'Wazirx Token (BSC)',
    nativeAsset: 'BNB_BSC',
    type: 'BEP20'
  },
  {
    contractAddress: '0xa3C22370de5f9544f0c4De126b1e46cEadF0A51B',
    decimals: 18,
    id: 'WSTRAX',
    name: 'WrappedStrax',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xb7cB1C96dB6B22b0D3d9536E0108d062BD488F74',
    decimals: 18,
    id: 'WTC',
    name: 'Waltonchain',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xa02120696c7B8fE16C09C749E4598819b2B0E915',
    decimals: 18,
    id: 'WXT',
    name: 'Wirex Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x68749665FF8D2d112Fa859AA293F07A622782F38',
    decimals: 6,
    id: 'XAUT2',
    name: 'Tether Gold (New)',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x57C09A8de0b0F471F8567609777aDdFfb5c46a08',
    decimals: 18,
    id: 'XBX',
    name: 'Bitex Global XBX Coin',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x03678f2c2c762DC63c2Bb738c3a837D366eDa560',
    decimals: 18,
    id: 'XCASH_POLYGON',
    name: 'X-Cash (PoS)',
    nativeAsset: 'MATIC_POLYGON',
    type: 'ERC20'
  },
  {
    contractAddress: '0xB4272071eCAdd69d933AdcD19cA99fe80664fc08',
    decimals: 18,
    id: 'XCHF',
    name: 'CryptoFranc',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'XDAI',
    name: 'Gnosis xDAI',
    nativeAsset: 'XDAI',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'XDAI_TEST',
    name: 'Gnosis xDAI Test',
    nativeAsset: 'XDAI_TEST',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '',
    decimals: 7,
    id: 'XDB',
    name: 'XDB',
    nativeAsset: 'XDB',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '0xB9EefC4b0d472A44be93970254Df4f4016569d27',
    decimals: 7,
    id: 'XDB_ETH',
    name: 'Digitalbits (ETH)',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 7,
    id: 'XDB_ROMA_G5H1',
    issuerAddress: 'GBJPYIYYLCJED2ETN3YWPG23P77JWIE3SSNHZJPW2FOHKRBXNKF5UEEL',
    name: 'ROMA (DigitalBits)',
    nativeAsset: 'XDB',
    type: 'XDB_ASSET'
  },
  {
    contractAddress: '',
    decimals: 7,
    id: 'XDB_TEST',
    name: 'XDB Test',
    nativeAsset: 'XDB_TEST',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '',
    decimals: 7,
    id: 'XDB_USDS_7FSS',
    issuerAddress: 'GBFOHHXUNGIYJHPLXAC3AKNDDXWR6NSUJSKBMXY452Y4AQBZEUL7EKAB',
    name: 'USDS (DigitalBits)',
    nativeAsset: 'XDB',
    type: 'XDB_ASSET'
  },
  {
    contractAddress: '',
    decimals: 7,
    id: 'XDB_ZUSD_Q74F',
    issuerAddress: 'GBFOHHXUNGIYJHPLXAC3AKNDDXWR6NSUJSKBMXY452Y4AQBZEUL7EKAB',
    name: 'ZUSD (DigitalBits)',
    nativeAsset: 'XDB',
    type: 'XDB_ASSET'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'XDC',
    name: 'XDC Network',
    nativeAsset: 'XDC',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '',
    decimals: 2,
    id: 'XEC',
    name: 'eCash',
    nativeAsset: 'XEC',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '',
    decimals: 2,
    id: 'XEC_TEST',
    name: 'eCash Test',
    nativeAsset: 'XEC_TEST',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '',
    decimals: 6,
    id: 'XEM',
    name: 'XEM',
    nativeAsset: 'XEM',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '',
    decimals: 6,
    id: 'XEM_TEST',
    name: 'XEM Test',
    nativeAsset: 'XEM_TEST',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '0x4aa41bC1649C9C3177eD16CaaA11482295fC7441',
    decimals: 18,
    id: 'XFIT',
    name: 'XFIT',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xA974c709cFb4566686553a20790685A47acEAA33',
    decimals: 18,
    id: 'XIN',
    name: 'Mixin',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 7,
    id: 'XLM',
    name: 'Stellar',
    nativeAsset: 'XLM',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '',
    decimals: 7,
    id: 'XLM_AKN_GNFL',
    issuerAddress: 'GACSHAJ2XBNKRNJEVDAII6E2EAASIAMDBCLJ3VKSZEWK3KC7Y7DPXUFX',
    name: 'Akoin (Stellar)',
    nativeAsset: 'XLM',
    type: 'XLM_ASSET'
  },
  {
    contractAddress: '',
    decimals: 7,
    id: 'XLM_BRL_LQ3J',
    issuerAddress: 'GDVKY2GU2DRXWTBEYJJWSFXIGBZV6AZNBVVSUHEPZI54LIS6BA7DVVSP',
    name: 'BRL (Stellar)',
    nativeAsset: 'XLM',
    type: 'XLM_ASSET'
  },
  {
    contractAddress: '',
    decimals: 7,
    id: 'XLM_BRZ_EDTE',
    issuerAddress: 'GABMA6FPH3OJXNTGWO7PROF7I5WPQUZOB4BLTBTP4FK6QV7HWISLIEO2',
    name: 'BRZ Token (Stellar)',
    nativeAsset: 'XLM',
    type: 'XLM_ASSET'
  },
  {
    contractAddress: '',
    decimals: 7,
    id: 'XLM_BTCE_DP2P',
    issuerAddress: 'GBOPFWZZJZUMTS6KVQAHUUNLMXO424ZF7IWHF6GONLAVCDSN4TBBKCLV',
    name: 'BTCe Test (Stellar)',
    nativeAsset: 'XLM_TEST',
    type: 'XLM_ASSET'
  },
  {
    contractAddress: '',
    decimals: 7,
    id: 'XLM_BTCEM_T_MVE5',
    issuerAddress: 'GBOPFWZZJZUMTS6KVQAHUUNLMXO424ZF7IWHF6GONLAVCDSN4TBBKCLV',
    name: 'BTCEM Test (Stellar)',
    nativeAsset: 'XLM_TEST',
    type: 'XLM_ASSET'
  },
  {
    contractAddress: '',
    decimals: 7,
    id: 'XLM_EURE_O4P4',
    issuerAddress: 'GBOPFWZZJZUMTS6KVQAHUUNLMXO424ZF7IWHF6GONLAVCDSN4TBBKCLV',
    name: 'EURe Test (Stellar)',
    nativeAsset: 'XLM_TEST',
    type: 'XLM_ASSET'
  },
  {
    contractAddress: '',
    decimals: 7,
    id: 'XLM_EUREM_T_B7SB',
    issuerAddress: 'GBOPFWZZJZUMTS6KVQAHUUNLMXO424ZF7IWHF6GONLAVCDSN4TBBKCLV',
    name: 'EUREM Test (Stellar)',
    nativeAsset: 'XLM_TEST',
    type: 'XLM_ASSET'
  },
  {
    contractAddress: '',
    decimals: 7,
    id: 'XLM_FBTEST_7SNX',
    issuerAddress: 'GC3NA75PU6HD5OWCZ7OHCSAL6HZSELNTTBAGHAOCGHBSAQTVI7GCQK2J',
    name: 'Fireblocks Test Token (Stellar)',
    nativeAsset: 'XLM_TEST',
    type: 'XLM_ASSET'
  },
  {
    contractAddress: '',
    decimals: 7,
    id: 'XLM_GYEN_TLIE',
    issuerAddress: 'GDF6VOEGRWLOZ64PQQGKD2IYWA22RLT37GJKS2EJXZHT2VLAGWLC5TOB',
    name: 'GMO JPY (Stellar)',
    nativeAsset: 'XLM',
    type: 'XLM_ASSET'
  },
  {
    contractAddress: '',
    decimals: 7,
    id: 'XLM_GYEN_ZN63',
    issuerAddress: 'GAQQSET64FFYJLZB3XIFUVPGRDMETG2USH2R7VPUY2E4YEXH7STKRISN',
    name: 'GMO JPY Test (Stellar)',
    nativeAsset: 'XLM_TEST',
    type: 'XLM_ASSET'
  },
  {
    contractAddress: '',
    decimals: 7,
    id: 'XLM_HODL_EFOE',
    issuerAddress: 'GAQEDFS2JK6JSQO53DWT23TGOLH5ZUZG4O3MNLF3CFUZWEJ6M7MMGJAV',
    name: 'HODL Token (Stellar)',
    nativeAsset: 'XLM',
    type: 'XLM_ASSET'
  },
  {
    contractAddress: '',
    decimals: 7,
    id: 'XLM_IDK_JM2C',
    issuerAddress: 'GAVDGVOARGIMZA47POPHGPC2FRDE7I7ZF3NGNNIGDPGEZRMTELFAD6DN',
    name: 'IDK (Stellar)',
    nativeAsset: 'XLM',
    type: 'XLM_ASSET'
  },
  {
    contractAddress: '',
    decimals: 7,
    id: 'XLM_LUNA_T_WZ5J',
    issuerAddress: 'GBDH4456HKE3BNIMIRWRHQDWN2KSOTY3FZFGUJTRZXY33Y3JEJGGFMCT',
    name: 'Luna Test (Stellar)',
    nativeAsset: 'XLM_TEST',
    type: 'XLM_ASSET'
  },
  {
    contractAddress: '',
    decimals: 7,
    id: 'XLM_NTT_PZV2',
    issuerAddress: 'GBWFD4RZAEMXLBDLVYTGTRZ53IIGLWOAPEMVRF5V62M7FH76QER5JNMI',
    name: 'NTT Test (Stellar)',
    nativeAsset: 'XLM_TEST',
    type: 'XLM_ASSET'
  },
  {
    contractAddress: '',
    decimals: 7,
    id: 'XLM_ROMA_G5H1',
    issuerAddress: 'GBJPYIYYLCJED2ETN3YWPG23P77JWIE3SSNHZJPW2FOHKRBXNKF5UEEL',
    name: 'ROMA _DigitalBits_',
    nativeAsset: 'XDB',
    type: 'XDB_ASSET'
  },
  {
    contractAddress: '',
    decimals: 7,
    id: 'XLM_SBDD_T_GC74',
    issuerAddress: 'GC74OM3VHSTARP2BNCEFFCU5GUNRXGNYZUORHFVZIZJH7IPISKOVDHM4',
    name: 'SBDD Issuance Wallet Test (Stellar)',
    nativeAsset: 'XLM_TEST',
    type: 'XLM_ASSET'
  },
  {
    contractAddress: '',
    decimals: 7,
    id: 'XLM_SBDD_T_GD7R',
    issuerAddress: 'GD7RN27CQZAAYDZZ5WCIFYRSXSFQCB72IKMFEU2LE6V5M7ILZOONALOK',
    name: 'SBDD Distribution Wallet Test (Stellar)',
    nativeAsset: 'XLM_TEST',
    type: 'XLM_ASSET'
  },
  {
    contractAddress: '',
    decimals: 7,
    id: 'XLM_SIX_BIQ4',
    issuerAddress: 'GDMS6EECOH6MBMCP3FYRYEVRBIV3TQGLOFQIPVAITBRJUMTI6V7A2X6Z',
    name: 'SIX.Network',
    nativeAsset: 'XLM',
    type: 'XLM_ASSET'
  },
  {
    contractAddress: '',
    decimals: 7,
    id: 'XLM_SOLA_T_7WZU',
    issuerAddress: 'GDFREACG4LEESEGBBQZKSMS7FS47YNULFKBKFP5WGNKEHXOGNQVGSZHV',
    name: 'Sola Test (Stellar)',
    nativeAsset: 'XLM_TEST',
    type: 'XLM_ASSET'
  },
  {
    contractAddress: '',
    decimals: 7,
    id: 'XLM_TEST',
    name: 'Stellar Test',
    nativeAsset: 'XLM_TEST',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '',
    decimals: 7,
    id: 'XLM_TLFTST_UH6X',
    issuerAddress: 'GBN54AOKMC6H4Q25Y623IRVUJHVREZJV7DQEJKQ26WISKQZDY4MC6VI3',
    name: 'TLFTST Test (Stellar)',
    nativeAsset: 'XLM_TEST',
    type: 'XLM_ASSET'
  },
  {
    contractAddress: '',
    decimals: 7,
    id: 'XLM_USDC_5F3T',
    issuerAddress: 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN',
    name: 'USD Coin (Stellar)',
    nativeAsset: 'XLM',
    type: 'XLM_ASSET'
  },
  {
    contractAddress: '',
    decimals: 7,
    id: 'XLM_USDC_T_CEKS',
    issuerAddress: 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5',
    name: 'USD Coin Test (Stellar)',
    nativeAsset: 'XLM_TEST',
    type: 'XLM_ASSET'
  },
  {
    contractAddress: '',
    decimals: 7,
    id: 'XLM_WXT_DQLC',
    issuerAddress: 'GASBLVHS5FOABSDNW5SPPH3QRJYXY5JHA2AOA2QHH2FJLZBRXSG4SWXT',
    name: 'Wirex Token (Stellar)',
    nativeAsset: 'XLM',
    type: 'XLM_ASSET'
  },
  {
    contractAddress: '',
    decimals: 7,
    id: 'XLM_ZUSD_VQXC',
    issuerAddress: 'GDF6VOEGRWLOZ64PQQGKD2IYWA22RLT37GJKS2EJXZHT2VLAGWLC5TOB',
    name: 'Z.com USD (Stellar)',
    nativeAsset: 'XLM',
    type: 'XLM_ASSET'
  },
  {
    contractAddress: '',
    decimals: 7,
    id: 'XLM_ZUSD_XCYQ',
    issuerAddress: 'GAQQSET64FFYJLZB3XIFUVPGRDMETG2USH2R7VPUY2E4YEXH7STKRISN',
    name: 'Z.com USD Test (Stellar)',
    nativeAsset: 'XLM_TEST',
    type: 'XLM_ASSET'
  },
  {
    contractAddress: '0x3aaDA3e213aBf8529606924d8D1c55CbDc70Bf74',
    decimals: 18,
    id: 'XMON',
    name: 'XMON',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 6,
    id: 'XRP',
    name: 'XRP (Ripple)',
    nativeAsset: 'XRP',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '',
    decimals: 6,
    id: 'XRP_TEST',
    name: 'XRP Test',
    nativeAsset: 'XRP_TEST',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '0x70e8dE73cE538DA2bEEd35d14187F6959a8ecA96',
    decimals: 6,
    id: 'XSGD',
    name: 'XSGD',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x8798249c2E607446EfB7Ad49eC89dD1865Ff4272',
    decimals: 18,
    id: 'XSUSHI',
    name: 'SushiBar',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x6368e1E18c4C419DDFC608A0BEd1ccb87b9250fc',
    decimals: 18,
    id: 'XTP',
    name: 'TAP',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x9c794f933b4DD8B49031A79b0f924D68BEF43992',
    decimals: 18,
    id: 'XTRD',
    name: 'XTRD',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 6,
    id: 'XTZ',
    name: 'Tezos',
    nativeAsset: 'XTZ',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '0x16939ef78684453bfDFb47825F8a5F714f12623a',
    decimals: 18,
    id: 'XTZ_BSC',
    name: 'Tezos BSC Token',
    nativeAsset: 'BNB_BSC',
    type: 'BEP20'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'XTZ_ETHERLINK',
    name: 'Tezos (Etherlink)',
    nativeAsset: 'XTZ_ETHERLINK',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'XTZ_ETHERLINK_TEST',
    name: 'Tezos Test (Etherlink Testnet)',
    nativeAsset: 'XTZ_ETHERLINK_TEST',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '',
    decimals: 6,
    id: 'XTZ_TEST',
    name: 'Tezos Test',
    nativeAsset: 'XTZ_TEST',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '0xb5999795BE0EbB5bAb23144AA5FD6A02D080299F',
    decimals: 18,
    id: 'XUSD_RBTC',
    name: 'XUSD Babelfish stablecoin (RSK)',
    nativeAsset: 'RBTC',
    type: 'ERC20'
  },
  {
    contractAddress: '0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63',
    decimals: 18,
    id: 'XVS_BSC',
    name: 'Venus (BSC)',
    nativeAsset: 'BNB_BSC',
    type: 'BEP20'
  },
  {
    contractAddress: '0x55296f69f40Ea6d20E478533C15A6B08B654E758',
    decimals: 18,
    id: 'XYO',
    name: 'XY Oracle',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x618679dF9EfCd19694BB1daa8D00718Eacfa2883',
    decimals: 18,
    id: 'XYZ',
    name: 'XYZ Governance Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x0AaCfbeC6a24756c20D41914F2caba817C0d8521',
    decimals: 18,
    id: 'YAM',
    name: 'YAM',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 9,
    id: 'YARD_SOL',
    issuerAddress: '8RYSc3rrS4X4bvBCtSJnhcpPpMaAJkXnVKZPzANxQHgz',
    name: 'SolYard Finance (Solana)',
    nativeAsset: 'SOL',
    type: 'SOL_ASSET'
  },
  {
    contractAddress: '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e',
    decimals: 18,
    id: 'YFI',
    name: 'Yearn Finance',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xa1d0E215a23d7030842FC67cE582a6aFa3CCaB83',
    decimals: 18,
    id: 'YFII',
    name: 'YFII.finance',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x28cb7e841ee97947a86B06fA4090C8451f64c0be',
    decimals: 18,
    id: 'YFL',
    name: 'YFLink',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x25f8087EAD173b73D6e8B84329989A8eEA16CF73',
    decimals: 18,
    id: 'YGG',
    name: 'Yield Guild Games Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xF94b5C5651c888d928439aB6514B93944eEE6F48',
    decimals: 18,
    id: 'YLD',
    name: 'Yield',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xA26Cbb76156090f4B40A1799A220fc4C946aFB3c',
    decimals: 18,
    id: 'YNG',
    name: 'Young Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xAE1eaAE3F627AAca434127644371b67B18444051',
    decimals: 8,
    id: 'YOP',
    name: 'YOP',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xd6aD7a6750A7593E092a9B218d66C0A814a3436e',
    decimals: 6,
    id: 'YUSDC',
    name: 'iearn USDC',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x7Da96a3891Add058AdA2E826306D812C638D87a7',
    decimals: 6,
    id: 'YVUSDT',
    name: 'USDT yVault',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x2994529C0652D127b7842094103715ec5299bBed',
    decimals: 18,
    id: 'YYCRV',
    name: 'yearn Curve.fi',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xC52C326331E9Ce41F04484d3B5E5648158028804',
    decimals: 18,
    id: 'ZCX',
    name: 'ZEN Exchange Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x6cfDDfeCa2D22F3611E35c4915994472b07Ca315',
    decimals: 18,
    id: 'ZDC',
    name: 'Zodiac',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '',
    decimals: 8,
    id: 'ZEC',
    name: 'ZCash',
    nativeAsset: 'ZEC',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '',
    decimals: 8,
    id: 'ZEC_TEST',
    name: 'ZCash Test',
    nativeAsset: 'ZEC_TEST',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '0xF0939011a9bb95c3B791f0cb546377Ed2693a574',
    decimals: 18,
    id: 'ZERO',
    name: 'Zero.Exchange Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x7BeBd226154E865954A87650FAefA8F485d36081',
    decimals: 18,
    id: 'ZIG',
    name: 'ZigCoin',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x7BeBd226154E865954A87650FAefA8F485d36081',
    decimals: 18,
    id: 'ZIG_BSC',
    name: 'ZigCoin (BSC)',
    nativeAsset: 'BNB_BSC',
    type: 'BEP20'
  },
  {
    contractAddress: '0xb86AbCb37C3A4B64f74f59301AFF131a1BEcC787',
    decimals: 12,
    id: 'ZIL_BSC',
    name: 'Zilliqa (BSC)',
    nativeAsset: 'BNB_BSC',
    type: 'BEP20'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'ZIL_MAINNET',
    name: 'Zilliqa EVM Mainnet',
    nativeAsset: 'ZIL_MAINNET',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '',
    decimals: 18,
    id: 'ZIL_TEST',
    name: 'Zilliqa EVM Test',
    nativeAsset: 'ZIL_TEST',
    type: 'BASE_ASSET'
  },
  {
    contractAddress: '0xA9d2927d3a04309E008B6af6E2e282AE2952e7fD',
    decimals: 18,
    id: 'ZIP',
    name: 'Zipper',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xe4815AE53B124e7263F08dcDBBB757d41Ed658c6',
    decimals: 18,
    id: 'ZKS',
    name: 'Zks Token',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0x69cf3091C91EB72DB05E45C76e58225177dEA742',
    decimals: 18,
    id: 'ZOOM',
    name: 'CoinZoom',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xE41d2489571d322189246DaFA5ebDe1F4699F498',
    decimals: 18,
    id: 'ZRX',
    name: '0x',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xc56c2b7e71B54d38Aab6d52E94a04Cbfa8F604fA',
    decimals: 6,
    id: 'ZUSD',
    name: 'Z.com USD',
    nativeAsset: 'ETH',
    type: 'ERC20'
  },
  {
    contractAddress: '0xbf0f3cCB8fA385A287106FbA22e6BB722F94d686',
    decimals: 6,
    id: 'ZYTARAUSD',
    name: 'Zytara USD',
    nativeAsset: 'ETH',
    type: 'ERC20'
  }
]

@Injectable()
export class FireblocksAssetService {
  constructor(
    private readonly networkRepository: NetworkRepository,
    private readonly logger: LoggerService
  ) {}

  private mapFireblocksAsset(network: Network, fireblocksAsset: FireblocksAsset): Asset {
    return {
      decimals: fireblocksAsset.decimals,
      externalId: fireblocksAsset.id,
      name: fireblocksAsset.name,
      networkId: network.networkId,
      onchainId: fireblocksAsset.contractAddress || fireblocksAsset.issuerAddress || undefined
    }
  }

  async findByExternalId(externalId: string): Promise<Asset | null> {
    for (const fireblocksAsset of FIREBLOCKS_ASSETS) {
      if (fireblocksAsset.id === externalId) {
        const network = await this.networkRepository.findByExternalId(Provider.FIREBLOCKS, fireblocksAsset.nativeAsset)

        if (network) {
          return this.mapFireblocksAsset(network, fireblocksAsset)
        }
      }
    }

    return null
  }

  async findAll(): Promise<Asset[]> {
    const networkExternalIdIndex = await this.networkRepository.buildProviderExternalIdIndex(Provider.FIREBLOCKS)
    const assets: Asset[] = []

    for (const fireblocksAsset of FIREBLOCKS_ASSETS) {
      const network = networkExternalIdIndex.get(fireblocksAsset.nativeAsset)

      if (network) {
        assets.push(this.mapFireblocksAsset(network, fireblocksAsset))
      } else {
        this.logger.warn('Fireblocks asset network not found', { fireblocksAsset })
      }
    }

    return assets
  }

  async findByOnchainId(networkId: string, onchainId: string): Promise<Asset | null> {
    for (const fireblocksAsset of FIREBLOCKS_ASSETS) {
      if (
        fireblocksAsset.contractAddress?.toLowerCase() === onchainId.toLowerCase() ||
        fireblocksAsset.issuerAddress?.toLowerCase() === onchainId.toLowerCase()
      ) {
        const network = await this.networkRepository.findByExternalId(Provider.FIREBLOCKS, fireblocksAsset.nativeAsset)

        if (network?.networkId === networkId) {
          return this.mapFireblocksAsset(network, fireblocksAsset)
        }
      }
    }

    return null
  }

  async findNativeAsset(networkId: string): Promise<Asset | null> {
    const network = await this.networkRepository.findById(networkId)

    if (network) {
      const externalNetwork = getExternalNetwork(network, Provider.FIREBLOCKS)

      for (const fireblocksAsset of FIREBLOCKS_ASSETS) {
        // If network matches and asset doesn't have a contract address or issuer address, it must be the
        // native asset.
        if (
          externalNetwork?.externalId === fireblocksAsset.nativeAsset &&
          !fireblocksAsset.contractAddress &&
          !fireblocksAsset.issuerAddress
        ) {
          return this.mapFireblocksAsset(network, fireblocksAsset)
        }
      }
    }

    return null
  }
}
