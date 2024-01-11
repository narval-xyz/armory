# Orchestration

## Getting started

```bash
# Boot PostgreSQL and Redis
make docker/up 
make orchestration/copy-default-env
make orchestration/db/migrate
```

## Running

```bash
make orchestration/start/dev
```

## Testing

Firs time? Setup the test database:

```bash
make orchestration/test/copy-default-env
make orchestration/test/db/setup
```

Running the tests:

```bash
make orchestration/test/type
make orchestration/test/unit
make orchestration/test/integration
make orchestration/test/e2e
```

## Database

```bash
make orchestration/db/migrate
make orchestration/db/create-migration NAME=your-migration-name
```
