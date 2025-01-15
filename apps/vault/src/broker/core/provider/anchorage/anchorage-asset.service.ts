import { LoggerService } from '@narval/nestjs-shared'
import { Injectable } from '@nestjs/common'
import { NetworkRepository } from '../../../persistence/repository/network.repository'
import { Asset } from '../../type/asset.type'
import { Network } from '../../type/network.type'
import { Provider } from '../../type/provider.type'
import { getExternalNetwork } from '../../util/network.util'

type AnchorageAsset = {
  assetType: string
  decimals: number
  name: string
  networkId: string
  onchainIdentifier?: string
}

const ANCHORAGE_ASSETS: AnchorageAsset[] = [
  {
    assetType: '1INCH',
    decimals: 18,
    name: '1inch',
    networkId: 'ETH',
    onchainIdentifier: '0x111111111117dc0aa78b770fa6a738034120c302'
  },
  {
    assetType: 'A8',
    decimals: 18,
    name: 'Ancient8',
    networkId: 'ETH',
    onchainIdentifier: '0x3e5a19c91266ad8ce2477b91585d1856b84062df'
  },
  {
    assetType: 'AAVE',
    decimals: 18,
    name: 'Aave',
    networkId: 'ETH',
    onchainIdentifier: '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9'
  },
  {
    assetType: 'ACX',
    decimals: 18,
    name: 'Across Protocol Token',
    networkId: 'ETH',
    onchainIdentifier: '0x44108f0223a3c3028f5fe7aec7f9bb2e66bef82f'
  },
  {
    assetType: 'AJNA',
    decimals: 18,
    name: 'AjnaToken',
    networkId: 'ETH',
    onchainIdentifier: '0x9a96ec9b57fb64fbc60b423d1f4da7691bd35079'
  },
  {
    assetType: 'ALD',
    decimals: 18,
    name: 'Aladdin Token',
    networkId: 'ETH',
    onchainIdentifier: '0xb26c4b3ca601136daf98593feaeff9e0ca702a8d'
  },
  {
    assetType: 'ALICE',
    decimals: 6,
    name: 'My Neighbor Alice',
    networkId: 'ETH',
    onchainIdentifier: '0xac51066d7bec65dc4589368da368b212745d63e8'
  },
  {
    assetType: 'ALLO',
    decimals: 18,
    name: 'Allora',
    networkId: 'ALLO'
  },
  {
    assetType: 'ALLO_T',
    decimals: 18,
    name: 'Allora Testnet',
    networkId: 'ALLO_T'
  },
  {
    assetType: 'ALPHA',
    decimals: 18,
    name: 'Alpha Finance Lab',
    networkId: 'ETH',
    onchainIdentifier: '0xa1faa113cbe53436df28ff0aee54275c13b40975'
  },
  {
    assetType: 'ALT',
    decimals: 18,
    name: 'AltLayer Token',
    networkId: 'ETH',
    onchainIdentifier: '0x8457ca5040ad67fdebbcc8edce889a335bc0fbfb'
  },
  {
    assetType: 'AMP',
    decimals: 18,
    name: 'Amp',
    networkId: 'ETH',
    onchainIdentifier: '0xff20817765cb7f73d4bde2e66e067e58d11095c2'
  },
  {
    assetType: 'ANGLE',
    decimals: 18,
    name: 'Angle',
    networkId: 'ETH',
    onchainIdentifier: '0x31429d1856ad1377a8a0079410b297e1a9e214c2'
  },
  {
    assetType: 'ANKR',
    decimals: 18,
    name: 'Ankr Network',
    networkId: 'ETH',
    onchainIdentifier: '0x8290333cef9e6d528dd5618fb97a76f268f3edd4'
  },
  {
    assetType: 'ANT',
    decimals: 18,
    name: 'Aragon',
    networkId: 'ETH',
    onchainIdentifier: '0xa117000000f279d81a1d3cc75430faa017fa5a2e'
  },
  {
    assetType: 'APE',
    decimals: 18,
    name: 'ApeCoin',
    networkId: 'ETH',
    onchainIdentifier: '0x4d224452801aced8b2f0aebe155379bb5d594381'
  },
  {
    assetType: 'API3',
    decimals: 18,
    name: 'API3',
    networkId: 'ETH',
    onchainIdentifier: '0x0b38210ea11411557c13457d4da7dc6ea731b88a'
  },
  {
    assetType: 'APT',
    decimals: 8,
    name: 'Aptos',
    networkId: 'APT'
  },
  {
    assetType: 'APT_T',
    decimals: 8,
    name: 'Aptos Testnet',
    networkId: 'APT_T'
  },
  {
    assetType: 'ARB',
    decimals: 18,
    name: 'Arbitrum',
    networkId: 'ETH',
    onchainIdentifier: '0xb50721bcf8d664c30412cfbc6cf7a15145234ad1'
  },
  {
    assetType: 'ARB_ARBITRUM_T',
    decimals: 18,
    name: 'ARB on Arbitrum Sepolia',
    networkId: 'ARBITRUM_SEPOLIA',
    onchainIdentifier: '0xf0114170db316047e508ce4714142cfad49f767d'
  },
  {
    assetType: 'ARCD',
    decimals: 18,
    name: 'Arcade',
    networkId: 'ETH',
    onchainIdentifier: '0xe020b01b6fbd83066aa2e8ee0ccd1eb8d9cc70bf'
  },
  {
    assetType: 'ARKM',
    decimals: 18,
    name: 'Arkham',
    networkId: 'ETH',
    onchainIdentifier: '0x6e2a43be0b1d33b726f0ca3b8de60b3482b8b050'
  },
  {
    assetType: 'ASTO',
    decimals: 18,
    name: 'Altered State Token',
    networkId: 'ETH',
    onchainIdentifier: '0x823556202e86763853b40e9cde725f412e294689'
  },
  {
    assetType: 'ATA',
    decimals: 18,
    name: 'Automata',
    networkId: 'ETH',
    onchainIdentifier: '0xa2120b9e674d3fc3875f415a7df52e382f141225'
  },
  {
    assetType: 'ATOM',
    decimals: 6,
    name: 'Cosmos',
    networkId: 'COSMOS'
  },
  {
    assetType: 'AUCTION',
    decimals: 18,
    name: 'Bounce',
    networkId: 'ETH',
    onchainIdentifier: '0xa9b1eb5908cfc3cdf91f9b8b3a74108598009096'
  },
  {
    assetType: 'AUDIO',
    decimals: 18,
    name: 'Audius',
    networkId: 'ETH',
    onchainIdentifier: '0x18aaa7115705e8be94bffebde57af9bfc265b998'
  },
  {
    assetType: 'AURORA',
    decimals: 18,
    name: 'Aurora',
    networkId: 'ETH',
    onchainIdentifier: '0xaaaaaa20d9e0e2461697782ef11675f668207961'
  },
  {
    assetType: 'AUSD',
    decimals: 6,
    name: 'AUSD',
    networkId: 'ETH',
    onchainIdentifier: '0x00000000efe302beaa2b3e6e1b18d08d69a9012a'
  },
  {
    assetType: 'AVA',
    decimals: 18,
    name: 'Jadu AVA',
    networkId: 'ETH',
    onchainIdentifier: '0x86fc6f6c6702cef7d3bae87ef41256715416db71'
  },
  {
    assetType: 'AVAIL',
    decimals: 18,
    name: 'Avail',
    networkId: 'ETH',
    onchainIdentifier: '0xeeb4d8400aeefafc1b2953e0094134a887c76bd8'
  },
  {
    assetType: 'AVG',
    decimals: 18,
    name: 'Avocado DAO Token',
    networkId: 'ETH',
    onchainIdentifier: '0xa41f142b6eb2b164f8164cae0716892ce02f311f'
  },
  {
    assetType: 'AXL',
    decimals: 6,
    name: 'Axelar',
    networkId: 'AXL'
  },
  {
    assetType: 'AXL_T',
    decimals: 6,
    name: 'Axelar Testnet',
    networkId: 'AXL_T'
  },
  {
    assetType: 'AXS',
    decimals: 18,
    name: 'Axie Infinity',
    networkId: 'ETH',
    onchainIdentifier: '0xbb0e17ef65f82ab018d8edd776e8dd940327b28b'
  },
  {
    assetType: 'AXS_OLD',
    decimals: 18,
    name: 'Axie Infinity Shard',
    networkId: 'ETH',
    onchainIdentifier: '0xf5d669627376ebd411e34b98f19c868c8aba5ada'
  },
  {
    assetType: 'AZIMUTH',
    decimals: 18,
    name: 'Azimuth Points',
    networkId: 'ETH',
    onchainIdentifier: '0x33eecbf908478c10614626a9d304bfe18b78dd73'
  },
  {
    assetType: 'BADGER',
    decimals: 18,
    name: 'Badger DAO',
    networkId: 'ETH',
    onchainIdentifier: '0x3472a5a71965499acd81997a54bba8d852c6e53d'
  },
  {
    assetType: 'BAL',
    decimals: 18,
    name: 'Balancer',
    networkId: 'ETH',
    onchainIdentifier: '0xba100000625a3754423978a60c9317c58a424e3d'
  },
  {
    assetType: 'BANANA',
    decimals: 18,
    name: 'Banana',
    networkId: 'ETH',
    onchainIdentifier: '0x38e68a37e401f7271568cecaac63c6b1e19130b4'
  },
  {
    assetType: 'BAND',
    decimals: 18,
    name: 'BandToken',
    networkId: 'ETH',
    onchainIdentifier: '0xba11d00c5f74255f56a5e366f4f77f5a186d7f55'
  },
  {
    assetType: 'BAT',
    decimals: 18,
    name: 'Basic Attention',
    networkId: 'ETH',
    onchainIdentifier: '0x0d8775f648430679a709e98d2b0cb6250d2887ef'
  },
  {
    assetType: 'BAYC',
    decimals: 18,
    name: 'Bored Ape Yacht Club',
    networkId: 'ETH',
    onchainIdentifier: '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d'
  },
  {
    assetType: 'BBN',
    decimals: 6,
    name: 'Babylon',
    networkId: 'BBN'
  },
  {
    assetType: 'BCH',
    decimals: 8,
    name: 'Bitcoin Cash',
    networkId: 'BCH'
  },
  {
    assetType: 'BEAM',
    decimals: 18,
    name: 'Beam',
    networkId: 'ETH',
    onchainIdentifier: '0x62d0a8458ed7719fdaf978fe5929c6d342b0bfce'
  },
  {
    assetType: 'BETA',
    decimals: 18,
    name: 'Beta Finance',
    networkId: 'ETH',
    onchainIdentifier: '0xbe1a001fe942f96eea22ba08783140b9dcc09d28'
  },
  {
    assetType: 'BGB_OLD',
    decimals: 18,
    name: 'BitgetToken',
    networkId: 'ETH',
    onchainIdentifier: '0x19de6b897ed14a376dda0fe53a5420d2ac828a28'
  },
  {
    assetType: 'BICO',
    decimals: 18,
    name: 'Biconomy Token',
    networkId: 'ETH',
    onchainIdentifier: '0xf17e65822b568b3903685a7c9f496cf7656cc6c2'
  },
  {
    assetType: 'BLD',
    decimals: 6,
    name: 'Agoric',
    networkId: 'BLD'
  },
  {
    assetType: 'BLUR',
    decimals: 18,
    name: 'Blur',
    networkId: 'ETH',
    onchainIdentifier: '0x5283d291dbcf85356a21ba090e6db59121208b44'
  },
  {
    assetType: 'BNT',
    decimals: 18,
    name: 'Bancor',
    networkId: 'ETH',
    onchainIdentifier: '0x1f573d6fb3f13d689ff844b4ce37794d79a7ff1c'
  },
  {
    assetType: 'BOTTO',
    decimals: 18,
    name: 'Botto',
    networkId: 'ETH',
    onchainIdentifier: '0x9dfad1b7102d46b1b197b90095b5c4e9f5845bba'
  },
  {
    assetType: 'BREED',
    decimals: 18,
    name: 'BreederDAO',
    networkId: 'ETH',
    onchainIdentifier: '0x94e9eb8b5ab9fd6b9ea3169d55ffade62a01702e'
  },
  {
    assetType: 'BTC',
    decimals: 8,
    name: 'Bitcoin',
    networkId: 'BTC'
  },
  {
    assetType: 'BTC_S',
    decimals: 8,
    name: 'Bitcoin Signet',
    networkId: 'BTC_S'
  },
  {
    assetType: 'BTRST',
    decimals: 18,
    name: 'Braintrust',
    networkId: 'ETH',
    onchainIdentifier: '0x799ebfabe77a6e34311eeee9825190b9ece32824'
  },
  {
    assetType: 'BUIDL',
    decimals: 6,
    name: 'BlackRock USD Institutional Digital Liquidity Fund',
    networkId: 'ETH',
    onchainIdentifier: '0x7712c34205737192402172409a8f7ccef8aa2aec'
  },
  {
    assetType: 'BUIDLSEP',
    decimals: 6,
    name: 'BlackRock USD Institutional Digital Liquidity Fund (Sepolia Network)',
    networkId: 'ETHSEP',
    onchainIdentifier: '0xeb0609d3e6312f20bc82b6f500e0d266d6c3d8b5'
  },
  {
    assetType: 'BUIDL_APTOS',
    decimals: 6,
    name: 'Buidl on Aptos',
    networkId: 'APT'
  },
  {
    assetType: 'BUSD',
    decimals: 18,
    name: 'Binance USD',
    networkId: 'ETH',
    onchainIdentifier: '0x4fabb145d64652a948d72533023f6e7a623c7c53'
  },
  {
    assetType: 'CBETH',
    decimals: 18,
    name: 'Coinbase Wrapped Staked ETH',
    networkId: 'ETH',
    onchainIdentifier: '0xbe9895146f7af43049ca1c1ae358b0541ea49704'
  },
  {
    assetType: 'CELLANA_APTOS',
    decimals: 8,
    name: 'CELLANA',
    networkId: 'APT'
  },
  {
    assetType: 'CELO_TB',
    decimals: 18,
    name: 'Celo Testnet (Baklava)',
    networkId: 'CELO_TB',
    onchainIdentifier: '0xddc9be57f553fe75752d61606b94cbd7e0264ef8'
  },
  {
    assetType: 'CHZ',
    decimals: 18,
    name: 'Chiliz',
    networkId: 'ETH',
    onchainIdentifier: '0x3506424f91fd33084466f402d5d97f05f8e3b4af'
  },
  {
    assetType: 'CLONEX',
    decimals: 18,
    name: 'Clone X',
    networkId: 'ETH',
    onchainIdentifier: '0x49cf6f5d44e70224e2e23fdcdd2c053f30ada28b'
  },
  {
    assetType: 'COMP',
    decimals: 18,
    name: 'Compound',
    networkId: 'ETH',
    onchainIdentifier: '0xc00e94cb662c3520282e6f5717214004a7f26888'
  },
  {
    assetType: 'COW',
    decimals: 18,
    name: 'Cow Protocol Token',
    networkId: 'ETH',
    onchainIdentifier: '0xdef1ca1fb7fbcdc777520aa7f396b4e015f497ab'
  },
  {
    assetType: 'CPOOL',
    decimals: 18,
    name: 'Clearpool',
    networkId: 'ETH',
    onchainIdentifier: '0x66761fa41377003622aee3c7675fc7b5c1c2fac5'
  },
  {
    assetType: 'CQT',
    decimals: 18,
    name: 'Covalent Query Token',
    networkId: 'ETH',
    onchainIdentifier: '0xd417144312dbf50465b1c641d016962017ef6240'
  },
  {
    assetType: 'CREAM',
    decimals: 18,
    name: 'Cream Finance',
    networkId: 'ETH',
    onchainIdentifier: '0x2ba592f78db6436527729929aaf6c908497cb200'
  },
  {
    assetType: 'CRO',
    decimals: 8,
    name: 'Cronos',
    networkId: 'ETH',
    onchainIdentifier: '0xa0b73e1ff0b80914ab6fe0444e65848c4c34450b'
  },
  {
    assetType: 'CRV',
    decimals: 18,
    name: 'Curve DAO',
    networkId: 'ETH',
    onchainIdentifier: '0xd533a949740bb3306d119cc777fa900ba034cd52'
  },
  {
    assetType: 'CUSDC',
    decimals: 8,
    name: 'Compound USD Coin',
    networkId: 'ETH',
    onchainIdentifier: '0x39aa39c021dfbae8fac545936693ac917d5e7563'
  },
  {
    assetType: 'CVC',
    decimals: 8,
    name: 'Civic',
    networkId: 'ETH',
    onchainIdentifier: '0x41e5560054824ea6b0732e656e3ad64e20e94e45'
  },
  {
    assetType: 'CVX',
    decimals: 18,
    name: 'Convex Finance',
    networkId: 'ETH',
    onchainIdentifier: '0x4e3fbd56cd56c3e72c1403e103b45db9da5b9d2b'
  },
  {
    assetType: 'CYBER',
    decimals: 18,
    name: 'CyberConnect',
    networkId: 'ETH',
    onchainIdentifier: '0x14778860e937f509e651192a90589de711fb88a9'
  },
  {
    assetType: 'DAI',
    decimals: 18,
    name: 'Dai',
    networkId: 'ETH',
    onchainIdentifier: '0x6b175474e89094c44da98b954eedeac495271d0f'
  },
  {
    assetType: 'DAR',
    decimals: 6,
    name: 'Mines of Dalarnia',
    networkId: 'ETH',
    onchainIdentifier: '0x081131434f93063751813c619ecca9c4dc7862a3'
  },
  {
    assetType: 'DIMO',
    decimals: 18,
    name: 'Dimo',
    networkId: 'ETH',
    onchainIdentifier: '0x5fab9761d60419c9eeebe3915a8fa1ed7e8d2e1b'
  },
  {
    assetType: 'DODO',
    decimals: 18,
    name: 'DODO',
    networkId: 'ETH',
    onchainIdentifier: '0x43dfc4159d86f3a37a5a4b3d4580b888ad7d4ddd'
  },
  {
    assetType: 'DOGE',
    decimals: 8,
    name: 'Dogecoin',
    networkId: 'DOGE'
  },
  {
    assetType: 'DPI',
    decimals: 18,
    name: 'DefiPulse Index',
    networkId: 'ETH',
    onchainIdentifier: '0x1494ca1f11d487c2bbe4543e90080aeba4ba3c2b'
  },
  {
    assetType: 'DYDX',
    decimals: 18,
    name: 'dYdX',
    networkId: 'ETH',
    onchainIdentifier: '0x92d6c1e31e14520e676a687f0a93788b716beff5'
  },
  {
    assetType: 'DYDX_CHAIN',
    decimals: 18,
    name: 'Dydx Chain',
    networkId: 'DYDX_CHAIN'
  },
  {
    assetType: 'DYDX_CHAIN_T',
    decimals: 18,
    name: 'Dydx Chain Testnet',
    networkId: 'DYDX_CHAIN_T'
  },
  {
    assetType: 'ECO',
    decimals: 18,
    name: 'Eco Fi Token',
    networkId: 'ETH',
    onchainIdentifier: '0xc242eb8e4e27eae6a2a728a41201152f19595c83'
  },
  {
    assetType: 'ECOX',
    decimals: 18,
    name: 'ECOx',
    networkId: 'ETH',
    onchainIdentifier: '0xcccd1ba9f7acd6117834e0d28f25645decb1736a'
  },
  {
    assetType: 'EIGEN',
    decimals: 18,
    name: 'Eigen',
    networkId: 'ETH',
    onchainIdentifier: '0xec53bf9167f50cdeb3ae105f56099aaab9061f83'
  },
  {
    assetType: 'EINUHOL',
    decimals: 18,
    name: 'EigenInu (Holesky Network)',
    networkId: 'ETHHOL',
    onchainIdentifier: '0xdeeeee2b48c121e6728ed95c860e296177849932'
  },
  {
    assetType: 'ELFI',
    decimals: 18,
    name: 'Element Fi',
    networkId: 'ETH',
    onchainIdentifier: '0x5c6d51ecba4d8e4f20373e3ce96a62342b125d6d'
  },
  {
    assetType: 'ELS',
    decimals: 18,
    name: 'Ethlas',
    networkId: 'ETH',
    onchainIdentifier: '0xeb575c45004bd7b61c6a8d3446a62a05a6ce18d8'
  },
  {
    assetType: 'ENA',
    decimals: 18,
    name: 'ENA',
    networkId: 'ETH',
    onchainIdentifier: '0x57e114b691db790c35207b2e685d4a43181e6061'
  },
  {
    assetType: 'ENFD',
    decimals: 0,
    name: 'EnergyFunders Yield FD I LLC',
    networkId: 'ETH',
    onchainIdentifier: '0x997bb865f307dbe0f979fd2864ae72c93b983d25'
  },
  {
    assetType: 'ENJ',
    decimals: 18,
    name: 'Enjin Coin',
    networkId: 'ETH',
    onchainIdentifier: '0xf629cbd94d3791c9250152bd8dfbdf380e2a3b9c'
  },
  {
    assetType: 'ENS',
    decimals: 18,
    name: 'ENS',
    networkId: 'ETH',
    onchainIdentifier: '0xc18360217d8f7ab5e7c516566761ea12ce7f9d72'
  },
  {
    assetType: 'ES',
    decimals: 6,
    name: 'Eclipse',
    networkId: 'ETH',
    onchainIdentifier: '0x6055dc6ff1077eebe5e6d2ba1a1f53d7ef8430de'
  },
  {
    assetType: 'ETH',
    decimals: 18,
    name: 'Ethereum',
    networkId: 'ETH'
  },
  {
    assetType: 'ETHFI',
    decimals: 18,
    name: 'etherfi governance token',
    networkId: 'ETH',
    onchainIdentifier: '0xfe0c30065b384f05761f15d0cc899d4f9f9cc0eb'
  },
  {
    assetType: 'ETHHOL',
    decimals: 18,
    name: 'Ethereum Test (Holešky)',
    networkId: 'ETHHOL'
  },
  {
    assetType: 'ETHSEP',
    decimals: 18,
    name: 'Ethereum Test (Sepolia)',
    networkId: 'ETHSEP'
  },
  {
    assetType: 'ETHX',
    decimals: 18,
    name: 'ETHx',
    networkId: 'ETH',
    onchainIdentifier: '0xa35b1b31ce002fbf2058d22f30f95d405200a15b'
  },
  {
    assetType: 'ETH_ARBITRUM_T',
    decimals: 18,
    name: 'Ethereum on Arbitrum Sepolia Testnet',
    networkId: 'ARBITRUM_SEPOLIA'
  },
  {
    assetType: 'ETH_PLUME_T',
    decimals: 18,
    name: 'Ethereum on Plume Sepolia Testnet',
    networkId: 'PLUME_SEPOLIA'
  },
  {
    assetType: 'ETH_ZKSYNC_T',
    decimals: 18,
    name: 'Ethereum on ZKsync Sepolia Testnet',
    networkId: 'ZKSYNC_SEPOLIA'
  },
  {
    assetType: 'EUL',
    decimals: 18,
    name: 'Euler',
    networkId: 'ETH',
    onchainIdentifier: '0xd9fcd98c322942075a5c3860693e9f4f03aae07b'
  },
  {
    assetType: 'EUROC',
    decimals: 6,
    name: 'Euro Coin',
    networkId: 'ETH',
    onchainIdentifier: '0x1abaea1f7c830bd89acc67ec4af516284b1bc33c'
  },
  {
    assetType: 'EVERY',
    decimals: 18,
    name: 'Everyworld',
    networkId: 'ETH',
    onchainIdentifier: '0x9afa9999e45484adf5d8eed8d9dfe0693bacd838'
  },
  {
    assetType: 'EVMOS',
    decimals: 18,
    name: 'Evmos',
    networkId: 'EVMOS'
  },
  {
    assetType: 'EVMOS_T',
    decimals: 18,
    name: 'Evmos Testnet',
    networkId: 'EVMOS_T'
  },
  {
    assetType: 'FEI',
    decimals: 18,
    name: 'Fei USD',
    networkId: 'ETH',
    onchainIdentifier: '0x956f47f50a910163d8bf957cf5846d573e7f87ca'
  },
  {
    assetType: 'FET',
    decimals: 18,
    name: 'Fetch',
    networkId: 'ETH',
    onchainIdentifier: '0xaea46a60368a7bd060eec7df8cba43b7ef41ad85'
  },
  {
    assetType: 'FIL',
    decimals: 18,
    name: 'Filecoin',
    networkId: 'FIL'
  },
  {
    assetType: 'FIRE',
    decimals: 18,
    name: 'Ceramic Fire',
    networkId: 'ETH',
    onchainIdentifier: '0x2033e559cddff6dd36ec204e3014faa75a01052e'
  },
  {
    assetType: 'FLIP',
    decimals: 18,
    name: 'Chainflip',
    networkId: 'ETH',
    onchainIdentifier: '0x826180541412d574cf1336d22c0c0a287822678a'
  },
  {
    assetType: 'FLOW_T',
    decimals: 8,
    name: 'Flow Testnet',
    networkId: 'FLOW_T'
  },
  {
    assetType: 'FLT',
    decimals: 18,
    name: 'Fluence',
    networkId: 'ETH',
    onchainIdentifier: '0x236501327e701692a281934230af0b6be8df3353'
  },
  {
    assetType: 'FLX',
    decimals: 18,
    name: 'Flex Ungovernance Token',
    networkId: 'ETH',
    onchainIdentifier: '0x6243d8cea23066d098a15582d81a598b4e8391f4'
  },
  {
    assetType: 'FLY',
    decimals: 18,
    name: 'FlyCoin',
    networkId: 'ETH',
    onchainIdentifier: '0x4e568ab95f029e8df1e39b30c9d6d076eaa15945'
  },
  {
    assetType: 'FOAM',
    decimals: 18,
    name: 'Foam',
    networkId: 'ETH',
    onchainIdentifier: '0x4946fcea7c692606e8908002e55a582af44ac121'
  },
  {
    assetType: 'FORT',
    decimals: 18,
    name: 'Forta',
    networkId: 'ETH',
    onchainIdentifier: '0x41545f8b9472d758bb669ed8eaeeecd7a9c4ec29'
  },
  {
    assetType: 'FOX',
    decimals: 18,
    name: 'Shapeshift FOX Token',
    networkId: 'ETH',
    onchainIdentifier: '0xc770eefad204b5180df6a14ee197d99d808ee52d'
  },
  {
    assetType: 'FRAX',
    decimals: 18,
    name: 'Frax',
    networkId: 'ETH',
    onchainIdentifier: '0x853d955acef822db058eb8505911ed77f175b99e'
  },
  {
    assetType: 'FST',
    decimals: 18,
    name: 'Futureswap',
    networkId: 'ETH',
    onchainIdentifier: '0x0e192d382a36de7011f795acc4391cd302003606'
  },
  {
    assetType: 'FTM',
    decimals: 18,
    name: 'Fantom',
    networkId: 'ETH',
    onchainIdentifier: '0x4e15361fd6b4bb609fa63c81a2be19d873717870'
  },
  {
    assetType: 'FTT',
    decimals: 18,
    name: 'FTX Token',
    networkId: 'ETH',
    onchainIdentifier: '0x50d1c9771902476076ecfc8b2a83ad6b9355a4c9'
  },
  {
    assetType: 'FUEL',
    decimals: 18,
    name: 'Fuel',
    networkId: 'ETH',
    onchainIdentifier: '0x56ebdae96d179549f279ea0cfea3b3432b8cd2bc'
  },
  {
    assetType: 'FWB',
    decimals: 18,
    name: 'Friends With Benefits Pro',
    networkId: 'ETH',
    onchainIdentifier: '0x35bd01fc9d6d5d81ca9e055db88dc49aa2c699a8'
  },
  {
    assetType: 'FXS',
    decimals: 18,
    name: 'Frax Share',
    networkId: 'ETH',
    onchainIdentifier: '0x3432b6a60d23ca0dfca7761b7ab56459d9c964d0'
  },
  {
    assetType: 'GEAR',
    decimals: 18,
    name: 'Gearbox',
    networkId: 'ETH',
    onchainIdentifier: '0xba3335588d9403515223f109edc4eb7269a9ab5d'
  },
  {
    assetType: 'GEL',
    decimals: 18,
    name: 'Gelato Network Token',
    networkId: 'ETH',
    onchainIdentifier: '0x15b7c0c907e4c6b9adaaaabc300c08991d6cea05'
  },
  {
    assetType: 'GF',
    decimals: 18,
    name: 'GuildFi Token',
    networkId: 'ETH',
    onchainIdentifier: '0xaaef88cea01475125522e117bfe45cf32044e238'
  },
  {
    assetType: 'GFI',
    decimals: 18,
    name: 'Goldfinch',
    networkId: 'ETH',
    onchainIdentifier: '0xdab396ccf3d84cf2d07c4454e10c8a6f5b008d2b'
  },
  {
    assetType: 'GLM',
    decimals: 18,
    name: 'Golem Network Token',
    networkId: 'ETH',
    onchainIdentifier: '0x7dd9c5cba05e151c895fde1cf355c9a1d5da6429'
  },
  {
    assetType: 'GMEE',
    decimals: 18,
    name: 'GAMEE',
    networkId: 'ETH',
    onchainIdentifier: '0xd9016a907dc0ecfa3ca425ab20b6b785b42f2373'
  },
  {
    assetType: 'GMT',
    decimals: 8,
    name: 'GreenMetaverseToken',
    networkId: 'ETH',
    onchainIdentifier: '0xe3c408bd53c31c085a1746af401a4042954ff740'
  },
  {
    assetType: 'GNO',
    decimals: 18,
    name: 'Gnosis',
    networkId: 'ETH',
    onchainIdentifier: '0x6810e776880c02933d47db1b9fc05908e5386b96'
  },
  {
    assetType: 'GNT',
    decimals: 18,
    name: 'Golem',
    networkId: 'ETH',
    onchainIdentifier: '0xa74476443119a942de498590fe1f2454d7d4ac0d'
  },
  {
    assetType: 'GRT',
    decimals: 18,
    name: 'Graph Token',
    networkId: 'ETH',
    onchainIdentifier: '0xc944e90c64b2c07662a292be6244bdf05cda44a7'
  },
  {
    assetType: 'GYEN',
    decimals: 6,
    name: 'GMO JPY',
    networkId: 'ETH',
    onchainIdentifier: '0xc08512927d12348f6620a698105e1baac6ecd911'
  },
  {
    assetType: 'HAIR',
    decimals: 18,
    name: 'HairDAO Token',
    networkId: 'ETH',
    onchainIdentifier: '0x9ce115f0341ae5dabc8b477b74e83db2018a6f42'
  },
  {
    assetType: 'HASH',
    decimals: 9,
    name: 'Provenance Hash',
    networkId: 'HASH'
  },
  {
    assetType: 'HBOT',
    decimals: 18,
    name: 'Hummingbot Governance Token',
    networkId: 'ETH',
    onchainIdentifier: '0xe5097d9baeafb89f9bcb78c9290d545db5f9e9cb'
  },
  {
    assetType: 'HBTC',
    decimals: 18,
    name: 'Huobi BTC',
    networkId: 'ETH',
    onchainIdentifier: '0x0316eb71485b0ab14103307bf65a021042c6d380'
  },
  {
    assetType: 'HEGIC',
    decimals: 18,
    name: 'Hegic',
    networkId: 'ETH',
    onchainIdentifier: '0x584bc13c7d411c00c01a62e8019472de68768430'
  },
  {
    assetType: 'HFT',
    decimals: 18,
    name: 'Hashflow',
    networkId: 'ETH',
    onchainIdentifier: '0xb3999f658c0391d94a37f7ff328f3fec942bcadc'
  },
  {
    assetType: 'IDK',
    decimals: 8,
    name: 'IDKToken',
    networkId: 'ETH',
    onchainIdentifier: '0x61fd1c62551850d0c04c76fce614cbced0094498'
  },
  {
    assetType: 'ILV',
    decimals: 18,
    name: 'Illuvium',
    networkId: 'ETH',
    onchainIdentifier: '0x767fe9edc9e0df98e07454847909b5e959d7ca0e'
  },
  {
    assetType: 'IMX',
    decimals: 18,
    name: 'Immutable X',
    networkId: 'ETH',
    onchainIdentifier: '0xf57e7e7c23978c3caec3c3548e3d615c346e79ff'
  },
  {
    assetType: 'INDEX',
    decimals: 18,
    name: 'Index',
    networkId: 'ETH',
    onchainIdentifier: '0x0954906da0bf32d5479e25f46056d22f08464cab'
  },
  {
    assetType: 'INDI',
    decimals: 18,
    name: 'IndiGG',
    networkId: 'ETH',
    onchainIdentifier: '0x3392d8a60b77f8d3eaa4fb58f09d835bd31add29'
  },
  {
    assetType: 'IOTX',
    decimals: 18,
    name: 'IoTeX Network',
    networkId: 'ETH',
    onchainIdentifier: '0x6fb3e0a217407efff7ca062d46c26e5d60a14d69'
  },
  {
    assetType: 'KARATE',
    decimals: 18,
    name: 'Karate',
    networkId: 'ETH',
    onchainIdentifier: '0x80008bcd713c38af90a9930288d446bc3bd2e684'
  },
  {
    assetType: 'KARRAT',
    decimals: 18,
    name: 'KarratCoin',
    networkId: 'ETH',
    onchainIdentifier: '0xacd2c239012d17beb128b0944d49015104113650'
  },
  {
    assetType: 'KEEP',
    decimals: 18,
    name: 'Keep Network',
    networkId: 'ETH',
    onchainIdentifier: '0x85eee30c52b0b379b046fb0f85f4f3dc3009afec'
  },
  {
    assetType: 'KEYS',
    decimals: 18,
    name: 'KEYS Token',
    networkId: 'ETH',
    onchainIdentifier: '0xf24603654f1150926314badf00420d6a71ee343e'
  },
  {
    assetType: 'KINE',
    decimals: 18,
    name: 'Kine Governance Token',
    networkId: 'ETH',
    onchainIdentifier: '0xcbfef8fdd706cde6f208460f2bf39aa9c785f05d'
  },
  {
    assetType: 'KNC',
    decimals: 18,
    name: 'Kyber Network Crystal v2',
    networkId: 'ETH',
    onchainIdentifier: '0xdefa4e8a7bcba345f687a2f1456f5edd9ce97202'
  },
  {
    assetType: 'KNCL',
    decimals: 18,
    name: 'Kyber Network Legacy',
    networkId: 'ETH',
    onchainIdentifier: '0xdd974d5c2e2928dea5f71b9825b8b646686bd200'
  },
  {
    assetType: 'L3',
    decimals: 18,
    name: 'Layer3',
    networkId: 'ETH',
    onchainIdentifier: '0x88909d489678dd17aa6d9609f89b0419bf78fd9a'
  },
  {
    assetType: 'LAND',
    decimals: 18,
    name: "The Sandbox's LANDs",
    networkId: 'ETH',
    onchainIdentifier: '0x5cc5b05a8a13e3fbdb0bb9fccd98d38e50f90c38'
  },
  {
    assetType: 'LBTC',
    decimals: 8,
    name: 'Lombard Staked Bitcoin',
    networkId: 'ETH',
    onchainIdentifier: '0x8236a87084f8b84306f72007f36f2618a5634494'
  },
  {
    assetType: 'LDO',
    decimals: 18,
    name: 'Lido DAO',
    networkId: 'ETH',
    onchainIdentifier: '0x5a98fcbea516cf06857215779fd812ca3bef1b32'
  },
  {
    assetType: 'LINK',
    decimals: 18,
    name: 'Chainlink',
    networkId: 'ETH',
    onchainIdentifier: '0x514910771af9ca656af840dff83e8264ecf986ca'
  },
  {
    assetType: 'LINKSEP',
    decimals: 18,
    name: 'Chainlink Token Test',
    networkId: 'ETHSEP',
    onchainIdentifier: '0x779877a7b0d9e8603169ddbd7836e478b4624789'
  },
  {
    assetType: 'LINK_ARBITRUM_T',
    decimals: 18,
    name: 'Chainlink Token on Arbitrum Sepolia',
    networkId: 'ARBITRUM_SEPOLIA',
    onchainIdentifier: '0xb1d4538b4571d411f07960ef2838ce337fe1e80e'
  },
  {
    assetType: 'LINK_ZKSYNC_T',
    decimals: 18,
    name: 'Chainlink Token on ZKsync Sepolia',
    networkId: 'ZKSYNC_SEPOLIA',
    onchainIdentifier: '0x23a1afd896c8c8876af46adc38521f4432658d1e'
  },
  {
    assetType: 'LMWR',
    decimals: 18,
    name: 'LimeWire Token',
    networkId: 'ETH',
    onchainIdentifier: '0x628a3b2e302c7e896acc432d2d0dd22b6cb9bc88'
  },
  {
    assetType: 'LOKA',
    decimals: 18,
    name: 'League Of Kingdoms Arena',
    networkId: 'ETH',
    onchainIdentifier: '0x61e90a50137e1f645c9ef4a0d3a4f01477738406'
  },
  {
    assetType: 'LPT',
    decimals: 18,
    name: 'Livepeer Token',
    networkId: 'ETH',
    onchainIdentifier: '0x58b6a8a3302369daec383334672404ee733ab239'
  },
  {
    assetType: 'LRC',
    decimals: 18,
    name: 'Loopring',
    networkId: 'ETH',
    onchainIdentifier: '0xbbbbca6a901c926f240b89eacb641d8aec7aeafd'
  },
  {
    assetType: 'LRDS',
    decimals: 18,
    name: 'BLOCKLORDS',
    networkId: 'ETH',
    onchainIdentifier: '0xd0a6053f087e87a25dc60701ba6e663b1a548e85'
  },
  {
    assetType: 'LSETH',
    decimals: 18,
    name: 'Liquid Staked ETH',
    networkId: 'ETH',
    onchainIdentifier: '0x8c1bed5b9a0928467c9b1341da1d7bd5e10b6549'
  },
  {
    assetType: 'LSETHHOL',
    decimals: 18,
    name: 'Liquid Staked ETH (Holesky Network)',
    networkId: 'ETHHOL',
    onchainIdentifier: '0x1d8b30cc38dba8abce1ac29ea27d9cfd05379a09'
  },
  {
    assetType: 'LTC',
    decimals: 8,
    name: 'Litecoin',
    networkId: 'LTC'
  },
  {
    assetType: 'M',
    decimals: 6,
    name: 'M by M^0',
    networkId: 'ETH',
    onchainIdentifier: '0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b'
  },
  {
    assetType: 'MAGIC',
    decimals: 18,
    name: 'MAGIC',
    networkId: 'ETH',
    onchainIdentifier: '0xb0c7a3ba49c7a6eaba6cd4a96c55a1391070ac9a'
  },
  {
    assetType: 'MANA',
    decimals: 18,
    name: 'Decentraland',
    networkId: 'ETH',
    onchainIdentifier: '0x0f5d2fb29fb7d3cfee444a200298f468908cc942'
  },
  {
    assetType: 'MASK',
    decimals: 18,
    name: 'Mask Network',
    networkId: 'ETH',
    onchainIdentifier: '0x69af81e73a73b40adf4f3d4223cd9b1ece623074'
  },
  {
    assetType: 'MATIC',
    decimals: 18,
    name: 'Matic Token',
    networkId: 'ETH',
    onchainIdentifier: '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0'
  },
  {
    assetType: 'MATICX',
    decimals: 18,
    name: 'Liquid Staking Matic',
    networkId: 'ETH',
    onchainIdentifier: '0xf03a7eb46d01d9ecaa104558c732cf82f6b6b645'
  },
  {
    assetType: 'MAV',
    decimals: 18,
    name: 'Maverick Token',
    networkId: 'ETH',
    onchainIdentifier: '0x7448c7456a97769f6cd04f1e83a4a23ccdc46abd'
  },
  {
    assetType: 'MAYC',
    decimals: 18,
    name: 'Mutant Ape Yacht Club',
    networkId: 'ETH',
    onchainIdentifier: '0x60e4d786628fea6478f785a6d7e704777c86a7c6'
  },
  {
    assetType: 'MIR',
    decimals: 18,
    name: 'Mirror Protocol',
    networkId: 'ETH',
    onchainIdentifier: '0x09a3ecafa817268f77be1283176b946c4ff2e608'
  },
  {
    assetType: 'MKR',
    decimals: 18,
    name: 'Maker',
    networkId: 'ETH',
    onchainIdentifier: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2'
  },
  {
    assetType: 'MLBCB',
    decimals: 18,
    name: 'LucidSight-MLB-NFT',
    networkId: 'ETH',
    onchainIdentifier: '0x8c9b261faef3b3c2e64ab5e58e04615f8c788099'
  },
  {
    assetType: 'MNT',
    decimals: 18,
    name: 'Mantle',
    networkId: 'ETH',
    onchainIdentifier: '0x3c3a81e81dc49a522a592e7622a7e711c06bf354'
  },
  {
    assetType: 'MOG',
    decimals: 18,
    name: 'Mog Coin',
    networkId: 'ETH',
    onchainIdentifier: '0xaaee1a9723aadb7afa2810263653a34ba2c21c7a'
  },
  {
    assetType: 'MOONBIRD',
    decimals: 18,
    name: 'Moonbirds',
    networkId: 'ETH',
    onchainIdentifier: '0x23581767a106ae21c074b2276d25e5c3e136a68b'
  },
  {
    assetType: 'MORPHO',
    decimals: 18,
    name: 'Morpho Token',
    networkId: 'ETH',
    onchainIdentifier: '0x9994e35db50125e0df82e4c2dde62496ce330999'
  },
  {
    assetType: 'MOVE',
    decimals: 8,
    name: 'Movement',
    networkId: 'ETH',
    onchainIdentifier: '0x3073f7aaa4db83f95e9fff17424f71d4751a3073'
  },
  {
    assetType: 'MPL',
    decimals: 18,
    name: 'Maple',
    networkId: 'ETH',
    onchainIdentifier: '0x33349b282065b0284d756f0577fb39c158f935e6'
  },
  {
    assetType: 'MPOND',
    decimals: 18,
    name: 'MPond',
    networkId: 'ETH',
    onchainIdentifier: '0x1c77d15857646687005dbbafff5873f4495a9731'
  },
  {
    assetType: 'MYC',
    decimals: 18,
    name: 'Mycelium',
    networkId: 'ETH',
    onchainIdentifier: '0x4b13006980acb09645131b91d259eaa111eaf5ba'
  },
  {
    assetType: 'MYTH',
    decimals: 18,
    name: 'Mythos',
    networkId: 'ETH',
    onchainIdentifier: '0xba41ddf06b7ffd89d1267b5a93bfef2424eb2003'
  },
  {
    assetType: 'NEXT',
    decimals: 18,
    name: 'Connext',
    networkId: 'ETH',
    onchainIdentifier: '0xfe67a4450907459c3e1fff623aa927dd4e28c67a'
  },
  {
    assetType: 'NFTX',
    decimals: 18,
    name: 'NFTX',
    networkId: 'ETH',
    onchainIdentifier: '0x87d73e916d7057945c9bcd8cdd94e42a6f47f776'
  },
  {
    assetType: 'NIGHT_APTOS',
    decimals: 8,
    name: 'Midnight Evergreen on Aptos',
    networkId: 'APT'
  },
  {
    assetType: 'NII',
    decimals: 15,
    name: 'Nahmii',
    networkId: 'ETH',
    onchainIdentifier: '0x7c8155909cd385f120a56ef90728dd50f9ccbe52'
  },
  {
    assetType: 'NMR',
    decimals: 18,
    name: 'Numeraire',
    networkId: 'ETH',
    onchainIdentifier: '0x1776e1f26f98b1a5df9cd347953a26dd3cb46671'
  },
  {
    assetType: 'NMT',
    decimals: 18,
    name: 'NetMind Token',
    networkId: 'ETH',
    onchainIdentifier: '0x03aa6298f1370642642415edc0db8b957783e8d6'
  },
  {
    assetType: 'NOTE',
    decimals: 8,
    name: 'Notional',
    networkId: 'ETH',
    onchainIdentifier: '0xcfeaead4947f0705a14ec42ac3d44129e1ef3ed5'
  },
  {
    assetType: 'NOUN',
    decimals: 18,
    name: 'Nouns',
    networkId: 'ETH',
    onchainIdentifier: '0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03'
  },
  {
    assetType: 'NSTR',
    decimals: 18,
    name: 'Nostra',
    networkId: 'ETH',
    onchainIdentifier: '0x610dbd98a28ebba525e9926b6aaf88f9159edbfd'
  },
  {
    assetType: 'NTRN',
    decimals: 6,
    name: 'Neutron',
    networkId: 'NTRN'
  },
  {
    assetType: 'NXM',
    decimals: 18,
    name: 'NXM',
    networkId: 'ETH',
    onchainIdentifier: '0xd7c49cee7e9188cca6ad8ff264c1da2e69d4cf3b'
  },
  {
    assetType: 'NYM',
    decimals: 6,
    name: 'Nym',
    networkId: 'ETH',
    onchainIdentifier: '0x525a8f6f3ba4752868cde25164382bfbae3990e1'
  },
  {
    assetType: 'OBOL',
    decimals: 18,
    name: 'Obol Network Token',
    networkId: 'ETH',
    onchainIdentifier: '0x0b010000b7624eb9b3dfbc279673c76e9d29d5f7'
  },
  {
    assetType: 'OM',
    decimals: 18,
    name: 'MANTRA DAO',
    networkId: 'ETH',
    onchainIdentifier: '0x3593d125a4f7849a1b059e64f4517a86dd60c95d'
  },
  {
    assetType: 'OMG',
    decimals: 18,
    name: 'OMG Network',
    networkId: 'ETH',
    onchainIdentifier: '0xd26114cd6ee289accf82350c8d8487fedb8a0c07'
  },
  {
    assetType: 'OM_MANTRA',
    decimals: 6,
    name: 'OM Mantra',
    networkId: 'OM_MANTRA'
  },
  {
    assetType: 'OM_MANTRA_T',
    decimals: 6,
    name: 'OM Mantra Testnet',
    networkId: 'OM_MANTRA_T'
  },
  {
    assetType: 'ONDO',
    decimals: 18,
    name: 'Ondo',
    networkId: 'ETH',
    onchainIdentifier: '0xfaba6f8e4a5e8ab82f62fe7c39859fa577269be3'
  },
  {
    assetType: 'OP',
    decimals: 18,
    name: 'Oasis',
    networkId: 'ETH',
    onchainIdentifier: '0x898157afb3e158cc835d19b9ecd37c69bf460f8c'
  },
  {
    assetType: 'ORDER',
    decimals: 18,
    name: 'Orderly Network',
    networkId: 'ETH',
    onchainIdentifier: '0xabd4c63d2616a5201454168269031355f4764337'
  },
  {
    assetType: 'OSMO',
    decimals: 6,
    name: 'Osmosis',
    networkId: 'OSMO'
  },
  {
    assetType: 'OTHR',
    decimals: 18,
    name: 'Otherdeed',
    networkId: 'ETH',
    onchainIdentifier: '0x34d85c9cdeb23fa97cb08333b511ac86e1c4e258'
  },
  {
    assetType: 'OUSG',
    decimals: 18,
    name: 'Ondo Short-Term U.S. Government Bond Fund',
    networkId: 'ETH',
    onchainIdentifier: '0x1b19c19393e2d034d8ff31ff34c81252fcbbee92'
  },
  {
    assetType: 'OXT',
    decimals: 18,
    name: 'Orchid',
    networkId: 'ETH',
    onchainIdentifier: '0x4575f41308ec1483f3d399aa9a2826d74da13deb'
  },
  {
    assetType: 'PARTY',
    decimals: 18,
    name: 'PartyDAO',
    networkId: 'ETH',
    onchainIdentifier: '0x381b31b3905b6d1175da9d216a7581023f1d6145'
  },
  {
    assetType: 'PATH',
    decimals: 18,
    name: 'PathDao',
    networkId: 'ETH',
    onchainIdentifier: '0x2a2550e0a75acec6d811ae3930732f7f3ad67588'
  },
  {
    assetType: 'PAXG',
    decimals: 18,
    name: 'Paxos Gold',
    networkId: 'ETH',
    onchainIdentifier: '0x45804880de22913dafe09f4980848ece6ecbaf78'
  },
  {
    assetType: 'PDT',
    decimals: 18,
    name: 'Paragons DAO',
    networkId: 'ETH',
    onchainIdentifier: '0x375abb85c329753b1ba849a601438ae77eec9893'
  },
  {
    assetType: 'PEEPS',
    decimals: 18,
    name: 'PleasrDAO',
    networkId: 'ETH',
    onchainIdentifier: '0xba962a81f78837751be8a177378d582f337084e6'
  },
  {
    assetType: 'PENDLE',
    decimals: 18,
    name: 'Pendle',
    networkId: 'ETH',
    onchainIdentifier: '0x808507121b80c02388fad14726482e061b8da827'
  },
  {
    assetType: 'PEPE',
    decimals: 18,
    name: 'PEPE',
    networkId: 'ETH',
    onchainIdentifier: '0x6982508145454ce325ddbe47a25d4ec3d2311933'
  },
  {
    assetType: 'PERP',
    decimals: 18,
    name: 'Perpetual',
    networkId: 'ETH',
    onchainIdentifier: '0xbc396689893d065f41bc2c6ecbee5e0085233447'
  },
  {
    assetType: 'PIRATE',
    decimals: 18,
    name: 'Pirate Nation Token',
    networkId: 'ETH',
    onchainIdentifier: '0x7613c48e0cd50e42dd9bf0f6c235063145f6f8dc'
  },
  {
    assetType: 'PIXEL',
    decimals: 18,
    name: 'PIXEL',
    networkId: 'ETH',
    onchainIdentifier: '0x3429d03c6f7521aec737a0bbf2e5ddcef2c3ae31'
  },
  {
    assetType: 'PIXFI',
    decimals: 18,
    name: 'Pixelverse',
    networkId: 'ETH',
    onchainIdentifier: '0xd795eb12034c2b77d787a22292c26fab5f5c70aa'
  },
  {
    assetType: 'POL',
    decimals: 18,
    name: 'Polygon Ecosystem Token',
    networkId: 'ETH',
    onchainIdentifier: '0x455e53cbb86018ac2b8092fdcd39d8444affc3f6'
  },
  {
    assetType: 'POLY',
    decimals: 18,
    name: 'Polymath',
    networkId: 'ETH',
    onchainIdentifier: '0x9992ec3cf6a55b00978cddf2b27bc6882d88d1ec'
  },
  {
    assetType: 'POL_POLYGON',
    decimals: 18,
    name: 'Polygon Ecosystem Token on Polygon',
    networkId: 'POLYGON'
  },
  {
    assetType: 'POND',
    decimals: 18,
    name: 'Pond',
    networkId: 'ETH',
    onchainIdentifier: '0x57b946008913b82e4df85f501cbaed910e58d26c'
  },
  {
    assetType: 'PORTAL',
    decimals: 18,
    name: 'PORTAL',
    networkId: 'ETH',
    onchainIdentifier: '0x1bbe973bef3a977fc51cbed703e8ffdefe001fed'
  },
  {
    assetType: 'POWR',
    decimals: 6,
    name: 'PowerLedger',
    networkId: 'ETH',
    onchainIdentifier: '0x595832f8fc6bf59c85c527fec3740a1b7a361269'
  },
  {
    assetType: 'PRIME',
    decimals: 18,
    name: 'Prime',
    networkId: 'ETH',
    onchainIdentifier: '0xb23d80f5fefcddaa212212f028021b41ded428cf'
  },
  {
    assetType: 'PRINTS',
    decimals: 18,
    name: 'FingerprintsDAO',
    networkId: 'ETH',
    onchainIdentifier: '0x4dd28568d05f09b02220b09c2cb307bfd837cb95'
  },
  {
    assetType: 'PSP',
    decimals: 18,
    name: 'ParaSwap',
    networkId: 'ETH',
    onchainIdentifier: '0xcafe001067cdef266afb7eb5a286dcfd277f3de5'
  },
  {
    assetType: 'PSTAKE',
    decimals: 18,
    name: 'pSTAKE Finance',
    networkId: 'ETH',
    onchainIdentifier: '0xfb5c6815ca3ac72ce9f5006869ae67f18bf77006'
  },
  {
    assetType: 'PUFFER',
    decimals: 18,
    name: 'PUFFER',
    networkId: 'ETH',
    onchainIdentifier: '0x4d1c297d39c5c1277964d0e3f8aa901493664530'
  },
  {
    assetType: 'PYUSD',
    decimals: 6,
    name: 'PayPal USD',
    networkId: 'ETH',
    onchainIdentifier: '0x6c3ea9036406852006290770bedfcaba0e23a0e8'
  },
  {
    assetType: 'QF',
    decimals: 18,
    name: 'quasar fighter',
    networkId: 'ETH',
    onchainIdentifier: '0x9c9560a06de70df3d8e97c7364f7508ef92b0f83'
  },
  {
    assetType: 'QNT',
    decimals: 18,
    name: 'Quant',
    networkId: 'ETH',
    onchainIdentifier: '0x4a220e6096b25eadb88358cb44068a3248254675'
  },
  {
    assetType: 'RAD',
    decimals: 18,
    name: 'Radicle',
    networkId: 'ETH',
    onchainIdentifier: '0x31c8eacbffdd875c74b94b077895bd78cf1e64a3'
  },
  {
    assetType: 'RARE',
    decimals: 18,
    name: 'SuperRare',
    networkId: 'ETH',
    onchainIdentifier: '0xba5bde662c17e2adff1075610382b9b691296350'
  },
  {
    assetType: 'RARI',
    decimals: 18,
    name: 'Rarible',
    networkId: 'ETH',
    onchainIdentifier: '0xfca59cd816ab1ead66534d82bc21e7515ce441cf'
  },
  {
    assetType: 'RBN',
    decimals: 18,
    name: 'Ribbon Finance',
    networkId: 'ETH',
    onchainIdentifier: '0x6123b0049f904d730db3c36a31167d9d4121fa6b'
  },
  {
    assetType: 'RCOIN',
    decimals: 8,
    name: 'ArCoin',
    networkId: 'ETH',
    onchainIdentifier: '0x252739487c1fa66eaeae7ced41d6358ab2a6bca9'
  },
  {
    assetType: 'REN',
    decimals: 18,
    name: 'Ren',
    networkId: 'ETH',
    onchainIdentifier: '0x408e41876cccdc0f92210600ef50372656052a38'
  },
  {
    assetType: 'RENBTC',
    decimals: 8,
    name: 'renBTC',
    networkId: 'ETH',
    onchainIdentifier: '0xeb4c2781e4eba804ce9a9803c67d0893436bb27d'
  },
  {
    assetType: 'REP',
    decimals: 18,
    name: 'Augur',
    networkId: 'ETH',
    onchainIdentifier: '0x221657776846890989a759ba2973e427dff5c9bb'
  },
  {
    assetType: 'REZ',
    decimals: 18,
    name: 'Renzo',
    networkId: 'ETH',
    onchainIdentifier: '0x3b50805453023a91a8bf641e279401a0b23fa6f9'
  },
  {
    assetType: 'RLS',
    decimals: 18,
    name: 'Rayls',
    networkId: 'ETH',
    onchainIdentifier: '0xb5f7b021a78f470d31d762c1dda05ea549904fbd'
  },
  {
    assetType: 'RLY',
    decimals: 18,
    name: 'Rally',
    networkId: 'ETH',
    onchainIdentifier: '0xf1f955016ecbcd7321c7266bccfb96c68ea5e49b'
  },
  {
    assetType: 'RMO',
    decimals: 6,
    name: 'Rarimo',
    networkId: 'RMO'
  },
  {
    assetType: 'RN',
    decimals: 18,
    name: 'Rio Network',
    networkId: 'ETH',
    onchainIdentifier: '0x3c61297e71e9bb04b9fbfead72a6d3c70e4f1e4a'
  },
  {
    assetType: 'RNDR',
    decimals: 18,
    name: 'Render Token',
    networkId: 'ETH',
    onchainIdentifier: '0x6de037ef9ad2725eb40118bb1702ebb27e4aeb24'
  },
  {
    assetType: 'ROSE',
    decimals: 9,
    name: 'Oasis Network',
    networkId: 'OAC'
  },
  {
    assetType: 'RPL',
    decimals: 18,
    name: 'Rocket Pool Protocol',
    networkId: 'ETH',
    onchainIdentifier: '0xd33526068d116ce69f19a9ee46f0bd304f21a51f'
  },
  {
    assetType: 'RSC',
    decimals: 18,
    name: 'ResearchCoin',
    networkId: 'ETH',
    onchainIdentifier: '0xd101dcc414f310268c37eeb4cd376ccfa507f571'
  },
  {
    assetType: 'RSETH',
    decimals: 18,
    name: 'rsETH',
    networkId: 'ETH',
    onchainIdentifier: '0xa1290d69c65a6fe4df752f95823fae25cb99e5a7'
  },
  {
    assetType: 'RSR',
    decimals: 18,
    name: 'Reserve Rights',
    networkId: 'ETH',
    onchainIdentifier: '0x320623b8e4ff03373931769a31fc52a4e78b5d70'
  },
  {
    assetType: 'RST',
    decimals: 18,
    name: 'Realio Security Token',
    networkId: 'ETH',
    onchainIdentifier: '0x1a76bffd6d1fc1660e1d0e0552fde51ddbb120cf'
  },
  {
    assetType: 'RSV',
    decimals: 18,
    name: 'Reserve',
    networkId: 'ETH',
    onchainIdentifier: '0x196f4727526ea7fb1e17b2071b3d8eaa38486988'
  },
  {
    assetType: 'RVR',
    decimals: 18,
    name: 'River',
    networkId: 'ETH',
    onchainIdentifier: '0x53319181e003e7f86fb79f794649a2ab680db244'
  },
  {
    assetType: 'SAFE',
    decimals: 18,
    name: 'Safe Token',
    networkId: 'ETH',
    onchainIdentifier: '0x5afe3855358e112b5647b952709e6165e1c1eeee'
  },
  {
    assetType: 'SALD',
    decimals: 18,
    name: 'Salad',
    networkId: 'ETH',
    onchainIdentifier: '0x5582a479f0c403e207d2578963ccef5d03ba636f'
  },
  {
    assetType: 'SAND',
    decimals: 18,
    name: 'Sandbox',
    networkId: 'ETH',
    onchainIdentifier: '0x3845badade8e6dff049820680d1f14bd3903a5d0'
  },
  {
    assetType: 'SBTC',
    decimals: 18,
    name: 'Synth sBTC',
    networkId: 'ETH',
    onchainIdentifier: '0xfe18be6b3bd88a2d2a7f928d00292e7a9963cfc6'
  },
  {
    assetType: 'SD',
    decimals: 18,
    name: 'Stader',
    networkId: 'ETH',
    onchainIdentifier: '0x30d20208d987713f46dfd34ef128bb16c404d10f'
  },
  {
    assetType: 'SDL',
    decimals: 18,
    name: 'Saddle',
    networkId: 'ETH',
    onchainIdentifier: '0xf1dc500fde233a4055e25e5bbf516372bc4f6871'
  },
  {
    assetType: 'SEI',
    decimals: 6,
    name: 'Sei',
    networkId: 'SEI'
  },
  {
    assetType: 'SEI_T',
    decimals: 6,
    name: 'Sei Testnet',
    networkId: 'SEI_T'
  },
  {
    assetType: 'SFRXETHHOL',
    decimals: 18,
    name: 'Staked Frax Ether (Holesky Network)',
    networkId: 'ETHHOL',
    onchainIdentifier: '0xa63f56985f9c7f3bc9ffc5685535649e0c1a55f3'
  },
  {
    assetType: 'SHIB',
    decimals: 18,
    name: 'SHIBA INU',
    networkId: 'ETH',
    onchainIdentifier: '0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce'
  },
  {
    assetType: 'SHRAP',
    decimals: 18,
    name: 'SHRAPToken',
    networkId: 'ETH',
    onchainIdentifier: '0x31e4efe290973ebe91b3a875a7994f650942d28f'
  },
  {
    assetType: 'SIPHER',
    decimals: 18,
    name: 'Sipher Token',
    networkId: 'ETH',
    onchainIdentifier: '0x9f52c8ecbee10e00d9faaac5ee9ba0ff6550f511'
  },
  {
    assetType: 'SKY',
    decimals: 18,
    name: 'SKY Governance Token',
    networkId: 'ETH',
    onchainIdentifier: '0x56072c95faa701256059aa122697b133aded9279'
  },
  {
    assetType: 'SNX',
    decimals: 18,
    name: 'Synthetix',
    networkId: 'ETH',
    onchainIdentifier: '0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f'
  },
  {
    assetType: 'SOL_TD',
    decimals: 9,
    name: 'Solana Devnet',
    networkId: 'SOL_TD'
  },
  {
    assetType: 'SPEC',
    decimals: 18,
    name: 'Spectral Token',
    networkId: 'ETH',
    onchainIdentifier: '0xadf7c35560035944e805d98ff17d58cde2449389'
  },
  {
    assetType: 'SRM',
    decimals: 6,
    name: 'Serum',
    networkId: 'ETH',
    onchainIdentifier: '0x476c5e26a75bd202a9683ffd34359c0cc15be0ff'
  },
  {
    assetType: 'SSV',
    decimals: 18,
    name: 'ssv.network',
    networkId: 'ETH',
    onchainIdentifier: '0x9d65ff81a3c488d585bbfb0bfe3c7707c7917f54'
  },
  {
    assetType: 'STG',
    decimals: 18,
    name: 'Stargate Finance',
    networkId: 'ETH',
    onchainIdentifier: '0xaf5191b0de278c7286d6c7cc6ab6bb8a73ba2cd6'
  },
  {
    assetType: 'STKAAVE',
    decimals: 18,
    name: 'Staked AAVE',
    networkId: 'ETH',
    onchainIdentifier: '0x4da27a545c0c5b758a6ba100e3a049001de870f5'
  },
  {
    assetType: 'STORJ',
    decimals: 8,
    name: 'StorjToken',
    networkId: 'ETH',
    onchainIdentifier: '0xb64ef51c888972c908cfacf59b47c1afbc0ab8ac'
  },
  {
    assetType: 'STRD',
    decimals: 6,
    name: 'Stride',
    networkId: 'STRD'
  },
  {
    assetType: 'STRDY',
    decimals: 18,
    name: 'Sturdy Token',
    networkId: 'ETH',
    onchainIdentifier: '0xaeb3607ec434454ceb308f5cd540875efb54309a'
  },
  {
    assetType: 'STRK',
    decimals: 18,
    name: 'StarkNet Token',
    networkId: 'ETH',
    onchainIdentifier: '0xca14007eff0db1f8135f4c25b34de49ab0d42766'
  },
  {
    assetType: 'STRK_STARKNET',
    decimals: 18,
    name: 'Starknet',
    networkId: 'STARK_STARKNET'
  },
  {
    assetType: 'STRK_STARKNET_T',
    decimals: 18,
    name: 'Starknet Testnet',
    networkId: 'STRK_STARKNET_T'
  },
  {
    assetType: 'STRP',
    decimals: 18,
    name: 'Strips',
    networkId: 'ETH',
    onchainIdentifier: '0x97872eafd79940c7b24f7bcc1eadb1457347adc9'
  },
  {
    assetType: 'SUDO',
    decimals: 18,
    name: 'SUDO GOVERNANCE TOKEN',
    networkId: 'ETH',
    onchainIdentifier: '0x3446dd70b2d52a6bf4a5a192d9b0a161295ab7f9'
  },
  {
    assetType: 'SUI_T',
    decimals: 9,
    name: 'Sui Testnet',
    networkId: 'SUI_T'
  },
  {
    assetType: 'SUSDCSEP',
    decimals: 6,
    name: 'Sec USD Coin (Sepolia Network)',
    networkId: 'ETHSEP',
    onchainIdentifier: '0x6612394ea7cfa53ed6522a5ff0fad091a89aaef6'
  },
  {
    assetType: 'SUSDE',
    decimals: 18,
    name: 'Staked USDe',
    networkId: 'ETH',
    onchainIdentifier: '0x9d39a5de30e57443bff2a8307a4256c8797a3497'
  },
  {
    assetType: 'SUSHI',
    decimals: 18,
    name: 'SushiSwap',
    networkId: 'ETH',
    onchainIdentifier: '0x6b3595068778dd592e39a122f4f5a5cf09c90fe2'
  },
  {
    assetType: 'SWISE',
    decimals: 18,
    name: 'StakeWise',
    networkId: 'ETH',
    onchainIdentifier: '0x48c3399719b582dd63eb5aadf12a40b4c3f52fa2'
  },
  {
    assetType: 'SYN',
    decimals: 18,
    name: 'Synapse',
    networkId: 'ETH',
    onchainIdentifier: '0x0f2d719407fdbeff09d87557abb7232601fd9f29'
  },
  {
    assetType: 'T',
    decimals: 18,
    name: 'Threshold Network Token',
    networkId: 'ETH',
    onchainIdentifier: '0xcdf7028ceab81fa0c6971208e83fa7872994bee5'
  },
  {
    assetType: 'TAIKO',
    decimals: 18,
    name: 'Taiko Token',
    networkId: 'ETH',
    onchainIdentifier: '0x10dea67478c5f8c5e2d90e5e9b26dbe60c54d800'
  },
  {
    assetType: 'TBILL',
    decimals: 6,
    name: 'OpenEden T-Bills',
    networkId: 'ETH',
    onchainIdentifier: '0xdd50c053c096cb04a3e3362e2b622529ec5f2e8a'
  },
  {
    assetType: 'TBTC',
    decimals: 18,
    name: 'tBTC v2',
    networkId: 'ETH',
    onchainIdentifier: '0x18084fba666a33d37592fa2633fd49a74dd93a88'
  },
  {
    assetType: 'TEN',
    decimals: 18,
    name: 'Tokenomy',
    networkId: 'ETH',
    onchainIdentifier: '0xdd16ec0f66e54d453e6756713e533355989040e4'
  },
  {
    assetType: 'THOU',
    decimals: 18,
    name: 'Thousands',
    networkId: 'ETH',
    onchainIdentifier: '0x370e83ca976c1deb98803fbccf64c6f0948705ea'
  },
  {
    assetType: 'TIA',
    decimals: 6,
    name: 'Celestia',
    networkId: 'TIA'
  },
  {
    assetType: 'TLC',
    decimals: 18,
    name: 'Liquid Collective',
    networkId: 'ETH',
    onchainIdentifier: '0xb5fe6946836d687848b5abd42dabf531d5819632'
  },
  {
    assetType: 'TLM',
    decimals: 4,
    name: 'Alien Worlds Trilium',
    networkId: 'ETH',
    onchainIdentifier: '0x888888848b652b3e3a0f34c96e00eec0f3a23f72'
  },
  {
    assetType: 'TOKE',
    decimals: 18,
    name: 'Tokemak',
    networkId: 'ETH',
    onchainIdentifier: '0x2e9d63788249371f1dfc918a52f8d799f4a38c94'
  },
  {
    assetType: 'TRIBE',
    decimals: 18,
    name: 'TRIBE Governance',
    networkId: 'ETH',
    onchainIdentifier: '0xc7283b66eb1eb5fb86327f08e1b5816b0720212b'
  },
  {
    assetType: 'TRIBL',
    decimals: 18,
    name: 'Tribal Token',
    networkId: 'ETH',
    onchainIdentifier: '0x6988a804c74fd04f37da1ea4781cea68c9c00f86'
  },
  {
    assetType: 'TRU',
    decimals: 8,
    name: 'TrueFi',
    networkId: 'ETH',
    onchainIdentifier: '0x4c19596f5aaff459fa38b0f7ed92f11ae6543784'
  },
  {
    assetType: 'TUSD',
    decimals: 18,
    name: 'TrueUSD',
    networkId: 'ETH',
    onchainIdentifier: '0x0000000000085d4780b73119b644ae5ecd22b376'
  },
  {
    assetType: 'UMA',
    decimals: 18,
    name: 'UMA',
    networkId: 'ETH',
    onchainIdentifier: '0x04fa0d235c4abf4bcf4787af4cf447de572ef828'
  },
  {
    assetType: 'UNI',
    decimals: 18,
    name: 'Uniswap',
    networkId: 'ETH',
    onchainIdentifier: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984'
  },
  {
    assetType: 'UNIBOT',
    decimals: 18,
    name: 'Unibot',
    networkId: 'ETH',
    onchainIdentifier: '0xf819d9cb1c2a819fd991781a822de3ca8607c3c9'
  },
  {
    assetType: 'USCC',
    decimals: 6,
    name: 'Superstate Crypto Carry Fund',
    networkId: 'ETH',
    onchainIdentifier: '0x14d60e7fdc0d71d8611742720e4c50e7a974020c'
  },
  {
    assetType: 'USD',
    decimals: 2,
    name: 'US Dollars',
    networkId: 'USD'
  },
  {
    assetType: 'USDANCHOL',
    decimals: 6,
    name: 'USDAnchor (Holesky Network)',
    networkId: 'ETHHOL',
    onchainIdentifier: '0xfe246cff3dfed50e032904ac1fbd0da32de6873e'
  },
  {
    assetType: 'USDC',
    decimals: 6,
    name: 'USD Coin',
    networkId: 'ETH',
    onchainIdentifier: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
  },
  {
    assetType: 'USDCNOBLEDYDX',
    decimals: 6,
    name: 'USDC Noble dYdX',
    networkId: 'DYDX_CHAIN'
  },
  {
    assetType: 'USDE',
    decimals: 18,
    name: 'USDe',
    networkId: 'ETH',
    onchainIdentifier: '0x4c9edd5852cd905f086c759e8383e09bff1e68b3'
  },
  {
    assetType: 'USDG',
    decimals: 6,
    name: 'Global Dollar',
    networkId: 'ETH',
    onchainIdentifier: '0xe343167631d89b6ffc58b88d6b7fb0228795491d'
  },
  {
    assetType: 'USDP',
    decimals: 18,
    name: 'Pax Dollar',
    networkId: 'ETH',
    onchainIdentifier: '0x8e870d67f660d95d5be530380d0ec0bd388289e1'
  },
  {
    assetType: 'USDS',
    decimals: 18,
    name: 'USDS Stablecoin',
    networkId: 'ETH',
    onchainIdentifier: '0xdc035d45d973e3ec169d2276ddab16f1e407384f'
  },
  {
    assetType: 'USDT',
    decimals: 6,
    name: 'Tether',
    networkId: 'ETH',
    onchainIdentifier: '0xdac17f958d2ee523a2206206994597c13d831ec7'
  },
  {
    assetType: 'USDT_APTOS',
    decimals: 6,
    name: 'Tether USD on Aptos',
    networkId: 'APT'
  },
  {
    assetType: 'USDY',
    decimals: 18,
    name: 'Ondo U.S. Dollar Yield',
    networkId: 'ETH',
    onchainIdentifier: '0x96f6ef951840721adbf46ac996b59e0235cb985c'
  },
  {
    assetType: 'USDY_APTOS',
    decimals: 6,
    name: 'Ondo US Dollar Yield on Aptos',
    networkId: 'APT'
  },
  {
    assetType: 'USD_R',
    decimals: 2,
    name: 'US dollars test',
    networkId: 'USD_R'
  },
  {
    assetType: 'USTB',
    decimals: 6,
    name: 'Superstate Short Duration US Government Securities Fund',
    networkId: 'ETH',
    onchainIdentifier: '0x43415eb6ff9db7e26a15b704e7a3edce97d31c4e'
  },
  {
    assetType: 'USYC',
    decimals: 6,
    name: 'US Yield Coin',
    networkId: 'ETH',
    onchainIdentifier: '0x136471a34f6ef19fe571effc1ca711fdb8e49f2b'
  },
  {
    assetType: 'VANA_VANA',
    decimals: 18,
    name: 'Vana',
    networkId: 'VANA'
  },
  {
    assetType: 'VANA_VANA_MOKSHA_T',
    decimals: 18,
    name: 'VANA Token on Vana Moksha Testnet',
    networkId: 'VANA_MOKSHA_TESTNET'
  },
  {
    assetType: 'VFORT_POLYGON',
    decimals: 18,
    name: 'FORT Staking Vault',
    networkId: 'POLYGON',
    onchainIdentifier: '0xf22f690a41d22496496d4959acfff0f3bacc24f1'
  },
  {
    assetType: 'VIRTUAL',
    decimals: 18,
    name: 'Virtual Protocol',
    networkId: 'ETH',
    onchainIdentifier: '0x44ff8620b8ca30902395a7bd3f2407e1a091bf73'
  },
  {
    assetType: 'VITA',
    decimals: 18,
    name: 'VitaDAO Token',
    networkId: 'ETH',
    onchainIdentifier: '0x81f8f0bb1cb2a06649e51913a151f0e7ef6fa321'
  },
  {
    assetType: 'VRA',
    decimals: 18,
    name: 'VERA',
    networkId: 'ETH',
    onchainIdentifier: '0xf411903cbc70a74d22900a5de66a2dda66507255'
  },
  {
    assetType: 'W',
    decimals: 18,
    name: 'Wormhole Token',
    networkId: 'ETH',
    onchainIdentifier: '0xb0ffa8000886e57f86dd5264b9582b2ad87b2b91'
  },
  {
    assetType: 'WAXL',
    decimals: 6,
    name: 'Wrapped Axelar',
    networkId: 'ETH',
    onchainIdentifier: '0x467719ad09025fcc6cf6f8311755809d45a5e5f3'
  },
  {
    assetType: 'WBTC',
    decimals: 8,
    name: 'Wrapped Bitcoin',
    networkId: 'ETH',
    onchainIdentifier: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599'
  },
  {
    assetType: 'WCELO',
    decimals: 18,
    name: 'Wrapped Celo',
    networkId: 'ETH',
    onchainIdentifier: '0xe452e6ea2ddeb012e20db73bf5d3863a3ac8d77a'
  },
  {
    assetType: 'WCUSD',
    decimals: 18,
    name: 'Wrapped Celo Dollar',
    networkId: 'ETH',
    onchainIdentifier: '0xad3e3fc59dff318beceaab7d00eb4f68b1ecf195'
  },
  {
    assetType: 'WEETH',
    decimals: 18,
    name: 'Wrapped eETH',
    networkId: 'ETH',
    onchainIdentifier: '0xcd5fe23c85820f7b72d0926fc9b05b43e359b7ee'
  },
  {
    assetType: 'WETH',
    decimals: 18,
    name: 'Wrapped Ether',
    networkId: 'ETH',
    onchainIdentifier: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
  },
  {
    assetType: 'WETHDYDX',
    decimals: 18,
    name: 'Wrapped Ethereum DYDX',
    networkId: 'ETH',
    onchainIdentifier: '0x46b2deae6eff3011008ea27ea36b7c27255ddfa9'
  },
  {
    assetType: 'WEVMOS',
    decimals: 18,
    name: 'Wrapped Evmos',
    networkId: 'ETH',
    onchainIdentifier: '0x93581991f68dbae1ea105233b67f7fa0d6bdee7b'
  },
  {
    assetType: 'WEXIT',
    decimals: 8,
    name: 'Wrapped Exit',
    networkId: 'ETH',
    onchainIdentifier: '0xc12799bf6c139f269439675454267644d5c7aca3'
  },
  {
    assetType: 'WEXOD',
    decimals: 8,
    name: 'Wrapped EXOD',
    networkId: 'ETH',
    onchainIdentifier: '0x10ef8b469f47a3167505e2f46b57aa3c708ec3c8'
  },
  {
    assetType: 'WFIL',
    decimals: 18,
    name: 'Wrapped Filecoin',
    networkId: 'ETH',
    onchainIdentifier: '0x6e1a19f235be7ed8e3369ef73b196c07257494de'
  },
  {
    assetType: 'WFLOW',
    decimals: 18,
    name: 'Wrapped Flow',
    networkId: 'ETH',
    onchainIdentifier: '0x5c147e74d63b1d31aa3fd78eb229b65161983b2b'
  },
  {
    assetType: 'WLD',
    decimals: 18,
    name: 'Worldcoin',
    networkId: 'ETH',
    onchainIdentifier: '0x163f8c2467924be0ae7b5347228cabf260318753'
  },
  {
    assetType: 'WM',
    decimals: 6,
    name: 'WrappedM by M^0',
    networkId: 'ETH',
    onchainIdentifier: '0x437cc33344a0b27a429f795ff6b469c72698b291'
  },
  {
    assetType: 'WNXM',
    decimals: 18,
    name: 'Wrapped NXM',
    networkId: 'ETH',
    onchainIdentifier: '0x0d438f3b5175bebc262bf23753c1e53d03432bde'
  },
  {
    assetType: 'WOO',
    decimals: 18,
    name: 'Woo Network',
    networkId: 'ETH',
    onchainIdentifier: '0x4691937a7508860f876c9c0a2a617e7d9e945d4b'
  },
  {
    assetType: 'WOW',
    decimals: 18,
    name: 'World of Women',
    networkId: 'ETH',
    onchainIdentifier: '0xe785e82358879f061bc3dcac6f0444462d4b5330'
  },
  {
    assetType: 'WPUNKS',
    decimals: 18,
    name: 'Wrapped CryptoPunks',
    networkId: 'ETH',
    onchainIdentifier: '0xb7f7f6c52f2e2fdb1963eab30438024864c313f6'
  },
  {
    assetType: 'WQUIL',
    decimals: 8,
    name: 'Wrapped QUIL',
    networkId: 'ETH',
    onchainIdentifier: '0x8143182a775c54578c8b7b3ef77982498866945d'
  },
  {
    assetType: 'WSTETH',
    decimals: 18,
    name: 'Wrapped Staked ETH',
    networkId: 'ETH',
    onchainIdentifier: '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0'
  },
  {
    assetType: 'WSTR',
    decimals: 18,
    name: 'WrappedStar',
    networkId: 'ETH',
    onchainIdentifier: '0xf0dc76c22139ab22618ddfb498be1283254612b1'
  },
  {
    assetType: 'WTAO',
    decimals: 9,
    name: 'Wrapped TAO',
    networkId: 'ETH',
    onchainIdentifier: '0x77e06c9eccf2e797fd462a92b6d7642ef85b0a44'
  },
  {
    assetType: 'WUSDM',
    decimals: 18,
    name: 'Wrapped Mountain Protocol USD',
    networkId: 'ETH',
    onchainIdentifier: '0x57f5e098cad7a3d1eed53991d4d66c45c9af7812'
  },
  {
    assetType: 'WZEC',
    decimals: 18,
    name: 'Wrapped Zcash',
    networkId: 'ETH',
    onchainIdentifier: '0x4a64515e5e1d1073e83f30cb97bed20400b66e10'
  },
  {
    assetType: 'XAV',
    decimals: 18,
    name: 'Xave Token',
    networkId: 'ETH',
    onchainIdentifier: '0x40370aed88933021e20cf7c4d67e00417cda2202'
  },
  {
    assetType: 'XJ_ZKSYNC_T',
    decimals: 18,
    name: 'xjToken',
    networkId: 'ZKSYNC_SEPOLIA',
    onchainIdentifier: '0x69e5dc39e2bcb1c17053d2a4ee7caeaac5d36f96'
  },
  {
    assetType: 'XMPL',
    decimals: 18,
    name: 'XMPL',
    networkId: 'ETH',
    onchainIdentifier: '0x4937a209d4cdbd3ecd48857277cfd4da4d82914c'
  },
  {
    assetType: 'XRP',
    decimals: 6,
    name: 'Ripple',
    networkId: 'XRP'
  },
  {
    assetType: 'XSUSHI',
    decimals: 18,
    name: 'SushiBar',
    networkId: 'ETH',
    onchainIdentifier: '0x8798249c2e607446efb7ad49ec89dd1865ff4272'
  },
  {
    assetType: 'XYLB',
    decimals: 0,
    name: 'XY Labs',
    networkId: 'ETH',
    onchainIdentifier: '0x00d61c23ba36001603f1fcb4981e2d13ef9f0923'
  },
  {
    assetType: 'YFI',
    decimals: 18,
    name: 'yearn.finance',
    networkId: 'ETH',
    onchainIdentifier: '0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e'
  },
  {
    assetType: 'YGG',
    decimals: 18,
    name: 'Yield Guild Games',
    networkId: 'ETH',
    onchainIdentifier: '0x25f8087ead173b73d6e8b84329989a8eea16cf73'
  },
  {
    assetType: 'ZBU',
    decimals: 18,
    name: 'ZEEBU',
    networkId: 'ETH',
    onchainIdentifier: '0x8f9b4525681f3ea6e43b8e0a57bfff86c0a1dd2e'
  },
  {
    assetType: 'ZENT',
    decimals: 18,
    name: 'Zentry',
    networkId: 'ETH',
    onchainIdentifier: '0xdbb7a34bf10169d6d2d0d02a6cbb436cf4381bfa'
  },
  {
    assetType: 'ZERO',
    decimals: 6,
    name: 'Zero by M^0',
    networkId: 'ETH',
    onchainIdentifier: '0x988567fe094570cce1ffda29d1f2d842b70492be'
  },
  {
    assetType: 'ZRO',
    decimals: 18,
    name: 'LayerZero',
    networkId: 'ETH',
    onchainIdentifier: '0x6985884c4392d348587b19cb9eaaf157f13271cd'
  },
  {
    assetType: 'ZRX',
    decimals: 18,
    name: '0x',
    networkId: 'ETH',
    onchainIdentifier: '0xe41d2489571d322189246dafa5ebde1f4699f498'
  },
  {
    assetType: 'cEUR_TB',
    decimals: 18,
    name: 'Celo EUR Testnet (baklava)',
    networkId: 'CELO_TB',
    onchainIdentifier: '0xf9ece301247ad2ce21894941830a2470f4e774ca'
  },
  {
    assetType: 'cUSD_TB',
    decimals: 18,
    name: 'Celo USD Testnet (baklava)',
    networkId: 'CELO_TB',
    onchainIdentifier: '0x62492a644a588fd904270bed06ad52b9abfea1ae'
  }
]

