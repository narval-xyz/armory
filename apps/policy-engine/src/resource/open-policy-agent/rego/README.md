# Packages

## Main

The implementation of engine general logic. This package is the one were transpiled policy are written
Transpiled policies then use Armory/criteria functions to evaluate input

## Armory

### Constants

This package contains all constants that are used by production code

### Criteria

Criteria contains the function that build the logic for every transpiled policy.
**This package should have exactly the same number of files as we have supported criteria**

### Feeds

Criteria that needs to access our feeds should be depending from this package

### Entities

Functions used to query loaded data. It serves as a source of truth to know if something is in data.entities.

- Enforce invariants like lowercasing hex addresses
- Aggregate data from multiple places in entity in order to build useful relationships
- build runtime types that depends on entity data result

### Lib

Utils that are not domain specific, like case insensitive comparison or time.

### Test_Data

Values that are specifically used by tests.
**this shouldn't be imported in production code**

# Tests

Currently tests are not separated in different package. Future improvement should be to strictly separate test and production code
By moving tests in separate packages.
We can enforce it by re-enabling `test-outside-test-package` rule in `.regal/config.yaml`
