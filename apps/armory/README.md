# Armory

Authentication and authorization system for web3.0.

## Getting started

```bash
# Boot PostgreSQL and Redis
make docker/up
make armory/setup
```

## Running

```bash
make armory/start/dev
```

## Testing

First time? Setup the test database:

```bash
make armory/test/copy-default-env
make armory/test/db/setup
```

Running the tests:

```bash
# Run all tests
make armory/test

make armory/test/type
make armory/test/unit
make armory/test/integration
make armory/test/e2e

# Watch tests
make armory/test/unit/watch
make armory/test/integration/watch
make armory/test/e2e/watch
```

## Database

```bash
make armory/db/migrate
make armory/db/create-migration NAME=your-migration-name
```

## Formatting

```bash
make armory/format
make armory/lint

make armory/format/check
make armory/lint/check
```

## Price Module

The price module is tasked with fetching and maintaining cached price data from
various sources. It exclusively utilizes CAIP Asset ID as the dialect for its
API.

### Generate CoinGecko Asset ID Index

To accurately retrieve prices from the CoinGecko API, their internal Coin ID is
used. Due to the infrequent listing of relevant assets on CoinGecko, we maintain
a static index mapping Asset IDs to Coin IDs. This index is used to translate
inputs from the application to the CoinGecko.

```bash
make armory/price/generate-coin-gecko-asset-id-index
```

The script will write the index to [coin-gecko-asset-id-index.json](./src/price/resource/coin-gecko-asset-id-index.json).

> [!IMPORTANT]
> This script only includes assets from supported chains. If you introduce a new
> chain, you must rerun the script to update the static index file.
