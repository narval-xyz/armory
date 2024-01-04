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

orchestration/test/db/setup:
	npx dotenv -e ./apps/orchestration/.env.test --override -- \
		prisma migrate reset \
		--schema ./apps/orchestration/src/persistence/schema/schema.prisma \
		--skip-seed \
		--force

orchestration/test/copy-default-env:
	cp ./apps/orchestration/.env.test.default ./apps/orchestration/.env.test

orchestration/test/unit:
	npx nx test:unit apps/orchestration

orchestration/test/type:
	npx nx test:type apps/orchestration

orchestration/test/e2e:
	npx nx test:e2e apps/orchestration
