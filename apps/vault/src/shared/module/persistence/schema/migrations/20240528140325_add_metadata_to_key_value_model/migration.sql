/*
  This migration script updates the "key_value" table by adding two new columns, client_id and collection,
  and populating them based on existing key values.
*/
-- AlterTable
ALTER TABLE "key_value"
ADD COLUMN "client_id" TEXT,
ADD COLUMN "collection" TEXT;


-- Fill collection for every row. It is the key from first character until ':'.
UPDATE "key_value" 
SET collection = LEFT(key, POSITION(':' IN key) - 1);

-- Fill client_id for every row. It is the key from first ':' until second ':'. Can be null if there is no character between the two ':'
UPDATE "key_value"
SET client_id = SUBSTRING(key, POSITION(':' IN key) + 1, CHAR_LENGTH(key) - POSITION(':' IN key) - POSITION(':' IN SUBSTRING(key FROM POSITION(':' IN key) + 1)));

-- Make collection not nullable.
ALTER TABLE "key_value" 
ALTER COLUMN "collection" SET NOT NULL;
