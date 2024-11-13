# Policy Engine

Policy decision point for fine-grained authorization in web3.0.

## Requirements

- [Open Policy Agent (OPA) binary version >=
  0.69](https://www.openpolicyagent.org/docs/latest/#1-download-opa) installed
  and accessible in your `$PATH`.
- [Regal](https://github.com/StyraInc/regal?tab=readme-ov-file#getting-started)
  for linting Rego code.

## Getting started

```bash
make policy-engine/setup
```

## Running

```bash
make policy-engine/start/dev
```

## Testing

```bash
# Run all tests
make policy-engine/test

make policy-engine/test/type
make policy-engine/test/unit
make policy-engine/test/integration
make policy-engine/test/e2e
```

## Formatting

```bash
make policy-engine/format
make policy-engine/lint

make policy-engine/format/check
make policy-engine/lint/check
```
