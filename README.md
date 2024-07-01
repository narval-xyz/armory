<p align="center">
  <a href="https://www.narval.xyz/" target="blank"><img src="./resources/narval-logo.png" width="150" alt="Narval logo" /></a>
</p>
<p align="center">Armory is the most secure, advanced, and flexible authorization stack for web3.</p>
<p align="center"><a href="https://github.com/narval-xyz/narval/actions/workflows/armory.yml" target="_blank"><img src="https://github.com/narval-xyz/narval/actions/workflows/armory.yml/badge.svg?branch=main" alt="@app/armory CI status" /></a> <a href="https://github.com/narval-xyz/narval/actions/workflows/policy-engine.yml" target="_blank"><img src="https://github.com/narval-xyz/narval/actions/workflows/policy-engine.yml/badge.svg?branch=main" alt="@app/policy-engine CI status" /></a> <a href="https://github.com/narval-xyz/armory/actions/workflows/vault.yml" target="_blank"><img src="https://github.com/narval-xyz/armory/actions/workflows/vault.yml/badge.svg" alt="@app/vault CI status" /></a> <a href="https://github.com/narval-xyz/armory/actions/workflows/packages.yml" target="_blank"><img src="https://github.com/narval-xyz/armory/actions/workflows/packages.yml/badge.svg?branch=main" alt="Packages CI status" /></a></p>

## What's the Armory?

The Armory Stack is an open-source auth system tailored for uses-case that need
strong authentication and fine-grained authorization. It is designed to secure
the usage of private keys, wallets, and web3 applications

It's a web3-native policy engine combined with a highly customizable next-gen
auth system, able to be deployed in a variety of secure configurations. 

![Armory Stack diagram](./resources/armory-stack.png)

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

Alternatively, you can run the entire stack in Docker containers. This is
useful when using the MPC as a signing protocol in the Policy Engine.

> [!IMPORTANT]
> You also need a locally running TSM cluster, which is not included in this
> repository.


```bash
# Build the application's image.
make docker/stack/build

make docker/stack/up
make docker/stack/stop
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

## NPM

The `.npmrc` file is needed to access a private registry for Font Awesome and
the optional dependency `@narval-xyz/blockdaemon-tsm`.

> [!IMPORTANT]
> This file is NOT in git, but it's necessary for the build.

1. Create a `.npmrc` file in the root of this project.
1. Get the values from someone who has them.
1. Now `npm install` should work.

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

## Publishing packages

This section describes the process to release a new version of publishable
packages to NPM.

1. Run `make packages/release` and follow the prompts to bump the
   projects' versions.
1. Run `npm install` to update `package-lock.json`.
1. Commit and push the changes to your branch.
1. After your branch is merged, manually trigger the [packages pipeline to
   publish](https://github.com/narval-xyz/armory/actions/workflows/packages-publish.yml)
   the new version to NPM.

You can find the publishable packages listed in the `release.projects` value in
the `nx.json`.

## Troubleshooting

### DB URL in env variable fails when using `docker run`, but works when running outside docker

If using `docker run --env-file .env ...`, the env file cannot include quotes
around values. The quotes will be included in the value.

### `localhost` PSQL URL cannot connect

Inside docker, `localhost` points to the container not your computer (host).
Change `localhost` to `host.docker.internal` to reference to the host IP
address in the local network.

## License

Armory is [MPL 2.0 licensed](./LICENSE).

You can find an exhaustive list of licenses of third-party software
dependencies used by the Armory at
[LICENSES_DISCLOSURE.md](./LICENSES_DISCLOSURE.md).

> To generate the list, run `./tools/licenses-disclosure/main.sh >
> LICENSES_DISCLOSURE.md`.
