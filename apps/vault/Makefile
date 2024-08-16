VAULT_PROJECT_NAME := vault
VAULT_PROJECT_DIR := ./apps/vault
VAULT_DATABASE_SCHEMA := ${VAULT_PROJECT_DIR}/src/shared/module/persistence/schema/schema.prisma

# === Start ===

vault/start/dev:
	npx nx serve ${VAULT_PROJECT_NAME}

vault/start/prod:
	node ./dist/apps/vault/main.js

# === Setup ===

vault/setup:
	make vault/copy-default-env
	make vault/db/setup
	make vault/test/db/setup

vault/copy-default-env:
	cp ${VAULT_PROJECT_DIR}/.env.default ${VAULT_PROJECT_DIR}/.env
	cp ${VAULT_PROJECT_DIR}/.env.test.default ${VAULT_PROJECT_DIR}/.env.test

# === Build ===

vault/build:
	npx nx build ${VAULT_PROJECT_NAME}

# == Code format ==

vault/format:
	npx nx format:write --projects ${VAULT_PROJECT_NAME}

vault/lint:
	npx nx lint ${VAULT_PROJECT_NAME} -- --fix

vault/format/check:
	npx nx format:check --projects ${VAULT_PROJECT_NAME}

vault/lint/check:
	npx nx lint ${VAULT_PROJECT_NAME}

# === Database ===

vault/db/generate-types:
	npx prisma generate \
		--schema ${VAULT_DATABASE_SCHEMA}

vault/db/migrate:
	npx dotenv -e ${VAULT_PROJECT_DIR}/.env -- \
		prisma migrate dev \
			--schema ${VAULT_DATABASE_SCHEMA}

vault/db/setup:
	@echo ""
	@echo "${TERM_GREEN}🛠️  Setting up Vault development database${TERM_NO_COLOR}"
	@echo ""
	npx dotenv -e ${VAULT_PROJECT_DIR}/.env -- \
		prisma migrate reset \
			--schema ${VAULT_DATABASE_SCHEMA} \
			--force
	make vault/db/seed

vault/db/migrate/deploy:
	npx dotenv -e ${VAULT_PROJECT_DIR}/.env -- \
		prisma migrate deploy \
			--schema ${VAULT_DATABASE_SCHEMA}

vault/db/create-migration:
	npx dotenv -e ${VAULT_PROJECT_DIR}/.env -- \
		prisma migrate dev \
			--schema ${VAULT_DATABASE_SCHEMA} \
			--name ${NAME} \
			--create-only

vault/db/seed:
	npx dotenv -e ${VAULT_PROJECT_DIR}/.env -- \
		ts-node -r tsconfig-paths/register \
			--project ${VAULT_PROJECT_DIR}/tsconfig.app.json \
			${VAULT_PROJECT_DIR}/src/shared/module/persistence/seed.ts

# === Testing ===

vault/test/db/setup:
	npx dotenv -e ${VAULT_PROJECT_DIR}/.env.test --override -- \
		prisma migrate reset \
		--schema ${VAULT_DATABASE_SCHEMA} \
		--skip-seed \
		--force


vault/test/type:
	make vault/db/generate-types
	npx tsc \
		--project ${VAULT_PROJECT_DIR}/tsconfig.app.json \
		--noEmit

vault/test/unit:
	npx nx test:unit ${VAULT_PROJECT_NAME} -- ${ARGS}

vault/test/unit/watch:
	make vault/test/unit ARGS=--watch

vault/test/integration:
	npx nx test:integration ${VAULT_PROJECT_NAME} -- ${ARGS}

vault/test/integration/watch:
	make vault/test/integration ARGS=--watch

vault/test/e2e:
	npx nx test:e2e ${VAULT_PROJECT_NAME} -- ${ARGS}

vault/test/e2e/watch:
	make vault/test/e2e ARGS=--watch

vault/test:
	make vault/test/type
	make vault/test/unit
	make vault/test/integration
	make vault/test/e2e

# === Docker ===

vault/docker/build:
	docker buildx build \
		--platform linux/amd64 \
		-f deploy/vault.dockerfile \
		-t armory/vault:latest \
		--cache-from armory/vault:latest \
		. --load

vault/docker/push:
	docker tag armory/vault:latest 728783560968.dkr.ecr.us-east-2.amazonaws.com/armory/vault:latest
	docker push 728783560968.dkr.ecr.us-east-2.amazonaws.com/armory/vault:latest

vault/docker/run:
	docker run --name vault --env-file ./apps/vault/.env -p 3011:3011 armory/vault:latest

vault/docker/migrate:
	docker run -it --rm --env-file ./apps/vault/.env armory/vault:latest /bin/bash ./db-migrator.sh
