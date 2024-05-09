SDK_PROJECT_NAME := armory-sdk
SDK_PROJECT_DIR := ./packages/armory-sdk

# == Code format ==

armory-sdk/format:
	 npx nx format:write --projects ${SDK_PROJECT_NAME}

armory-sdk/lint:
	npx nx lint ${SDK_PROJECT_NAME} -- --fix

armory-sdk/format/check:
	 npx nx format:check --projects ${SDK_PROJECT_NAME}

armory-sdk/lint/check:
	npx nx lint ${SDK_PROJECT_NAME}

# == Testing ==

armory-sdk/test/type:
	npx tsc \
		--project ${SDK_PROJECT_DIR}/tsconfig.lib.json \
		--noEmit

armory-sdk/test/unit:
	npx nx test:unit ${SDK_PROJECT_NAME} -- ${ARGS}

armory-sdk/test/unit/watch:
	make armory-sdk/test/unit ARGS=--watch
