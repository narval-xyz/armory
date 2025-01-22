INSERT INTO public.asset (id,"name",symbol,decimals,network_id,onchain_id) VALUES
  ('LINK_ZKSYNC_SEPOLIA','Chainlink','LINK',18,'ZKSYNC_SEPOLIA','0x23a1afd896c8c8876af46adc38521f4432658d1e');

INSERT INTO public.provider_asset (asset_id,provider,external_id) VALUES
  ('LINK_ZKSYNC_SEPOLIA','anchorage','LINK_ZKSYNC_T');
