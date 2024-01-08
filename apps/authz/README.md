# AuthZ

TBD

## Getting started

```bash
# Boot PostgreSQL and Redis
make docker/up
make authz/copy-default-env
```

## Running

```bash
make authz/start/dev
```

## Testing

```bash
make authz/test/type
make authz/test/unit
make authz/test/integration
make authz/test/e2e
```
