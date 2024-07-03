# ADR 0001: Handling dependency conflict when installing a package that depends on the SDK

## Context

In our monorepo, we use the latest version of `armory-sdk` by creating a
symlink to the source in `node_modules` through NX's dependency management.
This approach ensures that the latest code changes are immediately reflected
and used across the monorepo. However, the `blockdaemon-tsm` is a separate
repository that installs a specific version of `armory-sdk`. 

When `blockdaemon-tsm` is installed within the monorepo, NPM resolves the
`armory-sdk` dependency as a peer dependency. As a result, `blockdaemon-tsm`
relies on the monorepo's version of `armory-sdk` instead of its own specified
version. The problem arises because the built version of `armory-sdk` included
in `blockdaemon-tsm` differs from the source code in the monorepo. This
discrepancy leads to runtime errors in the `blockdaemon-tsm`.

## Solution

To solve this issue, we will use NPM's bundled dependencies feature in the
`blockdaemon-tsm` package. This approach will ensure that `blockdaemon-tsm`
always includes and uses its own version of `armory-sdk`, regardless of the
monorepo's dependency resolution.

```json
{
  "name": "@narval-xyz/blockdaemon-tsm",
  "version": "1.0.0",
  "dependencies": {
    "@narval-xyz/armory-sdk": "0.0.0"
  },
  "bundleDependencies": [
    "@narval-xyz/armory-sdk"
  ]
}
```

When we publish `blockdaemon-tsm`, NPM will bundle the specified version of
`armory-sdk` within the package itself. This guarantees that `blockdaemon-tsm`
always has access to its required version of `armory-sdk`. 
