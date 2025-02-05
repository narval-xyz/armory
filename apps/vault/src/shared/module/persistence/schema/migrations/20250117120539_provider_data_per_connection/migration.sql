BEGIN;

-- 1. Add new columns (nullable first)
ALTER TABLE provider_wallet ADD COLUMN connection_id TEXT;
ALTER TABLE provider_account ADD COLUMN connection_id TEXT;
ALTER TABLE provider_address ADD COLUMN connection_id TEXT;
ALTER TABLE provider_known_destination ADD COLUMN connection_id TEXT;
ALTER TABLE provider_transfer ADD COLUMN connection_id TEXT;


-- 2. Drop indexes per client_id
DROP INDEX "provider_account_client_id_external_id_key";
DROP INDEX "provider_address_client_id_external_id_key";
DROP INDEX "provider_known_destination_client_id_external_id_key";
DROP INDEX "provider_wallet_client_id_external_id_key";


-- 3. Create temporary tables to store ID mappings
CREATE TEMP TABLE wallet_id_mapping (
    old_id TEXT,
    new_id TEXT,
    client_id TEXT,
    external_id TEXT,
    connection_id TEXT
);

CREATE TEMP TABLE account_id_mapping (
    old_id TEXT,
    new_id TEXT,
    client_id TEXT,
    external_id TEXT,
    connection_id TEXT
);

CREATE TEMP TABLE address_id_mapping (
    old_id TEXT,
    new_id TEXT,
    client_id TEXT,
    external_id TEXT,
    connection_id TEXT
);

CREATE TEMP TABLE known_destination_id_mapping (
    old_id TEXT,
    new_id TEXT,
    client_id TEXT,
    external_id TEXT,
    connection_id TEXT
);

-- 4. For wallets with mapping
WITH inserted_wallets AS (
    INSERT INTO provider_wallet (
        id,
        label,
        client_id,
        external_id,
        provider,
        created_at,
        updated_at,
        connection_id
    )
    SELECT 
        gen_random_uuid(),
        w.label,
        w.client_id,
        w.external_id,
        w.provider,
        w.created_at,
        w.updated_at,
        pwc.connection_id
    FROM provider_wallet w
    JOIN provider_wallet_connection pwc ON w.id = pwc.wallet_id
    WHERE NOT EXISTS (
        SELECT 1 
        FROM provider_wallet w2 
        WHERE w2.client_id = w.client_id 
        AND w2.external_id = w.external_id 
        AND w2.connection_id = pwc.connection_id
    )
    RETURNING id as new_id, client_id, external_id, connection_id
)
INSERT INTO wallet_id_mapping (old_id, new_id, client_id, external_id, connection_id)
SELECT w.id as old_id, i.new_id, i.client_id, i.external_id, i.connection_id
FROM provider_wallet w
JOIN provider_wallet_connection pwc ON w.id = pwc.wallet_id
JOIN inserted_wallets i ON w.client_id = i.client_id 
    AND w.external_id = i.external_id 
    AND pwc.connection_id = i.connection_id;

-- For known destinations with mapping
WITH inserted_known_destinations AS (
    INSERT INTO provider_known_destination (
        id,
        client_id,
        external_id,
        external_classification,
        address,
        label,
        asset_id,
        network_id,
        created_at,
        updated_at,
        provider,
        connection_id
    )
    SELECT 
        gen_random_uuid(),
        kd.client_id,
        kd.external_id,
        kd.external_classification,
        kd.address,
        kd.label,
        kd.asset_id,
        kd.network_id,
        kd.created_at,
        kd.updated_at,
        kd.provider,
        kdc.connection_id
    FROM provider_known_destination kd
    JOIN provider_known_destination_connection kdc ON kd.id = kdc.known_destination_id
    WHERE NOT EXISTS (
        SELECT 1 
        FROM provider_known_destination kd2 
        WHERE kd2.client_id = kd.client_id 
        AND kd2.external_id = kd.external_id 
        AND kd2.connection_id = kdc.connection_id
    )
    RETURNING id as new_id, client_id, external_id, connection_id
)
INSERT INTO known_destination_id_mapping (old_id, new_id, client_id, external_id, connection_id)
SELECT kd.id as old_id, i.new_id, i.client_id, i.external_id, i.connection_id
FROM provider_known_destination kd
JOIN provider_known_destination_connection kdc ON kd.id = kdc.known_destination_id
JOIN inserted_known_destinations i ON kd.client_id = i.client_id 
    AND kd.external_id = i.external_id 
    AND kdc.connection_id = i.connection_id;

