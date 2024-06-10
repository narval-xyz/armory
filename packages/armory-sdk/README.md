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
