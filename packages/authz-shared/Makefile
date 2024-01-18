AUTHZ_SHARED_PROJECT_NAME := authz-shared

authz-shared/test/unit:
	npx nx test:unit ${AUTHZ_SHARED_PROJECT_NAME} -- ${ARGS}

authz-shared/test/unit/watch:
	make authz-shared/test/unit ARGS=--watch
