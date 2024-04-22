ENGINE_REQUEST_PROJECT_NAME := sdk
ENGINE_REQUEST_PROJECT_DIR := ./packages/sdk

# == Code format ==

sdk/format:
	 npx nx format:write --projects ${ENGINE_REQUEST_PROJECT_NAME}

sdk/lint:
	npx nx lint ${ENGINE_REQUEST_PROJECT_NAME} -- --fix

sdk/format/check:
	 npx nx format:check --projects ${ENGINE_REQUEST_PROJECT_NAME}

sdk/lint/check:
	npx nx lint ${ENGINE_REQUEST_PROJECT_NAME}

# == Testing ==

sdk/test/type:
	npx tsc \
		--project ${ENGINE_REQUEST_PROJECT_DIR}/tsconfig.lib.json \
		--noEmit

sdk/test/unit:
	npx nx test:unit ${ENGINE_REQUEST_PROJECT_NAME} -- ${ARGS}

sdk/test/unit/watch:
	make sdk/test/unit ARGS=--watch
