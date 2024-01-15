ORCHESTRATION_PROJECT_NAME := orchestration
ORCHESTRATION_PROJECT_DIR := ./apps/orchestration
ORCHESTRATION_DATABASE_SCHEMA := ${ORCHESTRATION_PROJECT_DIR}/src/shared/module/persistence/schema/schema.prisma

# === Start ===

orchestration/start/dev:
	npx nx serve ${ORCHESTRATION_PROJECT_NAME}

# === Setup ===

orchestration/setup:
	make orchestration/copy-default-env
	make orchestration/db/setup
	make orchestration/test/db/setup

orchestration/copy-default-env:
	cp ${ORCHESTRATION_PROJECT_DIR}/.env.default ${ORCHESTRATION_PROJECT_DIR}/.env
	cp ${ORCHESTRATION_PROJECT_DIR}/.env.test.default ${ORCHESTRATION_PROJECT_DIR}/.env.test

# === Database ===

orchestration/db/generate-types:
	npx prisma generate \
		--schema ${ORCHESTRATION_DATABASE_SCHEMA}

orchestration/db/migrate:
	npx dotenv -e ${ORCHESTRATION_PROJECT_DIR}/.env -- \
		prisma migrate dev \
			--schema ${ORCHESTRATION_DATABASE_SCHEMA}

orchestration/db/setup:
	npx dotenv -e ${ORCHESTRATION_PROJECT_DIR}/.env -- \
		prisma migrate reset \
			--schema ${ORCHESTRATION_DATABASE_SCHEMA} \
			--force
	make orchestration/db/seed

orchestration/db/create-migration:
	npx dotenv -e ${ORCHESTRATION_PROJECT_DIR}/.env -- \
		prisma migrate dev \
			--schema ${ORCHESTRATION_DATABASE_SCHEMA} \
			--name ${NAME}

# Reference: https://www.prisma.io/docs/orm/prisma-migrate/workflows/seeding#seeding-your-database-with-typescript-or-javascript
orchestration/db/seed:
	npx dotenv -e ${ORCHESTRATION_PROJECT_DIR}/.env -- \
		ts-node \
		--compiler-options "{\"module\":\"CommonJS\"}" \
		${ORCHESTRATION_PROJECT_DIR}/src/shared/module/persistence/seed.ts

# === Testing ===

orchestration/test/db/setup:
	npx dotenv -e ${ORCHESTRATION_PROJECT_DIR}/.env.test --override -- \
		prisma migrate reset \
		--schema ${ORCHESTRATION_DATABASE_SCHEMA} \
		--skip-seed \
		--force

orchestration/test/type:
	npx nx test:type ${ORCHESTRATION_PROJECT_NAME}

orchestration/test/unit:
	npx nx test:unit ${ORCHESTRATION_PROJECT_NAME}

orchestration/test/integration:
	npx nx test:integration ${ORCHESTRATION_PROJECT_NAME}

orchestration/test/e2e:
	npx nx test:e2e ${ORCHESTRATION_PROJECT_NAME}

orchestration/test:
	make orchestration/test/unit
	make orchestration/test/integration
	make orchestration/test/e2e
