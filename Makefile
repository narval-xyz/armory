include ./apps/orchestration/Makefile
include ./apps/authz-node/Makefile

install/ci:
	npm ci

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
