include ./apps/armory/Makefile
include ./apps/devtool/Makefile
include ./apps/docs/Makefile
include ./apps/policy-engine/Makefile
include ./apps/vault/Makefile
include ./packages/armory-e2e-testing/Makefile
include ./packages/armory-sdk/Makefile
include ./packages/nestjs-shared/Makefile
include ./packages/open-telemetry/Makefile
include ./packages/policy-engine-shared/Makefile
include ./packages/signature/Makefile
include ./packages/transaction-request-intent/Makefile

# For more terminal color codes, head over to
# https://opensource.com/article/19/9/linux-terminal-colors
TERM_NO_COLOR := \033[0m
TERM_GREEN := \033[0;32m

# === Install ===

install:
	npm install --engine-strict

install/ci:
	npm ci --engine-strict

# === Setup ===

check-requirements:
	@if ! command -v docker >/dev/null 2>&1; then \
		echo "❌ Docker is not installed. Please install Docker from https://docs.docker.com/get-docker/"; \
		exit 1; \
	fi
	@if ! docker info >/dev/null 2>&1; then \
		echo "❌ Docker daemon is not running. Please start Docker and try again"; \
		exit 1; \
	fi
	@if ! command -v opa >/dev/null 2>&1; then \
		echo "❌ OPA is not installed. Please install OPA from https://www.openpolicyagent.org/docs/latest/#1-download-opa"; \
		exit 1; \
	fi
	@echo "✅ All requirements are satisfied!"


setup:
	make install
	make check-requirements
	make docker/up
	make armory/setup
	make vault/setup
	make policy-engine/setup
	@echo ""
	@echo "${TERM_GREEN}🐋 Applications are ready!${TERM_NO_COLOR}"

# === Packages ===

packages/release:
	npx nx release --skip-publish

# TODO: The default override for `dependsOn` of `nx-release-publish` is not
# working. Ideally, the release target should depend on package's build.
packages/release/build:
	npx nx run-many \
		--target build \
		--projects armory-sdk

# NOTE: Run the command in dry run mode to see what files are going to be
# published: `npx nx release publish --dry-run`
packages/release/publish:
	npx nx release publish

# === Code format ===

format:
	npx nx format:write --all

format/check:
	npx nx format:check --all

lint:
	npx nx run-many \
		--target lint \
		--fix

lint/check:
	npx nx run-many --target lint

# === Testing ===

test/type:
	npx nx run-many --target test:type --all

test/unit:
	npx nx run-many --target test:unit --all

test/integration:
	npx nx run-many --target test:integration --all

test/e2e:
	npx nx run-many --target test:e2e --all

test:
	make test/type
	make test/unit
	make test/integration
	make test/e2e

# === Docker ===

# Starts the applications' dependencies.
docker/up:
	docker-compose up postgres redis --detach

docker/stop:
	docker-compose stop

# Starts the whole Armory stack in Docker containers.
docker/stack/up:
	docker-compose up --detach

docker/otel/up:
	docker-compose up postgres redis jaeger otel_collector --detach

docker/stack/build:
	docker buildx build \
		--platform linux/amd64 \
		--file local.dockerfile \
		--tag armory/local:latest \
		. --load

# Starts the whole Armory stack for MPC in Docker containers.
# Requires the mpc nodes to be configured seprately.
docker/mpc/up:
	docker-compose -f docker-compose.mpc.yml up --detach

docker/mpc/stop:
	docker-compose -f docker-compose.mpc.yml stop

# === Git ===

git/tag/push:
	git tag armory-$(TAG)
	git tag policy-engine-$(TAG)
	git tag vault-$(TAG)
	git push origin armory-$(TAG) policy-engine-$(TAG) vault-$(TAG)

# === Database ===

db/setup:
	make armory/db/setup
	make policy-engine/db/setup
	make vault/db/setup

db/generate-types:
	make armory/db/generate-types
	make policy-engine/db/generate-types
	make vault/db/generate-types