-- For accounts with mapping
WITH inserted_accounts AS (
    INSERT INTO provider_account (
        id,
        label,
        client_id,
        provider,
        external_id,
        wallet_id,
        network_id,
        created_at,
        updated_at,
        connection_id
    )
    SELECT 
        gen_random_uuid(),
        a.label,
        a.client_id,
        a.provider,
        a.external_id,
        w.id,
        a.network_id,
        a.created_at,
        a.updated_at,
        w.connection_id
    FROM provider_account a
    JOIN provider_wallet w_old ON a.wallet_id = w_old.id
    JOIN provider_wallet w ON w.client_id = w_old.client_id 
        AND w.external_id = w_old.external_id
    WHERE NOT EXISTS (
        SELECT 1 
        FROM provider_account a2 
        WHERE a2.client_id = a.client_id 
        AND a2.external_id = a.external_id 
        AND a2.connection_id = w.connection_id
    )
    RETURNING id as new_id, client_id, external_id, connection_id
)
INSERT INTO account_id_mapping (old_id, new_id, client_id, external_id, connection_id)
SELECT a.id as old_id, i.new_id, i.client_id, i.external_id, i.connection_id
FROM provider_account a
JOIN provider_wallet w_old ON a.wallet_id = w_old.id
JOIN provider_wallet w ON w.client_id = w_old.client_id 
    AND w.external_id = w_old.external_id
JOIN inserted_accounts i ON a.client_id = i.client_id 
    AND a.external_id = i.external_id 
    AND w.connection_id = i.connection_id;

-- For addresses with mapping
WITH inserted_addresses AS (
    INSERT INTO provider_address (
        id,
        client_id,
        provider,
        external_id,
        account_id,
        address,
        created_at,
        updated_at,
        connection_id
    )
    SELECT 
        gen_random_uuid(),
        addr.client_id,
        addr.provider,
        addr.external_id,
        a.id,
        addr.address,
        addr.created_at,
        addr.updated_at,
        a.connection_id
    FROM provider_address addr
    JOIN provider_account a_old ON addr.account_id = a_old.id
    JOIN provider_account a ON a.client_id = a_old.client_id 
        AND a.external_id = a_old.external_id
    WHERE NOT EXISTS (
        SELECT 1 
        FROM provider_address addr2 
        WHERE addr2.client_id = addr.client_id 
        AND addr2.external_id = addr.external_id 
        AND addr2.connection_id = a.connection_id
    )
    RETURNING id as new_id, client_id, external_id, connection_id
)
INSERT INTO address_id_mapping (old_id, new_id, client_id, external_id, connection_id)
SELECT addr.id as old_id, i.new_id, i.client_id, i.external_id, i.connection_id
FROM provider_address addr
JOIN provider_account a_old ON addr.account_id = a_old.id
JOIN provider_account a ON a.client_id = a_old.client_id 
    AND a.external_id = a_old.external_id
JOIN inserted_addresses i ON addr.client_id = i.client_id 
    AND addr.external_id = i.external_id 
    AND a.connection_id = i.connection_id;


DO $$
DECLARE
    wallet_count INTEGER;
    account_count INTEGER;
    address_count INTEGER;
    transfer_count INTEGER;
    sample_mapping RECORD;
