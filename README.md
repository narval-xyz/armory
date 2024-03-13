<p align="center">
  <a href="https://www.narval.xyz/" target="blank"><img src="./resource/narval_logo.png" width="150" alt="Narval logo" /></a>
</p>
<p align="center">Armory is the most advanced and secure authorization stack for web3.</p>

## Getting started

To setup the project, run the following command:

```bash
git clone git@github.com:narval-xyz/narval.git
cd narval
make setup
```

At the end, you must have a working environment ready to run any application.

## Project

| Project                                                                               | Status | 
|---------------------------------------------------------------------------------------|--------|
| [@app/armory](./apps/armory/README.md)                                                | <a href="https://github.com/narval-xyz/narval/actions/workflows/armory.yml" target="_blank"><img src="https://github.com/narval-xyz/narval/actions/workflows/armory.yml/badge.svg?branch=main" alt="@app/armory CI status" /></a> | 
| [@app/policy-engine](./apps/policy-engine/README.md)                                  | <a href="https://github.com/narval-xyz/narval/actions/workflows/policy-engine.yml" target="_blank"><img src="https://github.com/narval-xyz/narval/actions/workflows/policy-engine.yml/badge.svg?branch=main" alt="@app/policy-engine CI status" /></a> |
| [@narval/encryption-module](./packages/encryption-module/README.md)                   | N/A |
| [@narval/policy-engine-shared](./packages/policy-engine-shared/README.md)             | <a href="https://github.com/narval-xyz/narval/actions/workflows/policy-engine-shared.yml" target="_blank"><img src="https://github.com/narval-xyz/narval/actions/workflows/policy-engine-shared.yml/badge.svg?branch=main" alt="@narval/policy-engine-shared CI status" /></a> |
| [@narval/signature](./packages/signature/README.md)                                   | N/A |
| [@narval/transaction-request-intent](./packages/transaction-request-intent/README.md) | <a href="https://github.com/narval-xyz/narval/actions/workflows/transaction-request-intent.yml" target="_blank"><img src="https://github.com/narval-xyz/narval/actions/workflows/transaction-request-intent.yml/badge.svg?branch=main" alt="@narval/transaction-request-intent CI status" /></a> |

## Docker

We use Docker & `docker-compose` to run the application's dependencies.

```bash
make docker/up
make docker/stop
```

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

## Generating a new project

NX provides two types of projects: applications and libraries. Run the commands
below to generate a project of your choice.

```bash
# Generate an standard JavaScript library.
npx nx g @nrwl/workspace:lib
# Generate an NestJS library.
npx nx g @nx/nest:library
# Generate an NestJS application.
npx nx g @nx/nest:application
```

For more information about code generation, please refer to the [NX
documentation](https://nx.dev/nx-api/nx).
