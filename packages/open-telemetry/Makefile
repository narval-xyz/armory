OPEN_TELEMETRY_PROJECT_NAME := open-telemetry
OPEN_TELEMETRY_PROJECT_DIR := ./packages/open-telemetry

# == Code format ==

open-telemetry/format:
	 npx nx format:write --projects ${OPEN_TELEMETRY_PROJECT_NAME}

open-telemetry/lint:
	npx nx lint ${OPEN_TELEMETRY_PROJECT_NAME} -- --fix

open-telemetry/format/check:
	 npx nx format:check --projects ${OPEN_TELEMETRY_PROJECT_NAME}

open-telemetry/lint/check:
	npx nx lint ${OPEN_TELEMETRY_PROJECT_NAME}

# == Testing ==

open-telemetry/test/type:
	npx tsc \
		--project ${OPEN_TELEMETRY_PROJECT_DIR}/tsconfig.lib.json \
		--noEmit

open-telemetry/test/unit:
	npx nx test:unit ${OPEN_TELEMETRY_PROJECT_NAME} -- ${ARGS}

open-telemetry/test/unit/watch:
	make open-telemetry/test/unit ARGS=--watch
