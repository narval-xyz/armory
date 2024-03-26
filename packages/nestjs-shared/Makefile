NESTJS_SHARED_PROJECT_NAME := nestjs-shared
NESTJS_SHARED_PROJECT_DIR := ./packages/nestjs-shared

# == Code format ==

nestjs-shared/format:
	 npx nx format:write --projects ${NESTJS_SHARED_PROJECT_NAME}

nestjs-shared/lint:
	npx nx lint ${NESTJS_SHARED_PROJECT_NAME} -- --fix

nestjs-shared/format/check:
	 npx nx format:check --projects ${NESTJS_SHARED_PROJECT_NAME}

nestjs-shared/lint/check:
	npx nx lint ${NESTJS_SHARED_PROJECT_NAME}

# == Testing ==

nestjs-shared/test/type:
	npx tsc \
		--project ${NESTJS_SHARED_PROJECT_DIR}/tsconfig.lib.json \
		--noEmit

nestjs-shared/test/unit:
	npx nx test:unit ${NESTJS_SHARED_PROJECT_NAME} -- ${ARGS}

nestjs-shared/test/unit/watch:
	make nestjs-shared/test/unit ARGS=--watch
