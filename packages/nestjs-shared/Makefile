POLICY_ENGINE_SHARED_PROJECT_NAME := nestjs-shared
POLICY_ENGINE_SHARED_PROJECT_DIR := ./packages/nestjs-shared

# == Code format ==

nestjs-shared/format:
	 npx nx format:write --projects ${POLICY_ENGINE_SHARED_PROJECT_NAME}

nestjs-shared/lint:
	npx nx lint ${POLICY_ENGINE_SHARED_PROJECT_NAME} -- --fix

nestjs-shared/format/check:
	 npx nx format:check --projects ${POLICY_ENGINE_SHARED_PROJECT_NAME}

nestjs-shared/lint/check:
	npx nx lint ${POLICY_ENGINE_SHARED_PROJECT_NAME}

# == Testing ==

nestjs-shared/test/type:
	npx tsc \
		--project ${POLICY_ENGINE_SHARED_PROJECT_DIR}/tsconfig.lib.json \
		--noEmit

nestjs-shared/test/unit:
	npx nx test:unit ${POLICY_ENGINE_SHARED_PROJECT_NAME} -- ${ARGS}

nestjs-shared/test/unit/watch:
	make nestjs-shared/test/unit ARGS=--watch
