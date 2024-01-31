# Orchestration

## Getting started

```bash
# Boot PostgreSQL and Redis
make docker/up
make orchestration/setup
```

## Running

```bash
make orchestration/start/dev
```

## Testing

First time? Setup the test database:

```bash
make orchestration/test/copy-default-env
make orchestration/test/db/setup
```

Running the tests:

```bash
# Run all tests
make orchestration/test

make orchestration/test/type
make orchestration/test/unit
make orchestration/test/integration
make orchestration/test/e2e

# Watch tests
make orchestration/test/unit/watch
make orchestration/test/integration/watch
make orchestration/test/e2e/watch
```

## Database

```bash
make orchestration/db/migrate
make orchestration/db/create-migration NAME=your-migration-name
```

## Formatting

```bash
make orchestration/format
make orchestration/lint

make orchestration/format/check
make orchestration/lint/check
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
make orchestration/price/generate-coin-gecko-asset-id-index
```

The script will write the index to [coin-gecko-asset-id-index.json](./src/price/resource/coin-gecko-asset-id-index.json).

> [!IMPORTANT]
> This script only includes assets from supported chains. If you introduce a new
> chain, you must rerun the script to update the static index file.
