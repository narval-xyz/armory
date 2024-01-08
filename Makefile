include ./apps/authz/Makefile
include ./apps/orchestration/Makefile

# For more terminal color codes, head over to https://opensource.com/article/19/9/linux-terminal-colors
TERM_NO_COLOR := \033[0m
TERM_GREEN := \033[0;32m

install:
	npm install

install/ci:
	npm ci

setup:
	make install
	make docker/up
	make authz/setup
	make orchestration/setup
	@echo ""
	@echo "${TERM_GREEN}Orchestration & AuthZ applications are ready 🐋${TERM_NO_COLOR}"
	@echo "${TERM_GREEN}Run 'make orchestration/start/dev' or/and 'make authz/start/dev' to get them running.${TERM_NO_COLOR}"

docker/stop:
	docker-compose stop

docker/up:
	docker-compose up --detach

format:
	npx prettier \
		--write "apps/**/*.ts" "packages/**/*.ts" "./*.{js,json}"

format/check:
	npx prettier \
		--check "apps/**/*.ts" "packages/**/*.ts" "./*.{js,json}"

lint:
	npx nx run-many \
		--target lint \
		--fix

lint/check:
	npx nx run-many \
		--target lint
