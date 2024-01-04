AUTHZ_PROJECT_NAME := apps/authz-node
AUTHZ_PROJECT_DIR := ./apps/authz-node

authz/test/copy-default-env:
	cp ${AUTHZ_PROJECT_DIR}/.env.test.default ${AUTHZ_PROJECT_DIR}/.env.test

authz/test/type:
	npx nx test:type ${AUTHZ_PROJECT_NAME}

authz/test/unit:
	npx nx test:unit ${AUTHZ_PROJECT_NAME}

authz/test/integration:
	npx nx test:integration ${AUTHZ_PROJECT_NAME}

authz/test/e2e:
	npx nx test:e2e ${AUTHZ_PROJECT_NAME}
