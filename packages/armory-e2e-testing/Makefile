USER_JOURNEY_PROJECT_NAME := user-journey
USER_JOURNEY_PROJECT_DIR := ./packages/user-journey

# === Build ===

user-journey/build:
	npx nx build ${USER_JOURNEY_PROJECT_NAME}

# === Code format ===

user-journey/format:
	 npx nx format:write --projects ${USER_JOURNEY_PROJECT_NAME}

user-journey/lint:
	npx nx lint ${USER_JOURNEY_PROJECT_NAME} -- --fix

user-journey/format/check:
	 npx nx format:check --projects ${USER_JOURNEY_PROJECT_NAME}

user-journey/lint/check:
	npx nx lint ${USER_JOURNEY_PROJECT_NAME}

# === Testing ===

user-journey/test/type:
	npx tsc \
		--project ${USER_JOURNEY_PROJECT_DIR}/tsconfig.lib.json \
		--noEmit

user-journey/test/unit/watch:
	make user-journey/test/unit ARGS=--watch

user-journey/test/e2e:
	npx nx test:e2e ${USER_JOURNEY_PROJECT_NAME} -- ${ARGS}

user-journey/test/e2e/watch:
	make user-journey/test/e2e ARGS=--watch
