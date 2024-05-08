FROM armory/db-migrator-base:latest

# Copy the schema & the migrations
COPY ./apps/vault/src/shared/module/persistence/schema ./schema

