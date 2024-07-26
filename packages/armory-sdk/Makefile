ARMORY_SDK_PROJECT_NAME := armory-sdk
ARMORY_SDK_PROJECT_DIR := ./packages/armory-sdk
ARMORY_SDK_DIST_DIR := ./dist/packages/armory-sdk

# === Build ===

armory-sdk/build:
	npx nx build ${ARMORY_SDK_PROJECT_NAME}
	@# This is a workaround to achieve importing modules by path like
	@# `@narval-xyz/armory-sdk/vault` or `@narval-xyz/armory-sdk/data-source` to
	@# avoid name clashing.
	@# For some reason, @wcalderipe couldn't make it work with the NX release
	@# build system when the option `external` is set to `none`. As a reminder,
	@# the `external` option is a crucial step in the build process to bundle the
	@# `signature` and `policy-engine-shared` into the SDK artifact.
	mv ${ARMORY_SDK_DIST_DIR}/src/* ${ARMORY_SDK_DIST_DIR}
	@# Delete the packages directory because it's not used by any built code and
	@# it increases the bundle size.
	rm -rf ${ARMORY_SDK_DIST_DIR}/{src,packages,__test__}

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
		OUTPUT_DIR=packages/armory-sdk/src/http/client/auth \
		make armory-sdk/generate/-http-client

armory-sdk/generate/vault-client:
		INPUT_SPEC=http://localhost:3011/docs-yaml \
		OUTPUT_DIR=packages/armory-sdk/src/http/client/vault \
		make armory-sdk/generate/-http-client
