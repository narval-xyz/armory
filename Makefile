include ./apps/armory/Makefile
include ./apps/devtool/Makefile
include ./apps/docs/Makefile
include ./apps/policy-engine/Makefile
include ./apps/vault/Makefile
include ./packages/nestjs-shared/Makefile
include ./packages/policy-engine-shared/Makefile
include ./packages/transaction-request-intent/Makefile
include ./packages/signature/Makefile
include ./packages/armory-sdk/Makefile

# For more terminal color codes, head over to
# https://opensource.com/article/19/9/linux-terminal-colors
TERM_NO_COLOR := \033[0m
TERM_GREEN := \033[0;32m

# === Install ===

install:
	npm install

install/ci:
	npm ci

# === Setup ===

setup:
	make install
	make docker/up
	make armory/setup
	make vault/setup
	make policy-engine/setup
	@echo ""
	@echo "${TERM_GREEN}🐋 Applications are ready!${TERM_NO_COLOR}"

# === Packages ===

# - Uses `--skip-publish` option because the publish step is done in the CI.
# - Uses `--fist-release` option to avoid generating a tag.
# - Runs `npm install` after to properly update the `package-lock.json` with
#   the new version.
packages/release:
	npx nx release --skip-publish --first-release
	npm install

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

# Starts the Armory stack in Docker containers.
# Useful when you want to use MPC as the signing protocol.
docker/stack/up:
	docker-compose up --detach

docker/stack/stop:
	docker-compose stop

docker/stack/build:
	docker build \
		--file local.dockerfile \
		--tag armory/local:latest \
		. --load

