ARMORY_E2E_TESTING_PROJECT_NAME := armory-e2e-testing
ARMORY_E2E_TESTING_PROJECT_DIR := ./packages/armory-e2e-testing

# === Build ===

armory-e2e-testing/build:
	npx nx build ${ARMORY_E2E_TESTING_PROJECT_NAME}

# === Code format ===

armory-e2e-testing/format:
	 npx nx format:write --projects ${ARMORY_E2E_TESTING_PROJECT_NAME}

armory-e2e-testing/lint:
	npx nx lint ${ARMORY_E2E_TESTING_PROJECT_NAME} -- --fix

armory-e2e-testing/format/check:
	 npx nx format:check --projects ${ARMORY_E2E_TESTING_PROJECT_NAME}

armory-e2e-testing/lint/check:
	npx nx lint ${ARMORY_E2E_TESTING_PROJECT_NAME}

# === Testing ===

armory-e2e-testing/test/type:
	npx tsc \
		--project ${ARMORY_E2E_TESTING_PROJECT_DIR}/tsconfig.lib.json \
		--noEmit

armory-e2e-testing/test/unit/watch:
	make armory-e2e-testing/test/unit ARGS=--watch

armory-e2e-testing/test/e2e:
	npx nx test:e2e ${ARMORY_E2E_TESTING_PROJECT_NAME} -- ${ARGS}

armory-e2e-testing/test/e2e/watch:
	make armory-e2e-testing/test/e2e ARGS=--watch