BEGIN
    -- Check mapping tables
    SELECT COUNT(*) INTO wallet_count FROM wallet_id_mapping;
    SELECT COUNT(*) INTO account_count FROM account_id_mapping;
    SELECT COUNT(*) INTO address_count FROM address_id_mapping;
    SELECT COUNT(*) INTO transfer_count FROM provider_transfer;
    
    RAISE NOTICE 'Mapping table counts: wallets=%, accounts=%, addresses=%, transfers=%', 
        wallet_count, account_count, address_count, transfer_count;

    -- Check a sample mapping
    SELECT * INTO sample_mapping 
    FROM (
        SELECT 
            t.id as old_transfer_id,
            t.source_wallet_id as old_source_wallet,
            sw_map.new_id as mapped_source_wallet,
            t.destination_wallet_id as old_dest_wallet,
            dw_map.new_id as mapped_dest_wallet
        FROM provider_transfer t
        LEFT JOIN wallet_id_mapping sw_map ON t.source_wallet_id = sw_map.old_id
        LEFT JOIN wallet_id_mapping dw_map ON t.destination_wallet_id = dw_map.old_id
        LIMIT 1
    ) subquery;

    IF sample_mapping IS NOT NULL THEN
        RAISE NOTICE 'Sample mapping: %', sample_mapping;
    ELSE
        RAISE NOTICE 'No sample mapping found';
    END IF;

    -- Check for NULL required fields
    PERFORM t.id
    FROM provider_transfer t
    WHERE client_id IS NULL 
       OR external_id IS NULL 
       OR asset_id IS NULL 
       OR network_fee_attribution IS NULL 
       OR provider IS NULL;
    
    IF FOUND THEN
        RAISE NOTICE 'Found transfers with NULL required fields';
    ELSE
        RAISE NOTICE 'No NULL required fields found';
    END IF;
END $$;


-- For transfers (using mappings)
WITH transfer_conn AS (
    SELECT
        t.id AS transfer_id,
        
        -- Get whichever connection_id is available
        COALESCE(
          sw_map.connection_id,
          sa_map.connection_id,
          saddr_map.connection_id
        ) AS new_connection_id,
        
        -- “New” source fields from the mapping tables
        sw_map.new_id    AS new_source_wallet_id,
        sa_map.new_id    AS new_source_account_id,
        saddr_map.new_id AS new_source_address_id
        
    FROM provider_transfer t
    LEFT JOIN wallet_id_mapping   sw_map    ON t.source_wallet_id   = sw_map.old_id
    LEFT JOIN account_id_mapping  sa_map    ON t.source_account_id  = sa_map.old_id
    LEFT JOIN address_id_mapping  saddr_map ON t.source_address_id  = saddr_map.old_id
)
UPDATE provider_transfer t
SET 
  -- If we found a mapping for wallet/account/address, use that new ID;
  -- otherwise, keep the existing source_* field.
  source_wallet_id = COALESCE(transfer_conn.new_source_wallet_id, t.source_wallet_id),
  source_account_id = COALESCE(transfer_conn.new_source_account_id, t.source_account_id),
  source_address_id = COALESCE(transfer_conn.new_source_address_id, t.source_address_id),
  
  -- Overwrite connection_id with whichever was found
  connection_id = COALESCE(transfer_conn.new_connection_id, t.connection_id)
FROM transfer_conn
WHERE t.id = transfer_conn.transfer_id;

DO $$ 
DECLARE
    old_wallet_count INTEGER;
    new_wallet_count INTEGER;
    expected_wallet_count INTEGER;
BEGIN
    -- Count old wallets
    SELECT COUNT(*) INTO old_wallet_count 
    FROM provider_wallet w
    WHERE w.connection_id IS NULL;
    
    -- Count new wallets
    SELECT COUNT(*) INTO new_wallet_count 
    FROM provider_wallet w
    WHERE w.connection_id IS NOT NULL;
    
    -- Count expected wallets (from wallet connections)
    SELECT COUNT(*) INTO expected_wallet_count 
    FROM provider_wallet_connection;
    
    -- Verify we have the expected number of new records
    IF new_wallet_count != expected_wallet_count THEN
        RAISE EXCEPTION 'Migration verification failed: got % new wallets, expected %', 
            new_wallet_count, expected_wallet_count;
    END IF;

    RAISE NOTICE 'Verification passed: % old wallets, % new wallets created', 
        old_wallet_count, new_wallet_count;
END $$;

-- 5. Delete old records after successful migration
DELETE FROM provider_transfer WHERE connection_id IS NULL;
DELETE FROM provider_address WHERE connection_id IS NULL;
DELETE FROM provider_account WHERE connection_id IS NULL;
DELETE FROM provider_known_destination WHERE connection_id IS NULL;
DELETE FROM provider_wallet WHERE connection_id IS NULL;

