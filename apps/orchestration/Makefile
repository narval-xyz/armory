ORCHESTRATION_PROJECT_NAME := orchestration
ORCHESTRATION_PROJECT_DIR := ./apps/orchestration
ORCHESTRATION_DATABASE_SCHEMA := ${ORCHESTRATION_PROJECT_DIR}/src/shared/module/persistence/schema/schema.prisma

# For more terminal color codes, head over to https://opensource.com/article/19/9/linux-terminal-colors
TERM_NO_COLOR := \033[0m
TERM_GREEN := \033[0;32m

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

# == Code format ==

orchestration/format:
	 npx nx format:write --projects ${ORCHESTRATION_PROJECT_NAME}

orchestration/lint:
	npx nx lint ${ORCHESTRATION_PROJECT_NAME} -- --fix

orchestration/format/check:
	 npx nx format:check --projects ${ORCHESTRATION_PROJECT_NAME}

orchestration/lint/check:
	npx nx lint ${ORCHESTRATION_PROJECT_NAME}

# === Database ===

orchestration/db/generate-types:
	npx prisma generate \
		--schema ${ORCHESTRATION_DATABASE_SCHEMA}

orchestration/db/migrate:
	npx dotenv -e ${ORCHESTRATION_PROJECT_DIR}/.env -- \
		prisma migrate dev \
			--schema ${ORCHESTRATION_DATABASE_SCHEMA}

orchestration/db/setup:
	@echo ""
	@echo "${TERM_GREEN}🛠️  Setting up Orchestration development database${TERM_NO_COLOR}"
	@echo ""
	npx dotenv -e ${ORCHESTRATION_PROJECT_DIR}/.env -- \
		prisma migrate reset \
			--schema ${ORCHESTRATION_DATABASE_SCHEMA} \
			--force
	make orchestration/db/seed

	@echo ""
	@echo "${TERM_GREEN}🛠️  Setting up Orchestration test database${TERM_NO_COLOR}"
	@echo ""
	make orchestration/test/db/setup

orchestration/db/create-migration:
	npx dotenv -e ${ORCHESTRATION_PROJECT_DIR}/.env -- \
		prisma migrate dev \
			--schema ${ORCHESTRATION_DATABASE_SCHEMA} \
			--name ${NAME}

# To maintain seed data within their respective modules and then import them
# into the main seed.ts file for execution, it's necessary to compile the
# project and resolve its path aliases before running the vanilla JavaScript
# seed entry point.
orchestration/db/seed:
	npx tsc --project ${ORCHESTRATION_PROJECT_DIR}/tsconfig.app.json
	npx tsc-alias --project ${ORCHESTRATION_PROJECT_DIR}/tsconfig.app.json
	npx dotenv -e ${ORCHESTRATION_PROJECT_DIR}/.env -- \
		node dist/out-tsc/${ORCHESTRATION_PROJECT_DIR}/src/shared/module/persistence/seed.js

# === Testing ===

orchestration/test/db/setup:
	npx dotenv -e ${ORCHESTRATION_PROJECT_DIR}/.env.test --override -- \
		prisma migrate reset \
		--schema ${ORCHESTRATION_DATABASE_SCHEMA} \
		--skip-seed \
		--force

orchestration/test/type:
	make orchestration/db/generate-types
	npx tsc \
		--project ${ORCHESTRATION_PROJECT_DIR}/tsconfig.app.json \
		--noEmit

orchestration/test/unit:
	npx nx test:unit ${ORCHESTRATION_PROJECT_NAME} -- ${ARGS}

orchestration/test/integration:
	npx nx test:integration ${ORCHESTRATION_PROJECT_NAME} -- ${ARGS}

orchestration/test/e2e:
	npx nx test:e2e ${ORCHESTRATION_PROJECT_NAME} -- ${ARGS}

orchestration/test/unit/watch:
	make orchestration/test/unit ARGS=--watch

orchestration/test/integration/watch:
	make orchestration/test/integration ARGS=--watch

orchestration/test/e2e/watch:
	make orchestration/test/e2e ARGS=--watch

orchestration/test:
	make orchestration/test/unit
	make orchestration/test/integration
	make orchestration/test/e2e
