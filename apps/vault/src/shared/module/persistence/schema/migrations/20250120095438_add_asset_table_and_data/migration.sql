-- CreateTable
CREATE TABLE "asset" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT,
    "decimals" INTEGER,
    "network_id" TEXT NOT NULL,
    "onchain_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider_asset" (
    "asset_id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "external_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "provider_asset_pkey" PRIMARY KEY ("provider","external_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "asset_network_id_onchain_id_key" ON "asset"("network_id", "onchain_id");

-- CreateIndex
CREATE UNIQUE INDEX "provider_asset_provider_asset_id_key" ON "provider_asset"("provider", "asset_id");

-- AddForeignKey
ALTER TABLE "asset" ADD CONSTRAINT "asset_network_id_fkey" FOREIGN KEY ("network_id") REFERENCES "network"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_asset" ADD CONSTRAINT "provider_asset_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Correct Ethereum Arbitrum external network and Solana Devnet data
INSERT INTO public.network (id,coin_type,name) VALUES
	 ('ARBITRUM',9001,'Arbitrum'),
	 ('SOLANA_DEVNET',1,'Solana Devnet');

DELETE FROM public.provider_network WHERE external_id = 'SOL_TD' AND network_id = 'SOLANA_TESTNET';
DELETE FROM public.provider_network WHERE external_id = 'ETH-AETH';

INSERT INTO public.provider_network (external_id,network_id,provider) VALUES
  ('SOL_TD','SOLANA_DEVNET','anchorage'),
  ('ETH-AETH','ARBITRUM','fireblocks');

-- Insert initial asset data
INSERT INTO public.asset (id,"name",symbol,decimals,network_id,onchain_id) VALUES
  ('1INCH','1inch','1INCH',18,'ETHEREUM','0x111111111117dc0aa78b770fa6a738034120c302'),
  ('AAVE','Aave','AAVE',18,'ETHEREUM','0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9'),
  ('ARB','Arbitrum','ARB',18,'ETHEREUM','0xb50721bcf8d664c30412cfbc6cf7a15145234ad1'),
  ('ARB_ARB','Arbitrum','ARB',18,'ARBITRUM','0x912ce59144191c1204e64559fe8253a0e49e6548'),
  ('ATOM','Cosmos','ATOM',6,'ATOM',NULL),
  ('BTC','Bitcoin','BTC',8,'BITCOIN',NULL),
  ('DOT','Polkadot','DOT',10,'POLKADOT',NULL),
  ('ETH','Ethereum','ETH',18,'ETHEREUM',NULL),
  ('ETH_ARB','Arbitrum Ethereum','ETH',18,'ARBITRUM',NULL),
  ('ETH_ARBITRUM_TEST','Arbitrum Sepolia Testnet','ETH',18,'ARBITRUM_SEPOLIA',NULL),
  ('ETH_OPT','Optimistic Ethereum','ETH',18,'OPTIMISM',NULL),
  ('ETH_OPT_KOVAN','Optimistic Ethereum Kovan','ETH',18,'OPTIMISM_KOVAN',NULL),
  ('ETH_OPT_SEPOLIA','Optimistic Ethereum Sepolia','ETH',18,'OPTIMISM_SEPOLIA',NULL),
  ('ETH_ZKSYNC_TEST','ZKsync Sepolia Testnet','ETH',18,'ZKSYNC_SEPOLIA',NULL),
  ('LTC','Litecoin','LTC',8,'LITECOIN',NULL),
  ('MATIC','Matic Token','MATIC',18,'ETHEREUM','0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0'),
  ('MORPHO','Morpho Token','MORPHO',18,'ETHEREUM','0x9994e35db50125e0df82e4c2dde62496ce330999'),
  ('POL','Polygon Token','POL',18,'ETHEREUM','0x455e53cbb86018ac2b8092fdcd39d8444affc3f6'),
  ('POL_POLYGON','Polygon','POL',18,'POLYGON',NULL),
  ('PORTAL','PORTAL','PORTAL',18,'ETHEREUM','0x1bbe973bef3a977fc51cbed703e8ffdefe001fed'),
  ('SOL','Solana','SOL',NULL,'SOLANA',NULL),
  ('SOL_DEVNET','Solana Devnet','SOL',9,'SOLANA_DEVNET',NULL),
  ('SOL_TEST','Solana Testnet','SOL',NULL,'SOLANA_TESTNET',NULL),
  ('SUI_TEST','Sui Test','SUI',9,'SUI_TESTNET',NULL),
  ('SUSHI','SushiSwap','SUSHI',18,'ETHEREUM','0x6b3595068778dd592e39a122f4f5a5cf09c90fe2'),
  ('UNI','Uniswap','UNI',18,'ETHEREUM','0x1f9840a85d5af5bf1d1762f925bdaddc4201f984'),
  ('USDC','USD Coin','USDC',6,'ETHEREUM','0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'),
  ('USDC_ARBITRUM','USD Coin','USDC',6,'ARBITRUM','0xaf88d065e77c8cc2239327c5edb3a432268e5831'),
  ('USDC_POLYGON','USD Coin','USDC',6,'POLYGON','0x2791bca1f2de4661ed88a30c99a7a9449aa84174'),
  ('USDT','Tether','USDT',6,'ETHEREUM','0xdac17f958d2ee523a2206206994597c13d831ec7'),
  ('USDT_POLYGON','Tether','USDT',6,'POLYGON','0xc2132d05d31c914a87c6611c10748aeb04b58e8f'),
  ('WBTC','Wrapped Bitcoin','WBTC',8,'ETHEREUM','0x2260fac5e5542a773aa44fbcfedf7c193bc2c599'),
  ('XRP','Ripple','XRP',6,'RIPPLE',NULL);

-- InsertProviderAsset
INSERT INTO public.provider_asset (asset_id,provider,external_id) VALUES
  ('1INCH','anchorage','1INCH'),
  ('1INCH','fireblocks','1INCH'),
  ('AAVE','anchorage','AAVE'),
  ('AAVE','fireblocks','AAVE'),
  ('ARB','anchorage','ARB'),
  ('ARB_ARB','fireblocks','ARB_ARB_FRK9'),
  ('ATOM','anchorage','ATOM'),
  ('ATOM','fireblocks','ATOM_COS'),
  ('BTC','anchorage','BTC'),
  ('BTC','fireblocks','BTC'),
  ('DOT','fireblocks','DOT'),
  ('ETH','anchorage','ETH'),
  ('ETH','fireblocks','ETH'),
  ('ETH_ARB','fireblocks','ETH-AETH'),
  ('ETH_ARBITRUM_TEST','anchorage','ETH_ARBITRUM_T'),
  ('ETH_ARBITRUM_TEST','fireblocks','ETH-AETH_SEPOLIA'),
  ('ETH_OPT','fireblocks','ETH-OPT'),
  ('ETH_OPT_KOVAN','fireblocks','ETH-OPT_KOV'),
  ('ETH_OPT_SEPOLIA','fireblocks','ETH-OPT_SEPOLIA'),
  ('ETH_ZKSYNC_TEST','anchorage','ETH_ZKSYNC_T'),
  ('ETH_ZKSYNC_TEST','fireblocks','ETH_ZKSYNC_ERA_SEPOLIA'),
  ('LTC','anchorage','LTC'),
  ('LTC','fireblocks','LTC'),
  ('MATIC','anchorage','MATIC'),
  ('MATIC','fireblocks','MATIC'),
  ('MORPHO','anchorage','MORPHO'),
  ('POL','anchorage','POL'),
  ('POL','fireblocks','POL_ETH_9RYQ'),
  ('POL_POLYGON','anchorage','POL_POLYGON'),
  ('POL_POLYGON','fireblocks','MATIC_POLYGON'),
  ('PORTAL','anchorage','PORTAL'),
  ('SOL','fireblocks','SOL'),
  ('SOL_DEVNET','anchorage','SOL_TD'),
  ('SOL_TEST','fireblocks','SOL_TEST'),
  ('SUI_TEST','anchorage','SUI_T'),
  ('SUSHI','anchorage','SUSHI'),
  ('SUSHI','fireblocks','SUSHI'),
  ('UNI','anchorage','UNI'),
  ('UNI','fireblocks','UNI'),
  ('USDC','anchorage','USDC'),
  ('USDC','fireblocks','USDC'),
  ('USDC_ARBITRUM','fireblocks','USDC_ARB_3SBJ'),
  ('USDC_POLYGON','fireblocks','USDC_POLYGON'),
  ('USDT','anchorage','USDT'),
  ('USDT','fireblocks','USDT_ERC20'),
  ('USDT_POLYGON','fireblocks','USDT_POLYGON'),
  ('WBTC','anchorage','WBTC'),
  ('WBTC','fireblocks','WBTC'),
  ('XRP','anchorage','XRP'),
  ('XRP','fireblocks','XRP');
