<p align="center">
  <a href="https://www.narval.xyz/" target="blank"><img src="./resource/narval_logo.png" width="150" alt="Narval logo" /></a>
</p>
<p align="center">Narval is the most advanced and secure authorization stack for web3.</p>
<p align="center">
<a href="https://github.com/narval-xyz/narval/actions/workflows/orchestration_ci.yml" target="_blank"><img src="https://github.com/narval-xyz/narval/actions/workflows/orchestration_ci.yml/badge.svg?branch=main" alt="@app/orchestration" /></a>
<a href="https://github.com/narval-xyz/narval/actions/workflows/authz_ci.yml" target="_blank"><img src="https://github.com/narval-xyz/narval/actions/workflows/authz_ci.yml/badge.svg?branch=main" alt="@app/authz" /></a>
<a href="https://github.com/narval-xyz/narval/actions/workflows/transaction_request_intent_ci.yml" target="_blank"><img src="https://github.com/narval-xyz/narval/actions/workflows/transaction_request_intent_ci.yml/badge.svg?branch=main" alt="@narval/transaction-request-intent" /></a>
</p>

## Description

TBD

## Getting started

To setup the project, run the following command:

```bash
git clone git@github.com:narval-xyz/narval.git
cd narval
make setup
```

At the end, you must have a working environment ready to run any application.

## Project

- [@app/authz](./apps/authz/README.md)
- [@app/orchestration](./apps/orchestration/README.md)
- [@narval/transaction-request-intent](./packages/transaction-request-intent/README.md)

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
