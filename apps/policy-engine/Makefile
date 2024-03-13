POLICY_ENGINE_PROJECT_NAME := policy-engine
POLICY_ENGINE_PROJECT_DIR := ./apps/policy-engine
POLICY_ENGINE_DATABASE_SCHEMA := ${POLICY_ENGINE_PROJECT_DIR}/src/shared/module/persistence/schema/schema.prisma

# === Start ===

policy-engine/start/dev:
	npx nx serve ${POLICY_ENGINE_PROJECT_NAME}

# === Setup ===

policy-engine/setup:
	make policy-engine/copy-default-env
	make policy-engine/rego/build
	make policy-engine/db/setup
	make policy-engine/test/db/setup
	make policy-engine/cli ARGS=provision

policy-engine/copy-default-env:
	cp ${POLICY_ENGINE_PROJECT_DIR}/.env.default ${POLICY_ENGINE_PROJECT_DIR}/.env
	cp ${POLICY_ENGINE_PROJECT_DIR}/.env.test.default ${POLICY_ENGINE_PROJECT_DIR}/.env.test

# === Build ===

policy-engine/build/script:
	npx tsc --project ${POLICY_ENGINE_PROJECT_DIR}/tsconfig.app.json
	npx tsc-alias --project ${POLICY_ENGINE_PROJECT_DIR}/tsconfig.app.json

# == Code format ==

policy-engine/format:
	npx nx format:write --projects ${POLICY_ENGINE_PROJECT_NAME}

policy-engine/lint:
	npx nx lint ${POLICY_ENGINE_PROJECT_NAME} -- --fix

policy-engine/format/check:
	npx nx format:check --projects ${POLICY_ENGINE_PROJECT_NAME}

policy-engine/lint/check:
	npx nx lint ${POLICY_ENGINE_PROJECT_NAME}

# === Database ===

policy-engine/db/generate-types:
	npx prisma generate \
		--schema ${POLICY_ENGINE_DATABASE_SCHEMA}

policy-engine/db/migrate:
	npx dotenv -e ${POLICY_ENGINE_PROJECT_DIR}/.env -- \
		prisma migrate dev \
			--schema ${POLICY_ENGINE_DATABASE_SCHEMA}

policy-engine/db/setup:
	@echo ""
	@echo "${TERM_GREEN}🛠️  Setting up Engine development database${TERM_NO_COLOR}"
	@echo ""
	npx dotenv -e ${POLICY_ENGINE_PROJECT_DIR}/.env -- \
		prisma migrate reset \
			--schema ${POLICY_ENGINE_DATABASE_SCHEMA} \
			--force
	make policy-engine/db/seed

	@echo ""
	@echo "${TERM_GREEN}🛠️  Setting up Engine test database${TERM_NO_COLOR}"
	@echo ""
	make policy-engine/test/db/setup

policy-engine/db/create-migration:
	npx dotenv -e ${POLICY_ENGINE_PROJECT_DIR}/.env -- \
		prisma migrate dev \
			--schema ${POLICY_ENGINE_DATABASE_SCHEMA} \
			--name ${NAME}

# To maintain seed data within their respective modules and then import them
# into the main seed.ts file for execution, it's necessary to compile the
# project and resolve its path aliases before running the vanilla JavaScript
# seed entry point.
policy-engine/db/seed:
	npx dotenv -e ${POLICY_ENGINE_PROJECT_DIR}/.env -- \
		ts-node -r tsconfig-paths/register --project ${POLICY_ENGINE_PROJECT_DIR}/tsconfig.app.json ${POLICY_ENGINE_PROJECT_DIR}/src/shared/module/persistence/seed.ts


# === Testing ===

policy-engine/test/db/setup:
	npx dotenv -e ${POLICY_ENGINE_PROJECT_DIR}/.env.test --override -- \
		prisma migrate reset \
		--schema ${POLICY_ENGINE_DATABASE_SCHEMA} \
		--skip-seed \
		--force


policy-engine/test/type:
	make policy-engine/db/generate-types
	npx tsc \
		--project ${POLICY_ENGINE_PROJECT_DIR}/tsconfig.app.json \
		--noEmit

policy-engine/test/unit:
	npx nx test:unit ${POLICY_ENGINE_PROJECT_NAME} -- ${ARGS}

policy-engine/test/unit/watch:
	make policy-engine/test/unit ARGS=--watch

policy-engine/test/integration:
	npx nx test:integration ${POLICY_ENGINE_PROJECT_NAME} -- ${ARGS}

policy-engine/test/integration/watch:
	make policy-engine/test/integration ARGS=--watch

policy-engine/test/e2e:
	npx nx test:e2e ${POLICY_ENGINE_PROJECT_NAME} -- ${ARGS}

policy-engine/test/e2e/watch:
	make policy-engine/test/e2e ARGS=--watch

policy-engine/test:
	make policy-engine/test/unit
	make policy-engine/test/integration
	make policy-engine/test/e2e

# === CLI ===

policy-engine/cli:
	npx dotenv -e ${POLICY_ENGINE_PROJECT_DIR}/.env -- \
		ts-node -r tsconfig-paths/register \
		--project ${POLICY_ENGINE_PROJECT_DIR}/tsconfig.app.json \
		${POLICY_ENGINE_PROJECT_DIR}/src/cli.ts ${ARGS}

# === Open Policy Agent & Rego ===

policy-engine/rego/build:
	rm -rf ./rego-build
	mkdir -p ./rego-build
	opa build \
		--target wasm \
		--entrypoint main/evaluate \
		--bundle ${POLICY_ENGINE_PROJECT_DIR}/src/opa/rego \
		--ignore "__test__" \
		--ignore "policies" \
		--output ./rego-build/policies.gz
	tar -xzf ./rego-build/policies.gz -C ./rego-build/

policy-engine/rego/eval:
	npx ts-node \
		--compiler-options "{\"module\":\"CommonJS\"}" \
		${POLICY_ENGINE_PROJECT_DIR}/src/opa/script/evaluation.script.ts

policy-engine/rego/translate:
	npx dotenv -e ${POLICY_ENGINE_PROJECT_DIR}/.env -- \
		ts-node -r tsconfig-paths/register \
		--project ${POLICY_ENGINE_PROJECT_DIR}/tsconfig.app.json ${POLICY_ENGINE_PROJECT_DIR}/src/opa/script/translate-legacy-policy.script.ts

policy-engine/rego/evaluation:
	npx dotenv -e ${POLICY_ENGINE_PROJECT_DIR}/.env -- \
		ts-node -r tsconfig-paths/register \
		--project ${POLICY_ENGINE_PROJECT_DIR}/tsconfig.app.json ${POLICY_ENGINE_PROJECT_DIR}/src/opa/script/evaluate-legacy-policy.script.ts

policy-engine/rego/test:
	opa test \
	--format="pretty" \
	${POLICY_ENGINE_PROJECT_DIR}/src/opa/rego \
	--ignore "generated" \
	--verbose \
	${ARGS}

policy-engine/rego/test/watch:
	make policy-engine/rego/test ARGS=--watch

