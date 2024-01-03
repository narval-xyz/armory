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

orchestration/db/generate-types:
	npx prisma generate \
		--schema ./apps/orchestration/src/persistence/schema/schema.prisma

orchestration/db/migrate:
	npx dotenv -e ./apps/orchestration/.env -- \
		prisma migrate dev \
			--schema ./apps/orchestration/src/persistence/schema/schema.prisma

# Reference: https://www.prisma.io/docs/orm/prisma-migrate/workflows/seeding#seeding-your-database-with-typescript-or-javascript
orchestration/db/seed:
	npx dotenv -e ./apps/orchestration/.env -- \
		ts-node \
		--compiler-options "{\"module\":\"CommonJS\"}" \
		./apps/orchestration/src/persistence/seed.ts
