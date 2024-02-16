AUTHZ_PROJECT_NAME := authz
AUTHZ_PROJECT_DIR := ./apps/authz
AUTHZ_DATABASE_SCHEMA := ${AUTHZ_PROJECT_DIR}/src/shared/module/persistence/schema/schema.prisma

# === Start ===

authz/start/dev:
	npx nx serve ${AUTHZ_PROJECT_NAME}

# === Setup ===

authz/setup:
	make authz/copy-default-env
	make authz/rego/build

authz/copy-default-env:
	cp ${AUTHZ_PROJECT_DIR}/.env.default ${AUTHZ_PROJECT_DIR}/.env
	cp ${AUTHZ_PROJECT_DIR}/.env.test.default ${AUTHZ_PROJECT_DIR}/.env.test

# == Code format ==

authz/format:
	npx nx format:write --projects ${AUTHZ_PROJECT_NAME}

authz/lint:
	npx nx lint ${AUTHZ_PROJECT_NAME} -- --fix

authz/format/check:
	npx nx format:check --projects ${AUTHZ_PROJECT_NAME}

authz/lint/check:
	npx nx lint ${AUTHZ_PROJECT_NAME}

# === Testing ===

authz/test/type:
	npx tsc \
		--project ${AUTHZ_PROJECT_DIR}/tsconfig.app.json \
		--noEmit

authz/test/unit:
	npx nx test:unit ${AUTHZ_PROJECT_NAME} -- ${ARGS}

authz/test/unit/watch:
	make authz/test/unit ARGS=--watch

authz/test/integration:
	npx nx test:integration ${AUTHZ_PROJECT_NAME} -- ${ARGS}

authz/test/integration/watch:
	make authz/test/integration ARGS=--watch

authz/test/e2e:
	npx nx test:e2e ${AUTHZ_PROJECT_NAME} -- ${ARGS}

authz/test/e2e/watch:
	make authz/test/e2e ARGS=--watch

authz/test:
	make authz/test/unit
	make authz/test/integration
	make authz/test/e2e

# === Open Policy Agent & Rego ===

authz/rego/build:
	rm -rf ./rego-build
	mkdir -p ./rego-build
	opa build \
		--target wasm \
		--entrypoint main/evaluate \
		--bundle ${AUTHZ_PROJECT_DIR}/src/opa/rego \
		--ignore "__test__" \
		--ignore "policies" \
		--output ./rego-build/policies.gz
	tar -xzf ./rego-build/policies.gz -C ./rego-build/

authz/rego/eval:
	npx ts-node \
		--compiler-options "{\"module\":\"CommonJS\"}" \
		${AUTHZ_PROJECT_DIR}/src/opa/script/evaluation.script.ts

authz/rego/translate:
	npx dotenv -e ${AUTHZ_PROJECT_DIR}/.env -- \
		ts-node -r tsconfig-paths/register \
		--project ${AUTHZ_PROJECT_DIR}/tsconfig.app.json ${AUTHZ_PROJECT_DIR}/src/opa/script/translate-legacy-policy.script.ts


authz/rego/test:
	opa test \
	--format="pretty" \
	${AUTHZ_PROJECT_DIR}/src/opa/rego \
	--ignore "generated" \
	--verbose \
	${ARGS}

authz/rego/test/watch:
	make authz/rego/test ARGS=--watch

