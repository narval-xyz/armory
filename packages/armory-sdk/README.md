# Armory SDK

An SDK to you programmatically interact with the Armory Stack in a seamless way.

## Testing

```bash
# Run all tests
make armory-sdk/test

make armory-sdk/test/type
make armory-sdk/test/unit
make armory-sdk/test/unit/watch
```

### E2E

The E2E tests cover user journeys from the SDK users' perspective. Because of
this, they depend on running servers to function correctly.

```bash
# Start the servers
make armory/start/dev
make policy-engine/start/dev
make vault/start/dev

make armory-sdk/test/e2e
make armory-sdk/test/e2e/watch
```

The tests MUST run in series because each step depends on state changes from
the previous ones.

The tests are configured to generate a unique client on every run to prevent
state clashes. If you want to reset your local state, run `make setup`.

## Formatting

```bash
# Format and lint.
make armory-sdk/format
make armory-sdk/lint

# Check for formatting and linting errors without fixing them.
make armory-sdk/format/check
make armory-sdk/lint/check
```

## Building

The build will bundle `@narval/signature` and `@narval/policy-engine-shared`
sources into a standalone CommonJS module.

```bash
make armory-sdk/build
```

> [!IMPORTANT]
> Since we bundle other buildable projects into one, the SDK's `package.json`
> must include the peer dependencies of those other projects.

For more information about the build process, visit [Publishable and Buildable
NX Libraries](https://nx.dev/concepts/buildable-and-publishable-libraries).

## Publishing a new version

Head over [Publishing packages](../../README.md#publishing-packages) section in
the monorepo's main README file.
