<p align="center">
  <a href="https://www.narval.xyz/" target="blank"><img src="./resource/narval_logo.png" width="150" alt="Narval logo" /></a>
</p>
<p align="center">Armory is the most advanced and secure authorization stack for web3.</p>

## Project

| Project                                                                               | Status                                                                                                                                                                                                                                                 |
| ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [@app/armory](./apps/armory/README.md)                                                | <a href="https://github.com/narval-xyz/narval/actions/workflows/armory.yml" target="_blank"><img src="https://github.com/narval-xyz/narval/actions/workflows/armory.yml/badge.svg?branch=main" alt="@app/armory CI status" /></a>                      |
| [@app/policy-engine](./apps/policy-engine/README.md)                                  | <a href="https://github.com/narval-xyz/narval/actions/workflows/policy-engine.yml" target="_blank"><img src="https://github.com/narval-xyz/narval/actions/workflows/policy-engine.yml/badge.svg?branch=main" alt="@app/policy-engine CI status" /></a> |
| [@app/vault](./apps/vault/README.md)                                                  | <a href="https://github.com/narval-xyz/armory/actions/workflows/vault.yml" target="_blank"><img src="https://github.com/narval-xyz/armory/actions/workflows/vault.yml/badge.svg" alt="@app/vault CI status" /></a>                                     |
| [@narval/encryption](./packages/encryption/README.md)                                 | <a href="https://github.com/narval-xyz/armory/actions/workflows/packages.yml" target="_blank"><img src="https://github.com/narval-xyz/armory/actions/workflows/packages.yml/badge.svg?branch=main" alt="Packages CI status" /></a>                     |
| [@narval/policy-engine-shared](./packages/policy-engine-shared/README.md)             | <a href="https://github.com/narval-xyz/armory/actions/workflows/packages.yml" target="_blank"><img src="https://github.com/narval-xyz/armory/actions/workflows/packages.yml/badge.svg?branch=main" alt="Packages CI status" /></a>                     |
| [@narval/signature](./packages/signature/README.md)                                   | <a href="https://github.com/narval-xyz/armory/actions/workflows/packages.yml" target="_blank"><img src="https://github.com/narval-xyz/armory/actions/workflows/packages.yml/badge.svg?branch=main" alt="Packages CI status" /></a>                     |
| [@narval/nestjs-shared](./packages/nestjs-shared/README.md)                           | <a href="https://github.com/narval-xyz/armory/actions/workflows/packages.yml" target="_blank"><img src="https://github.com/narval-xyz/armory/actions/workflows/packages.yml/badge.svg?branch=main" alt="Packages CI status" /></a>                     |
| [@narval/transaction-request-intent](./packages/transaction-request-intent/README.md) | <a href="https://github.com/narval-xyz/armory/actions/workflows/packages.yml" target="_blank"><img src="https://github.com/narval-xyz/armory/actions/workflows/packages.yml/badge.svg?branch=main" alt="Packages CI status" /></a>                     |

## Getting started

To setup the project, run the following command:

```bash
git clone git@github.com:narval-xyz/narval.git
cd narval
make setup
```

At the end, you must have a working environment ready to run any application.

## Docker

We use Docker & `docker-compose` to run the application's dependencies.

```bash
make docker/up
make docker/stop
```

## Testing

To run tests across all existing projects, you can use the following commands:

```bash
# Run all tests
make test

make test/type
make test/unit
make test/integration
make test/e2e
```

These commands utilize the NX CLI's run-many feature to execute the specified
targets (test or test:type) across all projects in the monorepo.

## Formatting

We use [Prettier](https://prettier.io/) and [ESLint](https://eslint.org/) to
ensure code consistency. You can run the following commands to format and lint
the whole code base.

```bash
# Format and lint all the code.
make format
make lint

# Check for formatting and linting errors without fixing them.
make format/check
make lint/check
```

## Publishing packages 

This section describes the process to release a new version of publishable
packages to NPM.

1. Run `make packages/release/build` and follow the prompts to bump the
   projects' versions.
2. Commit and push the changes to your branch.
3. After your branch is merged, manually trigger the [packages pipeline to
   publish](https://github.com/narval-xyz/armory/actions/workflows/packages-publish.yml)
the new version to NPM.

You can find the publishable packages listed in the `release.projects` value in
the `nx.json`.

## Generating a new project

NX provides two types of projects: applications and libraries. Run the commands
below to generate a project of your choice.

```bash
# Generate an standard JavaScript library.
npx nx g @nrwl/workspace:lib
# Generate an NestJS library.
npx nx g @nx/nest:library
# Generate an NestJS application.
npx nx g @nx/nest:application --tags type:application
```

For more information about code generation, please refer to the [NX
documentation](https://nx.dev/nx-api/nx).

## NPM 

The `.npmrc` file is needed to access a private registry for Font Awesome and
`@sepior/tsmsdkv2`.

> [!IMPORTANT]
> This file is NOT in git, but it's necessary for the build.

1. Create a `.npmrc` file in the root of this project.
2. Get the values from someone who has them.
3. Now `npm install` should work.

## Troubleshooting

### DB URL in env variable fails when using `docker run`, but works when running outside docker

If using `docker run --env-file .env ...`, the env file cannot include quotes
around values. The quotes will be included in the value.

### `localhost` PSQL URL cannot connect

Inside docker, `localhost` points to the container not your computer (host).
Change `localhost` to `host.docker.internal` to reference to the host IP
address in the local network. 
