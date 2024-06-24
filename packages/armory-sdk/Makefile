ARMORY_SDK_PROJECT_NAME := armory-sdk
ARMORY_SDK_PROJECT_DIR := ./packages/armory-sdk

# === Build ===

armory-sdk/build:
	npx nx build ${ARMORY_SDK_PROJECT_NAME}

# === Code format ===

armory-sdk/format:
	 npx nx format:write --projects ${ARMORY_SDK_PROJECT_NAME}

armory-sdk/lint:
	npx nx lint ${ARMORY_SDK_PROJECT_NAME} -- --fix

armory-sdk/format/check:
	 npx nx format:check --projects ${ARMORY_SDK_PROJECT_NAME}

armory-sdk/lint/check:
	npx nx lint ${ARMORY_SDK_PROJECT_NAME}

# === Testing ===

armory-sdk/test:
	make armory-sdk/test/type
	make armory-sdk/test/unit

armory-sdk/test/type:
	npx tsc \
		--project ${ARMORY_SDK_PROJECT_DIR}/tsconfig.lib.json \
		--noEmit

armory-sdk/test/unit:
	npx nx test:unit ${ARMORY_SDK_PROJECT_NAME} -- ${ARGS}

armory-sdk/test/unit/watch:
	make armory-sdk/test/unit ARGS=--watch

armory-sdk/test/e2e:
	npx nx test:e2e ${ARMORY_SDK_PROJECT_NAME} -- ${ARGS}

armory-sdk/test/e2e/watch:
	make armory-sdk/test/e2e ARGS=--watch

# === Code generation ===

armory-sdk/generate/-http-client:
	npx @openapitools/openapi-generator-cli generate \
		--input-spec ${INPUT_SPEC} \
		--output ${OUTPUT_DIR} \
		--generator-name typescript-axios \
		--remove-operation-id-prefix

	rm -rf ./${OUTPUT_DIR}/.openapi-generator \
		./${OUTPUT_DIR}/.gitignore \
		./${OUTPUT_DIR}/.npmignore \
		./${OUTPUT_DIR}/.openapi-generator-ignore \
		./${OUTPUT_DIR}/git_push.sh

armory-sdk/generate/auth-client:
		INPUT_SPEC=http://localhost:3005/docs-yaml \
		OUTPUT_DIR=packages/armory-sdk/src/lib/http/client/auth \
		make armory-sdk/generate/-http-client

armory-sdk/generate/vault-client:
		INPUT_SPEC=http://localhost:3011/docs-yaml \
		OUTPUT_DIR=packages/armory-sdk/src/lib/http/client/vault \
		make armory-sdk/generate/-http-client
