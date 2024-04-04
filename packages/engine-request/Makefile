ENGINE_REQUEST_PROJECT_NAME := engine-request
ENGINE_REQUEST_PROJECT_DIR := ./packages/engine-request

# == Code format ==

engine-request/format:
	 npx nx format:write --projects ${ENGINE_REQUEST_PROJECT_NAME}

engine-request/lint:
	npx nx lint ${ENGINE_REQUEST_PROJECT_NAME} -- --fix

engine-request/format/check:
	 npx nx format:check --projects ${ENGINE_REQUEST_PROJECT_NAME}

engine-request/lint/check:
	npx nx lint ${ENGINE_REQUEST_PROJECT_NAME}

# == Testing ==

engine-request/test/type:
	npx tsc \
		--project ${ENGINE_REQUEST_PROJECT_DIR}/tsconfig.lib.json \
		--noEmit

engine-request/test/unit:
	npx nx test:unit ${ENGINE_REQUEST_PROJECT_NAME} -- ${ARGS}

engine-request/test/unit/watch:
	make engine-request/test/unit ARGS=--watch
