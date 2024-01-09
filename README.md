<p align="center">
  <a href="https://www.narval.xyz/" target="blank"><img src="./resource/narval_logo.png" width="150" alt="Narval logo" /></a>
</p>
<p align="center">Narval is the most advanced and secure authorization stack for web3.</p>
<p align="center">
<a href="https://github.com/narval-xyz/narval/actions/workflows/orchestration_ci.yml" target="_blank"><img src="https://github.com/narval-xyz/narval/actions/workflows/orchestration_ci.yml/badge.svg?branch=main" alt="Orchestration CI" /></a>
<a href="https://github.com/narval-xyz/narval/actions/workflows/authz_ci.yml" target="_blank"><img src="https://github.com/narval-xyz/narval/actions/workflows/authz_ci.yml/badge.svg?branch=main" alt="AuthZ CI" /></a>
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

## Application

- [AuthZ](./apps/authz/README.md)
- [Orchestration](./apps/orchestration/README.md)

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

## Creating a NestJS library

Run the command below and follow the instructions to create a new NestJS library.

```bash
 npx nx g @nx/nest:library
```
