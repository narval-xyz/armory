# ADR 0001: Handling dependency conflict when installing a package that depends on the SDK

## Context

In our monorepo, we use the latest version of `@narval-xyz/armory-sdk` by
creating a symlink to the source in `node_modules` through NX's dependency
management. This approach ensures that the latest code changes are immediately
reflected and used across the monorepo. However, the
`@narval-xyz/blockdaemon-tsm` is a separate repository that installs a specific
version of `@narval-xyz/armory-sdk`.

When `@narval-xyz/blockdaemon-tsm` is installed within the monorepo, NPM
resolves the `@narval-xyz/armory-sdk` dependency as a peer dependency. As a
result, `@narval-xyz/blockdaemon-tsm` relies on the monorepo's version of
`@narval-xyz/armory-sdk` instead of its own specified version. The problem
arises because the built version of `@narval-xyz/armory-sdk` included in
`@narval-xyz/blockdaemon-tsm` differs from the source code in the monorepo.
This discrepancy leads to runtime errors in the `@narval-xyz/blockdaemon-tsm`.

## Solution

To solve this issue, we will use NPM's bundled dependencies feature in the
`@narval-xyz/blockdaemon-tsm` package. This approach will ensure that
`@narval-xyz/blockdaemon-tsm` always includes and uses its own version of
`@narval-xyz/armory-sdk`, regardless of the monorepo's dependency resolution.

```json
{
  "name": "@narval-xyz/@narval-xyz/blockdaemon-tsm",
  "version": "1.0.0",
  "dependencies": {
    "@narval-xyz/@narval-xyz/armory-sdk": "0.0.0"
  },
  "bundleDependencies": ["@narval-xyz/@narval-xyz/armory-sdk"]
}
```

When we publish `@narval-xyz/blockdaemon-tsm`, NPM will bundle the specified
version of `@narval-xyz/armory-sdk` within the package itself. This guarantees
that `@narval-xyz/blockdaemon-tsm` always has access to its required version of
`@narval-xyz/armory-sdk`.
