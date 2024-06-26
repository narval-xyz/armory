DEVTOOL_PROJECT_NAME := devtool
DEVTOOL_PROJECT_DIR := ./apps/devtool

# === Start ===

devtool/start/dev:
	npx nx serve ${DEVTOOL_PROJECT_NAME}

# === Testing ===

devtool/test/type:
	npx tsc \
		--project ${DEVTOOL_PROJECT_DIR}/tsconfig.json \
		--noEmit
