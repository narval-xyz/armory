TRI_PROJECT_NAME := signature-verifier
TRI_PROJECT_DIR := ./packages/signature-verifier

# == Code format ==

signature-verifier/format:
	 npx nx format:write --projects ${TRI_PROJECT_NAME}

signature-verifier/lint:
	npx nx lint ${TRI_PROJECT_NAME} -- --fix

signature-verifier/format/check:
	 npx nx format:check --projects ${TRI_PROJECT_NAME}

signature-verifier/lint/check:
	npx nx lint ${TRI_PROJECT_NAME}

# == Testing ==

signature-verifier/test/type:
	npx tsc \
		--project ${TRI_PROJECT_DIR}/tsconfig.lib.json \
		--noEmit

signature-verifier/test/unit:
	npx nx test:unit ${TRI_PROJECT_NAME} -- ${ARGS}

signature-verifier/test/unit/watch:
	make signature-verifier/test/unit ARGS=--watch
