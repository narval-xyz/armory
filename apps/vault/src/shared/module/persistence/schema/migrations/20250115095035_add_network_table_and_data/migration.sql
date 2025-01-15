-- CreateTable
CREATE TABLE "network" (
    "id" TEXT NOT NULL,
    "coin_type" INTEGER,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "network_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider_network" (
    "external_id" TEXT NOT NULL,
    "network_id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "provider_network_provider_external_id_key" ON "provider_network"("provider", "external_id");

-- CreateIndex
CREATE UNIQUE INDEX "provider_network_provider_network_id_key" ON "provider_network"("provider", "network_id");

-- AddForeignKey
ALTER TABLE "provider_network" ADD CONSTRAINT "provider_network_network_id_fkey" FOREIGN KEY ("network_id") REFERENCES "network"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- InsertProviderNetwork
INSERT INTO public.network (id,coin_type,name,created_at) VALUES
	 ('AETH',514,'Aetherius','2025-01-13 16:19:11.019'),
	 ('AEVO',NULL,'Aevo','2025-01-13 16:19:11.024'),
	 ('AGORIC',564,'Agoric','2025-01-13 16:19:11.026'),
	 ('ALEPH_ZERO',643,'Aleph Zero','2025-01-13 16:19:11.027'),
	 ('ALGORAND',283,'Algorand','2025-01-13 16:19:11.029'),
	 ('ALGORAND_TESTNET',1,'Algorand Testnet','2025-01-13 16:19:11.031'),
	 ('ALLORA',NULL,'Allora','2025-01-13 16:19:11.032'),
	 ('ALLORA_TESTNET',1,'Allora Testnet','2025-01-13 16:19:11.034'),
	 ('APTOS',637,'Aptos','2025-01-13 16:19:11.036'),
	 ('APTOS_TESTNET',1,'Aptos Testnet','2025-01-13 16:19:11.037');
INSERT INTO public.network (id,coin_type,name,created_at) VALUES
	 ('ARBITRUM_SEPOLIA',1,'Arbitrum Sepolia Testnet','2025-01-13 16:19:11.039'),
	 ('ASTAR',810,'Astar','2025-01-13 16:19:11.040'),
	 ('ASTAR_TESTNET',1,'Astar Testnet','2025-01-13 16:19:11.042'),
	 ('ATOM',118,'Atom','2025-01-13 16:19:11.043'),
	 ('ATOM_TESTNET',1,'Atom Testnet','2025-01-13 16:19:11.045'),
	 ('AURORA',2570,'Aurora','2025-01-13 16:19:11.046'),
	 ('AVAX',9000,'Avalanche','2025-01-13 16:19:11.047'),
	 ('AVAX_TESTNET',1,'Avalanche Testnet','2025-01-13 16:19:11.049'),
	 ('AXELAR',NULL,'Axelar','2025-01-13 16:19:11.050'),
	 ('AXELAR_TESTNET',1,'Axelar Testnet','2025-01-13 16:19:11.052');
INSERT INTO public.network (id,coin_type,name,created_at) VALUES
	 ('BABYLON',NULL,'Babylon','2025-01-13 16:19:11.053'),
	 ('BASE',8453,'Base','2025-01-13 16:19:11.054'),
	 ('BASE_TESTNET',1,'Base Testnet','2025-01-13 16:19:11.056'),
	 ('BINANCE_SMART_CHAIN',9006,'Binance Smart Chain','2025-01-13 16:19:11.057'),
	 ('BINANCE_SMART_CHAIN_TESTNET',1,'Binance Smart Chain Testnet','2025-01-13 16:19:11.058'),
	 ('BITCOIN',0,'Bitcoin','2025-01-13 16:19:11.059'),
	 ('BITCOIN_CASH',145,'Bitcoin Cash','2025-01-13 16:19:11.061'),
	 ('BITCOIN_CASH_TESTNET',1,'Bitcoin Cash Testnet','2025-01-13 16:19:11.062'),
	 ('BITCOIN_SIGNET',1,'Bitcoin Signet','2025-01-13 16:19:11.063'),
	 ('BITCOIN_SV',236,'BitcoinSV','2025-01-13 16:19:11.064');
INSERT INTO public.network (id,coin_type,name,created_at) VALUES
	 ('BITCOIN_SV_TESTNET',1,'BitcoinSV Testnet','2025-01-13 16:19:11.066'),
	 ('BITCOIN_TESTNET',1,'Bitcoin Testnet','2025-01-13 16:19:11.067'),
	 ('CARDANO',1815,'Cardano','2025-01-13 16:19:11.068'),
	 ('CARDANO_TESTNET',1,'Cardano Testnet','2025-01-13 16:19:11.070'),
	 ('CELESTIA',NULL,'Celestia','2025-01-13 16:19:11.071'),
	 ('CELO',52752,'Celo','2025-01-13 16:19:11.072'),
	 ('CELO_ALFAJORES',NULL,'Celo Alfajores','2025-01-13 16:19:11.073'),
	 ('CELO_BAKLAVA',1,'Celo Baklava','2025-01-13 16:19:11.075'),
	 ('CHILIZ',NULL,'Chiliz','2025-01-13 16:19:11.076'),
	 ('DABACUS',521,'Dabacus','2025-01-13 16:19:11.077');
INSERT INTO public.network (id,coin_type,name,created_at) VALUES
	 ('DOGECOIN',3,'Dogecoin','2025-01-13 16:19:11.079'),
	 ('DOGECOIN_TESTNET',1,'Dogecoin Testnet','2025-01-13 16:19:11.080'),
	 ('DYDX_CHAIN',NULL,'Dydx Chain','2025-01-13 16:19:11.081'),
	 ('DYDX_CHAIN_TESTNET',1,'Dydx Testnet','2025-01-13 16:19:11.083'),
	 ('ETHEREUM',60,'Ethereum','2025-01-13 16:19:11.084'),
	 ('ETHEREUM_HOLESKY',1,'Ethereum Holešky','2025-01-13 16:19:11.085'),
	 ('ETHEREUM_SEPOLIA',1,'Ethereum Sepolia','2025-01-13 16:19:11.086'),
	 ('EVMOS',NULL,'Evmos','2025-01-13 16:19:11.088'),
	 ('EVMOS_TESTNET',1,'Evmos Testnet','2025-01-13 16:19:11.089'),
	 ('FILECOIN',461,'Filecoin','2025-01-13 16:19:11.090');
INSERT INTO public.network (id,coin_type,name,created_at) VALUES
	 ('FLOW_TESTNET',1,'Flow Testnet','2025-01-13 16:19:11.091'),
	 ('LITECOIN',2,'Litecoin','2025-01-13 16:19:11.093'),
	 ('LITECOIN_TESTNET',1,'Litecoin Testnet','2025-01-13 16:19:11.094'),
	 ('NEUTRON',NULL,'Neutron','2025-01-13 16:19:11.095'),
	 ('OASIS',474,'Oasis','2025-01-13 16:19:11.097'),
	 ('OM_MANTRA',NULL,'OM Mantra','2025-01-13 16:19:11.098'),
	 ('OM_MANTRA_TESTNET',1,'OM Mantra Testnet','2025-01-13 16:19:11.099'),
	 ('OSMOSIS',10000118,'Osmosis','2025-01-13 16:19:11.101'),
	 ('PLUME_SEPOLIA',1,'Plume Sepolia Testnet','2025-01-13 16:19:11.102'),
	 ('POLYGON',966,'Polygon','2025-01-13 16:19:11.103');
INSERT INTO public.network (id,coin_type,name,created_at) VALUES
	 ('PROVENANCE',505,'Provenance','2025-01-13 16:19:11.104'),
	 ('RARIMO',NULL,'Rarimo','2025-01-13 16:19:11.106'),
	 ('RIPPLE',144,'Ripple','2025-01-13 16:19:11.107'),
	 ('RIPPLE_TESTNET',1,'Ripple Testnet','2025-01-13 16:19:11.108'),
	 ('SEI',19000118,'Sei','2025-01-13 16:19:11.110'),
	 ('SEI_TESTNET',1,'Sei Testnet','2025-01-13 16:19:11.111'),
	 ('SOLANA',501,'Solana','2025-01-13 16:19:11.112'),
	 ('SOLANA_TESTNET',1,'Solana Testnet','2025-01-13 16:19:11.114'),
	 ('STARKNET',9004,'Starknet','2025-01-13 16:19:11.115'),
	 ('STARKNET_TESTNET',1,'Starknet Testnet','2025-01-13 16:19:11.116');
INSERT INTO public.network (id,coin_type,name,created_at) VALUES
	 ('STELLAR_LUMENS',148,'Stellar Lumens','2025-01-13 16:19:11.117'),
	 ('STELLAR_LUMENS_TESTNET',1,'Stellar Lumens Testnet','2025-01-13 16:19:11.119'),
	 ('STRIDE',NULL,'Stride','2025-01-13 16:19:11.120'),
	 ('SUI_TESTNET',1,'Sui Testnet','2025-01-13 16:19:11.121'),
	 ('TRON',195,'Tron','2025-01-13 16:19:11.122'),
	 ('TRON_TESTNET',1,'Tron Testnet','2025-01-13 16:19:11.123'),
	 ('VANA',NULL,'Vana','2025-01-13 16:19:11.124'),
	 ('VANA_MOKSHA_TESTNET',1,'Vana Moksha Testnet','2025-01-13 16:19:11.126'),
	 ('ZKSYNC_SEPOLIA',1,'ZKsync Sepolia Testnet','2025-01-13 16:19:11.127'),
	 ('POLKADOT',354,'Polkadot','2025-01-13 16:19:11.128');
INSERT INTO public.network (id,coin_type,name,created_at) VALUES
	 ('EOS',194,'EOS','2025-01-13 16:19:11.129'),
	 ('EOS_TESTNET',1,'EOS Testnet','2025-01-13 16:19:11.131'),
	 ('OASYS',685,'Oasys','2025-01-13 16:19:11.132'),
	 ('OASYS_TESTNET',1,'Oasys Testnet','2025-01-13 16:19:11.133'),
	 ('OSMOSIS_TESTNET',1,'Osmosis Testnet','2025-01-13 16:19:11.134'),
	 ('TELOS',424,'Telos','2025-01-13 16:19:11.136'),
	 ('TELOS_TESTNET',1,'Telos Testnet','2025-01-13 16:19:11.137'),
	 ('TEZOS',1729,'Tezos','2025-01-13 16:19:11.138'),
	 ('TEZOS_TESTNET',1,'Tezos Testnet','2025-01-13 16:19:11.139'),
	 ('DASH',5,'Dash','2025-01-13 16:19:11.140');
INSERT INTO public.network (id,coin_type,name,created_at) VALUES
	 ('DASH_TESTNET',1,'Dash Testnet','2025-01-13 16:19:11.141'),
	 ('OPTIMISM',614,'Optimism','2025-01-13 16:19:11.143'),
	 ('OPTIMISM_SEPOLIA',1,'Optimism Sepolia','2025-01-13 16:19:11.144'),
	 ('OPTIMISM_KOVAN',1,'Optimism Kovan','2025-01-13 16:19:11.145');

-- InsertProviderExternalNetwork
INSERT INTO public.provider_network (external_id,network_id,provider,created_at) VALUES
	 ('ETH-AETH','AETH','fireblocks','2025-01-13 16:19:11.019'),
	 ('AEVO','AEVO','fireblocks','2025-01-13 16:19:11.024'),
	 ('BLD','AGORIC','anchorage','2025-01-13 16:19:11.026'),
	 ('ALEPH_ZERO_EVM','ALEPH_ZERO','fireblocks','2025-01-13 16:19:11.027'),
	 ('ALGO','ALGORAND','fireblocks','2025-01-13 16:19:11.029'),
	 ('ALGO_TEST','ALGORAND_TESTNET','fireblocks','2025-01-13 16:19:11.031'),
	 ('ALLO','ALLORA','anchorage','2025-01-13 16:19:11.032'),
	 ('ALLO_T','ALLORA_TESTNET','anchorage','2025-01-13 16:19:11.034'),
	 ('APT','APTOS','anchorage','2025-01-13 16:19:11.036'),
	 ('APT_T','APTOS_TESTNET','anchorage','2025-01-13 16:19:11.037');
INSERT INTO public.provider_network (external_id,network_id,provider,created_at) VALUES
	 ('ARBITRUM_SEPOLIA','ARBITRUM_SEPOLIA','anchorage','2025-01-13 16:19:11.039'),
	 ('ASTR_ASTR','ASTAR','fireblocks','2025-01-13 16:19:11.040'),
	 ('ASTR_TEST','ASTAR_TESTNET','fireblocks','2025-01-13 16:19:11.042'),
	 ('COSMOS','ATOM','anchorage','2025-01-13 16:19:11.043'),
	 ('ATOM_COS','ATOM','fireblocks','2025-01-13 16:19:11.043'),
	 ('ATOM_COS_TEST','ATOM_TESTNET','fireblocks','2025-01-13 16:19:11.045'),
	 ('AURORA_DEV','AURORA','fireblocks','2025-01-13 16:19:11.046'),
	 ('AVAX','AVAX','fireblocks','2025-01-13 16:19:11.047'),
	 ('AVAXTEST','AVAX_TESTNET','fireblocks','2025-01-13 16:19:11.049'),
	 ('AXL','AXELAR','anchorage','2025-01-13 16:19:11.050');
INSERT INTO public.provider_network (external_id,network_id,provider,created_at) VALUES
	 ('AXL_T','AXELAR_TESTNET','anchorage','2025-01-13 16:19:11.052'),
	 ('BBN','BABYLON','anchorage','2025-01-13 16:19:11.053'),
	 ('BASECHAIN_ETH','BASE','fireblocks','2025-01-13 16:19:11.054'),
	 ('BASECHAIN_ETH_TEST5','BASE_TESTNET','fireblocks','2025-01-13 16:19:11.056'),
	 ('BNB_BSC','BINANCE_SMART_CHAIN','fireblocks','2025-01-13 16:19:11.057'),
	 ('BNB_TEST','BINANCE_SMART_CHAIN_TESTNET','fireblocks','2025-01-13 16:19:11.058'),
	 ('BTC','BITCOIN','anchorage','2025-01-13 16:19:11.059'),
	 ('BTC','BITCOIN','fireblocks','2025-01-13 16:19:11.059'),
	 ('BCH','BITCOIN_CASH','anchorage','2025-01-13 16:19:11.061'),
	 ('BCH','BITCOIN_CASH','fireblocks','2025-01-13 16:19:11.061');
INSERT INTO public.provider_network (external_id,network_id,provider,created_at) VALUES
	 ('BCH_TEST','BITCOIN_CASH_TESTNET','fireblocks','2025-01-13 16:19:11.062'),
	 ('BTC_S','BITCOIN_SIGNET','anchorage','2025-01-13 16:19:11.063'),
	 ('BSV','BITCOIN_SV','fireblocks','2025-01-13 16:19:11.064'),
	 ('BSV_TEST','BITCOIN_SV_TESTNET','fireblocks','2025-01-13 16:19:11.066'),
	 ('BTC_TEST','BITCOIN_TESTNET','fireblocks','2025-01-13 16:19:11.067'),
	 ('ADA','CARDANO','fireblocks','2025-01-13 16:19:11.068'),
	 ('ADA_TEST','CARDANO_TESTNET','fireblocks','2025-01-13 16:19:11.070'),
	 ('TIA','CELESTIA','anchorage','2025-01-13 16:19:11.071'),
	 ('CELO','CELO','fireblocks','2025-01-13 16:19:11.072'),
	 ('CELO_ALF','CELO_ALFAJORES','fireblocks','2025-01-13 16:19:11.073');
INSERT INTO public.provider_network (external_id,network_id,provider,created_at) VALUES
	 ('CGLD_TB','CELO_BAKLAVA','anchorage','2025-01-13 16:19:11.075'),
	 ('CELO_BAK','CELO_BAKLAVA','fireblocks','2025-01-13 16:19:11.075'),
	 ('CHZ_$CHZ','CHILIZ','fireblocks','2025-01-13 16:19:11.076'),
	 ('ABA','DABACUS','fireblocks','2025-01-13 16:19:11.077'),
	 ('DOGE','DOGECOIN','anchorage','2025-01-13 16:19:11.079'),
	 ('DOGE','DOGECOIN','fireblocks','2025-01-13 16:19:11.079'),
	 ('DOGE_TEST','DOGECOIN_TESTNET','fireblocks','2025-01-13 16:19:11.080'),
	 ('DYDX_CHAIN','DYDX_CHAIN','anchorage','2025-01-13 16:19:11.081'),
	 ('DYDX_CHAIN_T','DYDX_CHAIN_TESTNET','anchorage','2025-01-13 16:19:11.083'),
	 ('ETH','ETHEREUM','anchorage','2025-01-13 16:19:11.084');
INSERT INTO public.provider_network (external_id,network_id,provider,created_at) VALUES
	 ('ETH','ETHEREUM','fireblocks','2025-01-13 16:19:11.084'),
	 ('ETHHOL','ETHEREUM_HOLESKY','anchorage','2025-01-13 16:19:11.085'),
	 ('ETHSEP','ETHEREUM_SEPOLIA','anchorage','2025-01-13 16:19:11.086'),
	 ('EVMOS','EVMOS','anchorage','2025-01-13 16:19:11.088'),
	 ('EVMOS_T','EVMOS_TESTNET','anchorage','2025-01-13 16:19:11.089'),
	 ('FIL','FILECOIN','anchorage','2025-01-13 16:19:11.090'),
	 ('FLOW_T','FLOW_TESTNET','anchorage','2025-01-13 16:19:11.091'),
	 ('LTC','LITECOIN','anchorage','2025-01-13 16:19:11.093'),
	 ('LTC','LITECOIN','fireblocks','2025-01-13 16:19:11.093'),
	 ('LTC_TEST','LITECOIN_TESTNET','fireblocks','2025-01-13 16:19:11.094');
INSERT INTO public.provider_network (external_id,network_id,provider,created_at) VALUES
	 ('NTRN','NEUTRON','anchorage','2025-01-13 16:19:11.095'),
	 ('OAC','OASIS','anchorage','2025-01-13 16:19:11.097'),
	 ('OM_MANTRA','OM_MANTRA','anchorage','2025-01-13 16:19:11.098'),
	 ('OM_MANTRA_T','OM_MANTRA_TESTNET','anchorage','2025-01-13 16:19:11.099'),
	 ('OSMO','OSMOSIS','anchorage','2025-01-13 16:19:11.101'),
	 ('OSMO','OSMOSIS','fireblocks','2025-01-13 16:19:11.101'),
	 ('PLUME_SEPOLIA','PLUME_SEPOLIA','anchorage','2025-01-13 16:19:11.102'),
	 ('POLYGON','POLYGON','anchorage','2025-01-13 16:19:11.103'),
	 ('MATIC_POLYGON','POLYGON','fireblocks','2025-01-13 16:19:11.103'),
	 ('HASH','PROVENANCE','anchorage','2025-01-13 16:19:11.104');
INSERT INTO public.provider_network (external_id,network_id,provider,created_at) VALUES
	 ('RMO','RARIMO','anchorage','2025-01-13 16:19:11.106'),
	 ('XRP','RIPPLE','anchorage','2025-01-13 16:19:11.107'),
	 ('XRP','RIPPLE','fireblocks','2025-01-13 16:19:11.107'),
	 ('XRP_TEST','RIPPLE_TESTNET','fireblocks','2025-01-13 16:19:11.108'),
	 ('SEI','SEI','anchorage','2025-01-13 16:19:11.110'),
	 ('SEI','SEI','fireblocks','2025-01-13 16:19:11.110'),
	 ('SEI_T','SEI_TESTNET','anchorage','2025-01-13 16:19:11.111'),
	 ('SEI_TEST','SEI_TESTNET','fireblocks','2025-01-13 16:19:11.111'),
	 ('SOL','SOLANA','fireblocks','2025-01-13 16:19:11.112'),
	 ('SOL_TD','SOLANA_TESTNET','anchorage','2025-01-13 16:19:11.114');
INSERT INTO public.provider_network (external_id,network_id,provider,created_at) VALUES
	 ('SOL_TEST','SOLANA_TESTNET','fireblocks','2025-01-13 16:19:11.114'),
	 ('STARK_STARKNET','STARKNET','anchorage','2025-01-13 16:19:11.115'),
	 ('STRK_STARKNET_T','STARKNET_TESTNET','anchorage','2025-01-13 16:19:11.116'),
	 ('XLM','STELLAR_LUMENS','fireblocks','2025-01-13 16:19:11.117'),
	 ('XLM_TEST','STELLAR_LUMENS_TESTNET','fireblocks','2025-01-13 16:19:11.119'),
	 ('STRD','STRIDE','anchorage','2025-01-13 16:19:11.120'),
	 ('SUI_T','SUI_TESTNET','anchorage','2025-01-13 16:19:11.121'),
	 ('TRX','TRON','fireblocks','2025-01-13 16:19:11.122'),
	 ('TRX_TEST','TRON_TESTNET','fireblocks','2025-01-13 16:19:11.123'),
	 ('VANA','VANA','anchorage','2025-01-13 16:19:11.124');
INSERT INTO public.provider_network (external_id,network_id,provider,created_at) VALUES
	 ('VANA_MOKSHA_TESTNET','VANA_MOKSHA_TESTNET','anchorage','2025-01-13 16:19:11.126'),
	 ('ZKSYNC_SEPOLIA','ZKSYNC_SEPOLIA','anchorage','2025-01-13 16:19:11.127'),
	 ('DOT','POLKADOT','fireblocks','2025-01-13 16:19:11.128'),
	 ('EOS','EOS','fireblocks','2025-01-13 16:19:11.129'),
	 ('EOS_TEST','EOS_TESTNET','fireblocks','2025-01-13 16:19:11.131'),
	 ('OAS','OASYS','fireblocks','2025-01-13 16:19:11.132'),
	 ('OAS_TEST','OASYS_TESTNET','fireblocks','2025-01-13 16:19:11.133'),
	 ('OSMO_TEST','OSMOSIS_TESTNET','fireblocks','2025-01-13 16:19:11.134'),
	 ('TELOS','TELOS','fireblocks','2025-01-13 16:19:11.136'),
	 ('TELOS_TEST','TELOS_TESTNET','fireblocks','2025-01-13 16:19:11.137');
INSERT INTO public.provider_network (external_id,network_id,provider,created_at) VALUES
	 ('XTZ','TEZOS','fireblocks','2025-01-13 16:19:11.138'),
	 ('XTZ_TEST','TEZOS_TESTNET','fireblocks','2025-01-13 16:19:11.139'),
	 ('DASH','DASH','fireblocks','2025-01-13 16:19:11.140'),
	 ('DASH_TEST','DASH_TESTNET','fireblocks','2025-01-13 16:19:11.141'),
	 ('ETH-OPT','OPTIMISM','fireblocks','2025-01-13 16:19:11.143'),
	 ('ETH-OPT_SEPOLIA','OPTIMISM_SEPOLIA','fireblocks','2025-01-13 16:19:11.144'),
	 ('ETH-OPT_KOV','OPTIMISM_KOVAN','fireblocks','2025-01-13 16:19:11.145');