@Injectable()
export class AnchorageAssetService {
  constructor(
    private readonly networkRepository: NetworkRepository,
    private readonly logger: LoggerService
  ) {}

  private mapAnchorageAsset(network: Network, anchorageAsset: AnchorageAsset): Asset {
    return {
      decimals: anchorageAsset.decimals,
      externalId: anchorageAsset.assetType,
      name: anchorageAsset.name,
      networkId: network.networkId,
      onchainId: anchorageAsset.onchainIdentifier
    }
  }

  async findByExternalId(externalId: string): Promise<Asset | null> {
    for (const anchorageAsset of ANCHORAGE_ASSETS) {
      if (anchorageAsset.assetType === externalId) {
        const network = await this.networkRepository.findByExternalId(Provider.ANCHORAGE, anchorageAsset.networkId)

        if (network) {
          return this.mapAnchorageAsset(network, anchorageAsset)
        }
      }
    }

    return null
  }

  async findAll(): Promise<Asset[]> {
    const networkExternalIdIndex = await this.networkRepository.buildProviderExternalIdIndex(Provider.ANCHORAGE)
    const assets: Asset[] = []

    for (const anchorageAsset of ANCHORAGE_ASSETS) {
      const network = networkExternalIdIndex.get(anchorageAsset.networkId)

      if (network) {
        assets.push(this.mapAnchorageAsset(network, anchorageAsset))
      } else {
        this.logger.warn('Anchorage asset network not found', { anchorageAsset })
      }
    }

    return assets
  }

  async findByOnchainId(networkId: string, onchainId: string): Promise<Asset | null> {
    for (const anchorageAsset of ANCHORAGE_ASSETS) {
      if (anchorageAsset.onchainIdentifier?.toLowerCase() === onchainId.toLowerCase()) {
        const network = await this.networkRepository.findByExternalId(Provider.ANCHORAGE, anchorageAsset.assetType)

        if (network?.networkId === networkId) {
          return this.mapAnchorageAsset(network, anchorageAsset)
        }
      }
    }

    return null
  }

  async findNativeAsset(networkId: string): Promise<Asset | null> {
    const network = await this.networkRepository.findById(networkId)

    if (network) {
      const externalNetwork = getExternalNetwork(network, Provider.ANCHORAGE)

      for (const anchorageAsset of ANCHORAGE_ASSETS) {
        // If network matches and asset doesn't has an address, it must be the
        // native asset.
        if (externalNetwork?.externalId === anchorageAsset.networkId && !anchorageAsset.onchainIdentifier) {
          return this.mapAnchorageAsset(network, anchorageAsset)
        }
      }
    }

    return null
  }
}
