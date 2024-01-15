AUTHZ_PROJECT_NAME := authz
AUTHZ_PROJECT_DIR := ./apps/authz

# === Start ===

authz/start/dev:
	npx nx serve ${AUTHZ_PROJECT_NAME}

# === Setup ===

authz/setup:
	make authz/copy-default-env

authz/copy-default-env:
	cp ${AUTHZ_PROJECT_DIR}/.env.default ${AUTHZ_PROJECT_DIR}/.env
	cp ${AUTHZ_PROJECT_DIR}/.env.test.default ${AUTHZ_PROJECT_DIR}/.env.test

# === Testing ===

authz/test/type:
	npx nx test:type ${AUTHZ_PROJECT_NAME}

authz/test/unit:
	npx nx test:unit ${AUTHZ_PROJECT_NAME}

authz/test/integration:
	npx nx test:integration ${AUTHZ_PROJECT_NAME}

authz/test/e2e:
	npx nx test:e2e ${AUTHZ_PROJECT_NAME}

# === Open Policy Agent & Rego ===

authz/rego/bundle:
	opa build \
		--bundle ${AUTHZ_PROJECT_DIR}/src/app/opa/rego \
		--output ${AUTHZ_PROJECT_DIR}/src/app/opa/rego/policies.tar.gz

authz/rego/eval:
	opa eval \
		--format="pretty" \
		--bundle ${AUTHZ_PROJECT_DIR}/src/app/opa/rego/policies.tar.gz \
		--input ${AUTHZ_PROJECT_DIR}/src/app/opa/rego/input.json \
		'data.main.evaluate'

authz/rego/test:
	opa test \
	--format="pretty" \
	${AUTHZ_PROJECT_DIR}/src/app/opa/rego/lib \
	--verbose \
	--watch

authz/rego/compile:
	mkdir -p ./rego-build
	opa build \
		--target wasm \
		--entrypoint main/evaluate \
		--output ./rego-build/policies.gz \
		${AUTHZ_PROJECT_DIR}/src/app/opa/rego/main.rego
	tar -xzf ./rego-build/policies.gz -C ./rego-build/
