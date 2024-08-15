-- AlterTable
ALTER TABLE "client" ALTER COLUMN "entity_public_key" DROP NOT NULL,
ALTER COLUMN "policy_public_key" DROP NOT NULL;

-- CreateTable
CREATE TABLE "data_store_key" (
    "id" VARCHAR(255) NOT NULL,
    "client_id" TEXT NOT NULL,
    "store_type" TEXT NOT NULL,
    "public_key" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "data_store_key_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "data_store_key" ADD CONSTRAINT "data_store_key_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


--
-- MANUAL MIGRATION EDITS
--

-- Copy existing engine public keys into the client table; this fixes a bug that initially wrote the entityDatakey into this column.
UPDATE client
SET engine_public_key = (
    SELECT pub_key
    FROM engine
    WHERE engine.client_id = client.id
    LIMIT 1
)
WHERE EXISTS (
    SELECT 1
    FROM engine
    WHERE engine.client_id = client.id
);

-- Copy existing data keys into the data_store_key table
-- ... existing code ...

-- Copy existing data keys into the data_store_key table
INSERT INTO data_store_key (id, client_id, store_type, public_key, created_at, updated_at)
SELECT
    gen_random_uuid(),
    id,
    'entity',
    entity_public_key,
    created_at,
    updated_at
FROM client
WHERE entity_public_key IS NOT NULL AND entity_public_key != 'null'::jsonb;

INSERT INTO data_store_key (id, client_id, store_type, public_key, created_at, updated_at)
SELECT
    gen_random_uuid(),
    id,
    'policy',
    policy_public_key,
    created_at,
    updated_at
FROM client
WHERE policy_public_key IS NOT NULL AND policy_public_key != 'null'::jsonb;