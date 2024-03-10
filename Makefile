include ./apps/armory/Makefile
include ./apps/devtool/Makefile
include ./apps/policy-engine/Makefile
include ./packages/policy-engine-shared/Makefile
include ./packages/transaction-request-intent/Makefile
include ./packages/signature/Makefile

# For more terminal color codes, head over to https://opensource.com/article/19/9/linux-terminal-colors
TERM_NO_COLOR := \033[0m
TERM_GREEN := \033[0;32m

# == Install ==

install:
	npm install

install/ci:
	npm ci

# == Setup ==

setup:
	make install
	make docker/up
	make armory/setup
	make policy-engine/setup
	@echo ""
	@echo "${TERM_GREEN}🐋 Armory & Policy Engine applications are ready!${TERM_NO_COLOR}"
	@echo ""
	@echo "${TERM_GREEN}Run 'make armory/start/dev' or/and 'make policy-engine/start/dev' to get them running.${TERM_NO_COLOR}"

# == Docker ==

docker/stop:
	docker-compose stop

docker/up:
	docker-compose up --detach

# == Code format ==

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
