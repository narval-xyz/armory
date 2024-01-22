TRI_PROJECT_NAME := transaction-request-intent
TRI_PROJECT_DIR := ./packages/transaction-request-intent

# == Code format ==

transaction-request-intent/format:
	 npx nx format:write --projects ${TRI_PROJECT_NAME}

transaction-request-intent/lint:
	npx nx lint ${TRI_PROJECT_NAME} -- --fix

transaction-request-intent/format/check:
	 npx nx format:check --projects ${TRI_PROJECT_NAME}

transaction-request-intent/lint/check:
	npx nx lint ${TRI_PROJECT_NAME}

# == Testing ==

transaction-request-intent/test/type:
	npx tsc \
		--project ${TRI_PROJECT_DIR}/tsconfig.lib.json \
		--noEmit

transaction-request-intent/test/unit:
	npx nx test:unit ${TRI_PROJECT_NAME} -- ${ARGS}

transaction-request-intent/test/unit/watch:
	make transaction-request-intent/test/unit ARGS=--watch
