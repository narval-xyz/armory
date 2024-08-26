ARMORY_PROJECT_NAME := armory
ARMORY_PROJECT_DIR := ./apps/armory
ARMORY_DATABASE_SCHEMA := ${ARMORY_PROJECT_DIR}/src/shared/module/persistence/schema/schema.prisma

# === Start ===

armory/start/dev:
	npx nx serve ${ARMORY_PROJECT_NAME} -- --port 9230

# === Setup ===

armory/setup:
	make armory/copy-default-env
	make armory/db/setup
	make armory/test/db/setup

armory/copy-default-env:
	cp ${ARMORY_PROJECT_DIR}/.env.default ${ARMORY_PROJECT_DIR}/.env
	cp ${ARMORY_PROJECT_DIR}/.env.test.default ${ARMORY_PROJECT_DIR}/.env.test

# === Build ===

armory/build/script:
	npx tsc --project ${ARMORY_PROJECT_DIR}/tsconfig.app.json
	npx tsc-alias --project ${ARMORY_PROJECT_DIR}/tsconfig.app.json

armory/build:
	npx nx build ${ARMORY_PROJECT_NAME}

# === Code format ===

armory/format:
	 npx nx format:write --projects ${ARMORY_PROJECT_NAME}

armory/lint:
	npx nx lint ${ARMORY_PROJECT_NAME} -- --fix

armory/format/check:
	 npx nx format:check --projects ${ARMORY_PROJECT_NAME}

armory/lint/check:
	npx nx lint ${ARMORY_PROJECT_NAME}

# === Database ===

armory/db/generate-types:
	npx prisma generate \
		--schema ${ARMORY_DATABASE_SCHEMA}

armory/db/migrate:
	npx dotenv -e ${ARMORY_PROJECT_DIR}/.env -- \
		prisma migrate dev \
			--schema ${ARMORY_DATABASE_SCHEMA}

armory/db/setup:
	@echo ""
	@echo "${TERM_GREEN}🛠️ Setting up Armory development database${TERM_NO_COLOR}"
	@echo ""
	npx dotenv -e ${ARMORY_PROJECT_DIR}/.env -- \
		prisma migrate reset \
			--schema ${ARMORY_DATABASE_SCHEMA} \
			--force
	make armory/db/seed

armory/db/migrate/deploy:
	npx dotenv -e ${ARMORY_PROJECT_DIR}/.env -- \
		prisma migrate deploy \
			--schema ${ARMORY_DATABASE_SCHEMA}


armory/db/create-migration:
	npx dotenv -e ${ARMORY_PROJECT_DIR}/.env -- \
		prisma migrate dev \
			--schema ${ARMORY_DATABASE_SCHEMA} \
			--name ${NAME} \
			--create-only

# To maintain seed data within their respective modules and then import them
# into the main seed.ts file for execution, it's necessary to compile the
# project and resolve its path aliases before running the vanilla JavaScript
# seed entry point.
armory/db/seed:
	make armory/build/script
	npx dotenv -e ${ARMORY_PROJECT_DIR}/.env -- \
		node dist/out-tsc/${ARMORY_PROJECT_DIR}/src/shared/module/persistence/seed.js

# === Testing ===

armory/test/db/setup:
	@echo ""
	@echo "${TERM_GREEN}🛠️ Setting up Armory test database${TERM_NO_COLOR}"
	@echo ""
	npx dotenv -e ${ARMORY_PROJECT_DIR}/.env.test --override -- \
		prisma migrate reset \
		--schema ${ARMORY_DATABASE_SCHEMA} \
		--skip-seed \
		--force

armory/test/type:
	make armory/db/generate-types
	npx tsc \
		--project ${ARMORY_PROJECT_DIR}/tsconfig.app.json \
		--noEmit

armory/test/unit:
	npx nx test:unit ${ARMORY_PROJECT_NAME} -- ${ARGS}

armory/test/integration:
	npx nx test:integration ${ARMORY_PROJECT_NAME} -- ${ARGS}

armory/test/e2e:
	npx nx test:e2e ${ARMORY_PROJECT_NAME} -- ${ARGS}

armory/test/unit/watch:
	make armory/test/unit ARGS=--watch

armory/test/integration/watch:
	make armory/test/integration ARGS=--watch

armory/test/e2e/watch:
	make armory/test/e2e ARGS=--watch

armory/test:
	make armory/test/type
	make armory/test/unit
	make armory/test/integration
	make armory/test/e2e

# === Price Module ===

armory/price/generate-coin-gecko-asset-id-index:
	make armory/build/script
	node dist/out-tsc/${ARMORY_PROJECT_DIR}/src/price/script/generate-coin-gecko-asset-id-index.script.js

# === Docker ===

armory/docker/build:
	docker buildx build \
		--platform linux/amd64 \
		--file deploy/armory.dockerfile \
		--tag armory/armory:latest \
		--cache-from armory/armory:latest \
		. --load

armory/docker/push:
	docker tag armory/armory:latest 728783560968.dkr.ecr.us-east-2.amazonaws.com/armory/armory:latest
	docker push 728783560968.dkr.ecr.us-east-2.amazonaws.com/armory/armory:latest

armory/docker/run:
	docker run \
		--name armory \
		--env-file ./apps/armory/.env \
		--publish 3005:3005 \
		armory/armory:latest

armory/docker/migrate:
	docker run \
		--interactive \
		--tty \
		--rm \
		--env-file ./apps/armory/.env armory/armory:latest \
		/bin/bash ./db-migrator.sh
