# AuthZ

TBD

## Requirements

- [Open Policy Agent (OPA)
  binary](https://www.openpolicyagent.org/docs/latest/#1-download-opa) installed
  and accessible in your `$PATH`.

## Getting started

```bash
make authz/setup
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

## Formatting

```bash
make authz/format
make authz/lint

make authz/format/check
make authz/lint/check
```
