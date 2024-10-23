POLICY_ENGINE_PROJECT_NAME := policy-engine
POLICY_ENGINE_PROJECT_DIR := ./apps/policy-engine
POLICY_ENGINE_DATABASE_SCHEMA := ${POLICY_ENGINE_PROJECT_DIR}/src/shared/module/persistence/schema/schema.prisma
POLICY_ENGINE_REGO_DIST = ./dist/rego
REGAL_FORMAT ?= pretty

# === Start ===

policy-engine/start/dev:
	npx nx serve ${POLICY_ENGINE_PROJECT_NAME}

policy-engine/start/prod:
	node ./dist/apps/policy-engine/main.js

# === Setup ===

policy-engine/setup:
	make policy-engine/copy-default-env
	make policy-engine/rego/build
	make policy-engine/db/setup
	make policy-engine/test/db/setup

policy-engine/copy-default-env:
	cp ${POLICY_ENGINE_PROJECT_DIR}/.env.default ${POLICY_ENGINE_PROJECT_DIR}/.env
	cp ${POLICY_ENGINE_PROJECT_DIR}/.env.test.default ${POLICY_ENGINE_PROJECT_DIR}/.env.test

# === Build ===

policy-engine/build/script:
	npx tsc --project ${POLICY_ENGINE_PROJECT_DIR}/tsconfig.app.json
	npx tsc-alias --project ${POLICY_ENGINE_PROJECT_DIR}/tsconfig.app.json

policy-engine/build:
	npx nx build ${POLICY_ENGINE_PROJECT_NAME}

# === Code format ===

policy-engine/lint:
	npx nx lint ${POLICY_ENGINE_PROJECT_NAME} -- --fix

policy-engine/lint/check:
	npx nx lint ${POLICY_ENGINE_PROJECT_NAME}

policy-engine/format:
	npx nx format:write --projects ${POLICY_ENGINE_PROJECT_NAME}

policy-engine/format/check:
	npx nx format:check --projects ${POLICY_ENGINE_PROJECT_NAME}

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

policy-engine/db/migrate/deploy:
	npx dotenv -e ${POLICY_ENGINE_PROJECT_DIR}/.env -- \
		prisma migrate deploy \
			--schema ${POLICY_ENGINE_DATABASE_SCHEMA}

policy-engine/db/create-migration:
	npx dotenv -e ${POLICY_ENGINE_PROJECT_DIR}/.env -- \
		prisma migrate dev \
			--schema ${POLICY_ENGINE_DATABASE_SCHEMA} \
			--name ${NAME} \
			--create-only

policy-engine/db/seed:
	npx dotenv -e ${POLICY_ENGINE_PROJECT_DIR}/.env -- \
		ts-node -r tsconfig-paths/register \
			--project ${POLICY_ENGINE_PROJECT_DIR}/tsconfig.app.json \
			${POLICY_ENGINE_PROJECT_DIR}/src/shared/module/persistence/seed.ts

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
	make policy-engine/test/type
	make policy-engine/test/unit
	make policy-engine/test/integration
	make policy-engine/test/e2e

# === Open Policy Agent & Rego ===

policy-engine/rego/build:
	rm -rf ${POLICY_ENGINE_REGO_DIST}
	mkdir -p ${POLICY_ENGINE_REGO_DIST}
	opa build \
		--target wasm \
		--entrypoint main/evaluate \
		--bundle ${POLICY_ENGINE_PROJECT_DIR}/src/resource/open-policy-agent/rego \
		--ignore "__test__" \
		--ignore "policies" \
		--output ${POLICY_ENGINE_REGO_DIST}/bundle.tar.gz
	tar -xzf ${POLICY_ENGINE_REGO_DIST}/bundle.tar.gz -C ${POLICY_ENGINE_REGO_DIST}

policy-engine/rego/test:
	opa test \
		--format="pretty" \
		${POLICY_ENGINE_PROJECT_DIR}/src/resource/open-policy-agent/rego \
		--verbose \
		${ARGS}

policy-engine/rego/format:
	opa fmt \
		--write ${POLICY_ENGINE_PROJECT_DIR}/src/resource/open-policy-agent/rego

policy-engine/rego/format/check:
	opa fmt \
		--fail ${POLICY_ENGINE_PROJECT_DIR}/src/resource/open-policy-agent/rego

policy-engine/rego/syntax/check:
	opa check \
		--strict \
		${POLICY_ENGINE_PROJECT_DIR}/src/resource/open-policy-agent/rego

policy-engine/rego/lint/fix:
	regal fix \
		${POLICY_ENGINE_PROJECT_DIR}/src/resource/open-policy-agent/rego \
		--config-file .regal/config.yaml

policy-engine/rego/lint/check:
	regal lint \
		--format ${REGAL_FORMAT} \
		${POLICY_ENGINE_PROJECT_DIR}/src/resource/open-policy-agent/rego \
		--config-file .regal/config.yaml

policy-engine/rego/test/watch:
	make policy-engine/rego/test ARGS=--watch

# === Docker ===

policy-engine/docker/build:
	docker buildx build \
		--platform linux/amd64 \
		--file deploy/policy-engine.dockerfile \
		--tag armory/policy-engine:latest \
		--cache-from armory/policy-engine:latest \
		. --load

policy-engine/docker/push:
	docker tag armory/policy-engine:latest 728783560968.dkr.ecr.us-east-2.amazonaws.com/armory/policy-engine:latest
	docker push 728783560968.dkr.ecr.us-east-2.amazonaws.com/armory/policy-engine:latest

policy-engine/docker/run:
	docker run --name policy-engine --env-file ./apps/policy-engine/.env -p 3010:3010 armory/policy-engine:latest

policy-engine/docker/migrate:
	docker run -it --rm --env-file ./apps/policy-engine/.env armory/policy-engine:latest /bin/bash ./db-migrator.sh
