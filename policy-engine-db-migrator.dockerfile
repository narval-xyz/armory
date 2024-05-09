FROM 728783560968.dkr.ecr.us-east-2.amazonaws.com/armory/db-migrator-base:1.0.0

# Copy the schema & the migrations
COPY ./apps/policy-engine/src/shared/module/persistence/schema ./schema