-- 6. Verify migrations completed
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM provider_wallet WHERE connection_id IS NULL) THEN
    RAISE EXCEPTION 'Data migration incomplete: found wallet(s) without connection_id';
  END IF;
  IF EXISTS (SELECT 1 FROM provider_known_destination WHERE connection_id IS NULL) THEN
    RAISE EXCEPTION 'Data migration incomplete: found known destination(s) without connection_id';
  END IF;
  IF EXISTS (SELECT 1 FROM provider_account WHERE connection_id IS NULL) THEN
    RAISE EXCEPTION 'Data migration incomplete: found account(s) without connection_id';
  END IF;
  IF EXISTS (SELECT 1 FROM provider_address WHERE connection_id IS NULL) THEN
    RAISE EXCEPTION 'Data migration incomplete: found address(es) without connection_id';
  END IF;
  IF EXISTS (SELECT 1 FROM provider_transfer WHERE connection_id IS NULL) THEN
    RAISE EXCEPTION 'Data migration incomplete: found transfer(s) without connection_id';
  END IF;
END $$;

-- -- 7. Make columns NOT NULL
ALTER TABLE provider_wallet ALTER COLUMN connection_id SET NOT NULL;
ALTER TABLE provider_account ALTER COLUMN connection_id SET NOT NULL;
ALTER TABLE provider_address ALTER COLUMN connection_id SET NOT NULL;
ALTER TABLE provider_known_destination ALTER COLUMN connection_id SET NOT NULL;
ALTER TABLE provider_transfer ALTER COLUMN connection_id SET NOT NULL;

-- 8. Check for potential violations of new unique constraints
DO $$ 
BEGIN
  -- Check wallets
  IF EXISTS (
    SELECT client_id, external_id, connection_id, COUNT(*)
    FROM provider_wallet
    GROUP BY client_id, external_id, connection_id
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'Found duplicate wallet entries that would violate new unique constraint';
  END IF;

  -- Check accounts
  IF EXISTS (
    SELECT client_id, external_id, connection_id, COUNT(*)
    FROM provider_account
    GROUP BY client_id, external_id, connection_id
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'Found duplicate account entries that would violate new unique constraint';
  END IF;

  -- Check addresses
  IF EXISTS (
    SELECT client_id, external_id, connection_id, COUNT(*)
    FROM provider_address
    GROUP BY client_id, external_id, connection_id
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'Found duplicate address entries that would violate new unique constraint';
  END IF;

  -- Check known destinations
  IF EXISTS (
    SELECT client_id, external_id, connection_id, COUNT(*)
    FROM provider_known_destination
    GROUP BY client_id, external_id, connection_id
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'Found duplicate known destination entries that would violate new unique constraint';
  END IF;
END $$;

-- 9. Create new unique indexes
CREATE UNIQUE INDEX "provider_account_client_id_connection_id_external_id_key" 
  ON "provider_account"("client_id", "connection_id", "external_id");
CREATE UNIQUE INDEX "provider_address_client_id_connection_id_external_id_key" 
  ON "provider_address"("client_id", "connection_id", "external_id");
CREATE UNIQUE INDEX "provider_known_destination_client_id_connection_id_external_key" 
  ON "provider_known_destination"("client_id", "connection_id", "external_id");
CREATE UNIQUE INDEX "provider_wallet_client_id_connection_id_external_id_key" 
  ON "provider_wallet"("client_id", "connection_id", "external_id");

-- 10. Drop old tables
DROP TABLE provider_wallet_connection;
DROP TABLE provider_known_destination_connection;

-- 10. Add foreign key constraints
ALTER TABLE "provider_wallet" ADD CONSTRAINT "provider_wallet_connection_id_fkey" FOREIGN KEY ("connection_id") REFERENCES "provider_connection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "provider_account" ADD CONSTRAINT "provider_account_connection_id_fkey" FOREIGN KEY ("connection_id") REFERENCES "provider_connection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "provider_address" ADD CONSTRAINT "provider_address_connection_id_fkey" FOREIGN KEY ("connection_id") REFERENCES "provider_connection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "provider_known_destination" ADD CONSTRAINT "provider_known_destination_connection_id_fkey" FOREIGN KEY ("connection_id") REFERENCES "provider_connection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "provider_transfer" ADD CONSTRAINT "provider_transfer_connection_id_fkey" FOREIGN KEY ("connection_id") REFERENCES "provider_connection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

COMMIT;