SIGNATURE_PROJECT_NAME := signature
SIGNATURE_PROJECT_DIR := ./packages/signature

# == Code format ==

signature/format:
	 npx nx format:write --projects ${SIGNATURE_PROJECT_NAME}

signature/lint:
	npx nx lint ${SIGNATURE_PROJECT_NAME} -- --fix

signature/format/check:
	 npx nx format:check --projects ${SIGNATURE_PROJECT_NAME}

signature/lint/check:
	npx nx lint ${SIGNATURE_PROJECT_NAME}

# == Testing ==

signature/test/type:
	npx tsc \
		--project ${SIGNATURE_PROJECT_DIR}/tsconfig.lib.json \
		--noEmit

signature/test/unit:
	npx nx test:unit ${SIGNATURE_PROJECT_NAME} -- ${ARGS}

signature/test/unit/watch:
	make signature/test/unit ARGS=--watch
