export const NETWORK_INFO = [
 {
   networkId: 'AGORIC_MAINNET',
   anchorageId: 'BLD',
   coinType: 564,
   name: 'Agoric',
   addressValidationRegex: '^agoric(valoper)?1[ac-hj-np-z02-9]{7,88}$|^AGORIC(VALOPER)?1[AC-HJ-NP-Z02-9]{7,88}$'
 },
 {
   networkId: 'ALLORA_MAINNET',
   anchorageId: 'ALLO',
   coinType: null,
   name: 'Allora',
   addressValidationRegex: '^allo(valoper)?1[ac-hj-np-z02-9]{7,88}$|^ALLO(VALOPER)?1[AC-HJ-NP-Z02-9]{7,88}$'
 },
 {
   networkId: 'ALLORA_TESTNET',
   anchorageId: 'ALLO_T',
   coinType: 1,
   name: 'Allora Testnet',
   addressValidationRegex: '^allo(valoper)?1[ac-hj-np-z02-9]{7,88}$|^ALLO(VALOPER)?1[AC-HJ-NP-Z02-9]{7,88}$'
 },
 {
   networkId: 'APTOS_MAINNET',
   anchorageId: 'APT',
   coinType: 637,
   name: 'Aptos',
   addressValidationRegex: '^(0x)?[0-9a-fA-F]{1,64}$'
 },
 {
   networkId: 'APTOS_TESTNET',
   anchorageId: 'APT_T',
   coinType: 1,
   name: 'Aptos Testnet',
   addressValidationRegex: '^(0x)?[0-9a-fA-F]{1,64}$'
 },
 {
   networkId: 'AXELAR_MAINNET',
   anchorageId: 'AXL',
   coinType: null,
   name: 'Axelar',
   addressValidationRegex: '^axelar(valoper)?1[ac-hj-np-z02-9]{7,88}$|^AXELAR(VALOPER)?1[AC-HJ-NP-Z02-9]{7,88}$'
 },
 {
   networkId: 'AXELAR_TESTNET',
   anchorageId: 'AXL_T',
   coinType: 1,
   name: 'Axelar Testnet',
   addressValidationRegex: '^axelar(valoper)?1[ac-hj-np-z02-9]{7,88}$|^AXELAR(VALOPER)?1[AC-HJ-NP-Z02-9]{7,88}$'
 },
 {
   networkId: 'BABYLON_MAINNET',
   anchorageId: 'BBN',
   coinType: null,
   name: 'Babylon',
   addressValidationRegex: '^bbn(valoper)?1[ac-hj-np-z02-9]{7,88}$|^BBN(VALOPER)?1[AC-HJ-NP-Z02-9]{7,88}$'
 },
 {
   networkId: 'BITCOIN_MAINNET',
   anchorageId: 'BTC',
   coinType: 0,
   name: 'Bitcoin',
   addressValidationRegex: '^[13][a-km-zA-HJ-NP-Z1-9]{25,40}$|^bc1q[ac-hj-np-z02-9]{38,38}$|^BC1Q[AC-HJ-NP-Z02-9]{38,38}$|^bc1q[ac-hj-np-z02-9]{58,58}$|^BC1Q[AC-HJ-NP-Z02-9]{58,58}$|^bc1p[ac-hj-np-z02-9]{58,58}$|^BC1P[AC-HJ-NP-Z02-9]{58,58}$'
 },
 {
   networkId: 'BITCOIN_CASH_MAINNET',
   anchorageId: 'BCH',
   coinType: 145,
   name: 'Bitcoin Cash',
   addressValidationRegex: '^[13][a-km-zA-HJ-NP-Z1-9]{25,40}$|^(bitcoincash:)?[ac-hj-np-z02-9]{11,78}$|^(BITCOINCASH:)?[AC-HJ-NP-Z02-9]{11,78}$'
 },
 {
   networkId: 'BITCOIN_SIGNET',
   anchorageId: 'BTC_S',
   coinType: null,
   name: 'Bitcoin Signet',
   addressValidationRegex: '^[2nm][a-km-zA-HJ-NP-Z1-9]{25,40}$|^tb1q[ac-hj-np-z02-9]{38,38}$|^TB1Q[AC-HJ-NP-Z02-9]{38,38}$|^tb1q[ac-hj-np-z02-9]{58,58}$|^TB1Q[AC-HJ-NP-Z02-9]{58,58}$|^tb1p[ac-hj-np-z02-9]{58,58}$|^TB1P[AC-HJ-NP-Z02-9]{58,58}$'
 },
 {
   networkId: 'CELESTIA_MAINNET',
   anchorageId: 'TIA',
   coinType: null,
   name: 'Celestia',
   addressValidationRegex: '^celestia(valoper)?1[ac-hj-np-z02-9]{7,88}$|^CELESTIA(VALOPER)?1[AC-HJ-NP-Z02-9]{7,88}$'
 },
 {
   networkId: 'CELO_BAKLAVA',
   anchorageId: 'CGLD_TB',
   coinType: 1,
   name: 'Celo Baklava',
   addressValidationRegex: '^(0x)?[0-9a-fA-F]{40}$'
 },
 {
   networkId: 'COSMOS_MAINNET',
   anchorageId: 'ATOM',
   coinType: 118,
   name: 'Cosmos',
   addressValidationRegex: '^cosmos(valoper)?1[ac-hj-np-z02-9]{7,88}$|^COSMOS(VALOPER)?1[AC-HJ-NP-Z02-9]{7,88}$'
 },
 {
   networkId: 'DOGECOIN_MAINNET',
   anchorageId: 'DOGE',
   coinType: 3,
   name: 'Dogecoin',
   addressValidationRegex: '^[AD9][a-km-zA-HJ-NP-Z1-9]{25,40}$'
 },
 {
   networkId: 'DYDX_CHAIN_MAINNET',
   anchorageId: 'DYDX_CHAIN',
   coinType: null,
   name: 'Dydx Chain',
   addressValidationRegex: '^dydx(valoper)?1[ac-hj-np-z02-9]{7,88}$|^DYDX(VALOPER)?1[AC-HJ-NP-Z02-9]{7,88}$'
 },
 {
   networkId: 'DYDX_CHAIN_TESTNET',
   anchorageId: 'DYDX_CHAIN_T',
   coinType: 1,
   name: 'Dydx Testnet',
   addressValidationRegex: '^dydx(valoper)?1[ac-hj-np-z02-9]{7,88}$|^DYDX(VALOPER)?1[AC-HJ-NP-Z02-9]{7,88}$'
 },
 {
   networkId: 'ETHEREUM_MAINNET',
   anchorageId: 'ETH',
   coinType: 60,
   name: 'Ethereum',
   addressValidationRegex: '^(0x)?[0-9a-fA-F]{40}$'
 },
 {
   networkId: 'ETHEREUM_HOLESKY',
   anchorageId: 'ETHHOL',
   coinType: 1,
   name: 'Ethereum Holešky',
   addressValidationRegex: '^(0x)?[0-9a-fA-F]{40}$'
 },
 {
   networkId: 'ETHEREUM_SEPOLIA',
   anchorageId: 'ETHSEP',
   coinType: 1,
   name: 'Ethereum Sepolia',
   addressValidationRegex: '^(0x)?[0-9a-fA-F]{40}$'
 },
 {
   networkId: 'ARBITRUM_SEPOLIA',
   anchorageId: 'ETH_ARBITRUM_T',
   coinType: 1,
   name: 'Arbitrum Sepolia Testnet',
   addressValidationRegex: '^(0x)?[0-9a-fA-F]{40}$'
 },
 {
   networkId: 'PLUME_SEPOLIA',
   anchorageId: 'ETH_PLUME_T',
   coinType: 1,
   name: 'Plume Sepolia Testnet',
   addressValidationRegex: '^(0x)?[0-9a-fA-F]{40}$'
 },
 {
   networkId: 'ZKSYNC_SEPOLIA',
   anchorageId: 'ETH_ZKSYNC_T',
   coinType: 1,
   name: 'ZKsync Sepolia Testnet',
   addressValidationRegex: '^(0x)?[0-9a-fA-F]{40}$'
 },
 {
   networkId: 'EVMOS_MAINNET',
   anchorageId: 'EVMOS',
   coinType: null,
   name: 'Evmos',
   addressValidationRegex: '^evmos(valoper)?1[ac-hj-np-z02-9]{7,88}$|^EVMOS(VALOPER)?1[AC-HJ-NP-Z02-9]{7,88}$'
 },
 {
   networkId: 'EVMOS_TESTNET',
   anchorageId: 'EVMOS_T',
   coinType: 1,
   name: 'Evmos Testnet',
   addressValidationRegex: '^evmos(valoper)?1[ac-hj-np-z02-9]{7,88}$|^EVMOS(VALOPER)?1[AC-HJ-NP-Z02-9]{7,88}$'
 },
 {
   networkId: 'FILECOIN_MAINNET',
   anchorageId: 'FIL',
   coinType: 461,
   name: 'Filecoin',
   addressValidationRegex: '^[ft](0[0-9]{1,20}|[12][a-z2-7]{39}|3[a-z2-7]{84})$'
 },
 {
   networkId: 'FLOW_TESTNET',
   anchorageId: 'FLOW_T',
   coinType: 1,
   name: 'Flow Testnet',
   addressValidationRegex: '^(0x)?[0-9a-fA-F]{16}$'
 },
 {
   networkId: 'LITECOIN_MAINNET',
   anchorageId: 'LTC',
   coinType: 2,
   name: 'Litecoin',
   addressValidationRegex: '^[LM][a-km-zA-HJ-NP-Z1-9]{25,40}$|^ltc1q[ac-hj-np-z02-9]{38,38}$|^LTC1Q[AC-HJ-NP-Z02-9]{38,38}$|^ltc1q[ac-hj-np-z02-9]{58,58}$|^LTC1Q[AC-HJ-NP-Z02-9]{58,58}$'
 },
 {
   networkId: 'NEUTRON_MAINNET',
   anchorageId: 'NTRN',
   coinType: null,
   name: 'Neutron',
   addressValidationRegex: '^neutron(valoper)?1[ac-hj-np-z02-9]{7,88}$|^NEUTRON(VALOPER)?1[AC-HJ-NP-Z02-9]{7,88}$'
 },
 {
   networkId: 'OM_MANTRA_MAINNET',
   anchorageId: 'OM_MANTRA',
   coinType: null,
   name: 'OM Mantra',
   addressValidationRegex: '^mantra(valoper)?1[ac-hj-np-z02-9]{7,88}$|^MANTRA(VALOPER)?1[AC-HJ-NP-Z02-9]{7,88}$'
 },
 {
   networkId: 'OM_MANTRA_TESTNET',
   anchorageId: 'OM_MANTRA_T',
   coinType: 1,
   name: 'OM Mantra Testnet',
   addressValidationRegex: '^mantra(valoper)?1[ac-hj-np-z02-9]{7,88}$|^MANTRA(VALOPER)?1[AC-HJ-NP-Z02-9]{7,88}$'
 },
 {
   networkId: 'OASIS_MAINNET',
   anchorageId: 'ROSE',
   coinType: 474,
   name: 'Oasis',
   addressValidationRegex: '^oasis1[ac-hj-np-z02-9]{39,59}$|^OASIS1[AC-HJ-NP-Z02-9]{39,59}$'
 },
 {
   networkId: 'OSMOSIS_MAINNET',
   anchorageId: 'OSMO',
   coinType: 10000118,
   name: 'Osmosis',
   addressValidationRegex: '^osmo(valoper)?1[ac-hj-np-z02-9]{7,88}$|^OSMO(VALOPER)?1[AC-HJ-NP-Z02-9]{7,88}$'
 },
 {
   networkId: 'POLYGON_MAINNET',
   anchorageId: 'MATIC_POLYGON',
   coinType: 966,
   name: 'Polygon',
   addressValidationRegex: '^(0x)?[0-9a-fA-F]{40}$'
 },
 {
   networkId: 'PROVENANCE_MAINNET',
   anchorageId: 'HASH',
   coinType: 505,
   name: 'Provenance',
   addressValidationRegex: '^pb(valoper)?1[ac-hj-np-z02-9]{7,88}$|^PB(VALOPER)?1[AC-HJ-NP-Z02-9]{7,88}$'
 },
 {
   networkId: 'RARIMO_MAINNET',
   anchorageId: 'RMO',
   coinType: null,
   name: 'Rarimo',
   addressValidationRegex: '^rarimo(valoper)?1[ac-hj-np-z02-9]{7,88}$|^RARIMO(VALOPER)?1[AC-HJ-NP-Z02-9]{7,88}$'
 },
 {
   networkId: 'RIPPLE_MAINNET',
   anchorageId: 'XRP',
   coinType: 144,
   name: 'Ripple',
   addressValidationRegex: '^r[a-km-zA-HJ-NP-Z1-9]{24,34}$'
 },
 {
   networkId: 'SEI_MAINNET',
   anchorageId: 'SEI',
   coinType: 19000118,
   name: 'Sei',
   addressValidationRegex: '^sei(valoper)?1[ac-hj-np-z02-9]{7,88}$|^SEI(VALOPER)?1[AC-HJ-NP-Z02-9]{7,88}$'
 },
 {
   networkId: 'SEI_TESTNET',
   anchorageId: 'SEI_T',
   coinType: 1,
   name: 'Sei Testnet',
   addressValidationRegex: '^sei(valoper)?1[ac-hj-np-z02-9]{7,88}$|^SEI(VALOPER)?1[AC-HJ-NP-Z02-9]{7,88}$'
 },
 {
   networkId: 'SOLANA_DEVNET',
   anchorageId: 'SOL_TD',
   coinType: 1,
   name: 'Solana Devnet',
   addressValidationRegex: '^[a-km-zA-HJ-NP-Z1-9]{32,44}$'
 },
 {
   networkId: 'STARKNET_MAINNET',
   anchorageId: 'STRK_STARKNET',
   coinType: 9004,
   name: 'Starknet',
   addressValidationRegex: '^(0x)?[0-9a-fA-F]{1,64}$'
 },
 {
   networkId: 'STARKNET_TESTNET',
   anchorageId: 'STRK_STARKNET_T',
   coinType: 1,
   name: 'Starknet Testnet',
   addressValidationRegex: '^(0x)?[0-9a-fA-F]{1,64}$'
 },
 {
   networkId: 'STRIDE_MAINNET',
   anchorageId: 'STRD',
   coinType: null,
   name: 'Stride',
   addressValidationRegex: '^stride(valoper)?1[ac-hj-np-z02-9]{7,88}$|^STRIDE(VALOPER)?1[AC-HJ-NP-Z02-9]{7,88}$'
 },
 {
   networkId: 'SUI_TESTNET',
   anchorageId: 'SUI_T',
   coinType: 1,
   name: 'Sui Testnet',
   addressValidationRegex: '^0x[a-fA-F0-9]{64}$'
 },
 {
   networkId: 'VANA_MOKSHA_TESTNET',
   anchorageId: 'VANA_VANA_MOKSHA_T',
   coinType: 1,
   name: 'Vana Moksha Testnet',
   addressValidationRegex: '^(0x)?[0-9a-fA-F]{40}$'
 },
 {
   networkId: 'VANA_MAINNET',
   anchorageId: 'VANA_VANA',
   coinType: null,
   name: 'Vana',
   addressValidationRegex: '^(0x)?[0-9a-fA-F]{40}$'
 }
]