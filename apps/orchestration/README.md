# Orchestration

## Getting started

```bash
# Boot PostgreSQL and Redis
make docker/up 
make orchestration/setup
```

## Running

```bash
make orchestration/start/dev
```

## Testing

First time? Setup the test database:

```bash
make orchestration/test/copy-default-env
make orchestration/test/db/setup
```

Running the tests:

```bash
# Run all tests
make orchestration/test
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
