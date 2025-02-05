UPDATE provider_account SET network_id = 'BITCOIN' WHERE network_id = 'BTC';
UPDATE provider_account SET network_id = 'BITCOIN_SIGNET' WHERE network_id = 'BTC_S';
UPDATE provider_account SET network_id = 'BITCOIN_CASH' WHERE network_id = 'BCH';
UPDATE provider_account SET network_id = 'ARBITRUM_SEPOLIA' WHERE network_id = 'ETH_ARBITRUM_T';
UPDATE provider_account SET network_id = 'ETHEREUM' WHERE network_id = 'ETH';
UPDATE provider_account SET network_id = 'ETHEREUM_HOLESKY' WHERE network_id = 'ETHHOL';
UPDATE provider_account SET network_id = 'ETHEREUM_SEPOLIA' WHERE network_id = 'ETHSEP';
UPDATE provider_account SET network_id = 'POLYGON' WHERE network_id = 'POL_POLYGON';

UPDATE provider_known_destination SET network_id = 'BITCOIN' WHERE network_id = 'BTC';
UPDATE provider_known_destination SET network_id = 'BITCOIN_SIGNET' WHERE network_id = 'BTC_S';
UPDATE provider_known_destination SET network_id = 'BITCOIN_CASH' WHERE network_id = 'BCH';
UPDATE provider_known_destination SET network_id = 'ARBITRUM_SEPOLIA' WHERE network_id = 'ETH_ARBITRUM_T';
UPDATE provider_known_destination SET network_id = 'ETHEREUM' WHERE network_id = 'ETH';
UPDATE provider_known_destination SET network_id = 'ETHEREUM_HOLESKY' WHERE network_id = 'ETHHOL';
UPDATE provider_known_destination SET network_id = 'ETHEREUM_SEPOLIA' WHERE network_id = 'ETHSEP';
UPDATE provider_known_destination SET network_id = 'POLYGON' WHERE network_id = 'POL_POLYGON';
