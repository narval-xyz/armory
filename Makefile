include ./apps/authz/Makefile
include ./apps/armory/Makefile
include ./packages/authz-shared/Makefile
include ./packages/transaction-request-intent/Makefile

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
	make authz/setup
	@echo ""
	@echo "${TERM_GREEN}🐋 Armory & AuthZ applications are ready!${TERM_NO_COLOR}"
	@echo ""
	@echo "${TERM_GREEN}Run 'make armory/start/dev' or/and 'make authz/start/dev' to get them running.${TERM_NO_COLOR}"

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
