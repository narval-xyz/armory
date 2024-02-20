AUTHZ_SHARED_PROJECT_NAME := authz-shared
AUTHZ_SHARED_PROJECT_DIR := ./packages/authz-shared

# == Code format ==

authz-shared/format:
	 npx nx format:write --projects ${AUTHZ_SHARED_PROJECT_NAME}

authz-shared/lint:
	npx nx lint ${AUTHZ_SHARED_PROJECT_NAME} -- --fix

authz-shared/format/check:
	 npx nx format:check --projects ${AUTHZ_SHARED_PROJECT_NAME}

authz-shared/lint/check:
	npx nx lint ${AUTHZ_SHARED_PROJECT_NAME}

# == Testing ==

authz-shared/test/type:
	npx tsc \
		--project ${AUTHZ_SHARED_PROJECT_DIR}/tsconfig.lib.json \
		--noEmit

authz-shared/test/unit:
	npx nx test:unit ${AUTHZ_SHARED_PROJECT_NAME} -- ${ARGS}

authz-shared/test/unit/watch:
	make authz-shared/test/unit ARGS=--watch
