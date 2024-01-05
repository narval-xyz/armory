ORCHESTRATION_PROJECT_NAME := apps/orchestration
ORCHESTRATION_PROJECT_DIR := ./apps/orchestration
ORCHESTRATION_DATABASE_SCHEMA := ${ORCHESTRATION_PROJECT_DIR}/src/persistence/schema/schema.prisma

orchestration/copy-default-env:
	cp ${ORCHESTRATION_PROJECT_DIR}/.env.default ${ORCHESTRATION_PROJECT_DIR}/.env

orchestration/db/generate-types:
	npx prisma generate \
		--schema ${ORCHESTRATION_DATABASE_SCHEMA}

orchestration/db/migrate:
	npx dotenv -e ${ORCHESTRATION_PROJECT_DIR}/.env -- \
		prisma migrate dev \
			--schema ${ORCHESTRATION_DATABASE_SCHEMA}

# Reference: https://www.prisma.io/docs/orm/prisma-migrate/workflows/seeding#seeding-your-database-with-typescript-or-javascript
orchestration/db/seed:
	npx dotenv -e ${ORCHESTRATION_PROJECT_DIR}/.env -- \
		ts-node \
		--compiler-options "{\"module\":\"CommonJS\"}" \
		${ORCHESTRATION_PROJECT_DIR}/src/persistence/seed.ts

orchestration/test/db/setup:
	npx dotenv -e ${ORCHESTRATION_PROJECT_DIR}/.env.test --override -- \
		prisma migrate reset \
		--schema ${ORCHESTRATION_DATABASE_SCHEMA} \
		--skip-seed \
		--force

orchestration/test/copy-default-env:
	cp ${ORCHESTRATION_PROJECT_DIR}/.env.test.default ${ORCHESTRATION_PROJECT_DIR}/.env.test

orchestration/test/type:
	npx nx test:type ${ORCHESTRATION_PROJECT_NAME}

orchestration/test/unit:
	npx nx test:unit ${ORCHESTRATION_PROJECT_NAME}

orchestration/test/integration:
	npx nx test:integration ${ORCHESTRATION_PROJECT_NAME}

orchestration/test/e2e:
	npx nx test:e2e ${ORCHESTRATION_PROJECT_NAME}
