POLICY_ENGINE_SHARED_PROJECT_NAME := policy-engine-shared
POLICY_ENGINE_SHARED_PROJECT_DIR := ./packages/policy-engine-shared

# == Code format ==

policy-engine-shared/format:
	 npx nx format:write --projects ${POLICY_ENGINE_SHARED_PROJECT_NAME}

policy-engine-shared/lint:
	npx nx lint ${POLICY_ENGINE_SHARED_PROJECT_NAME} -- --fix

policy-engine-shared/format/check:
	 npx nx format:check --projects ${POLICY_ENGINE_SHARED_PROJECT_NAME}

policy-engine-shared/lint/check:
	npx nx lint ${POLICY_ENGINE_SHARED_PROJECT_NAME}

# == Testing ==

policy-engine-shared/test/type:
	npx tsc \
		--project ${POLICY_ENGINE_SHARED_PROJECT_DIR}/tsconfig.lib.json \
		--noEmit

policy-engine-shared/test/unit:
	npx nx test:unit ${POLICY_ENGINE_SHARED_PROJECT_NAME} -- ${ARGS}

policy-engine-shared/test/unit/watch:
	make policy-engine-shared/test/unit ARGS=--watch
