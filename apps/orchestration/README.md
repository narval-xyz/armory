# Orchestration

## Getting started

```bash
# Boot PostgreSQL and Redis
make docker/up 
make orchestration/copy-default-env
make orchestration/db/migrate
```

## Testing

Firs time? Run `orchestration/copy-default-env` and `make
orchestration/test/db/setup` to setup the test database.

```bash
make orchestration/test/type
make orchestration/test/unit
make orchestration/test/integration
make orchestration/test/e2e
```
