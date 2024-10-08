## Criteria
- The implementation of all Armory criteria
- Depends on Armory utils

## Armory utils

### Entities
- Functions used to query loaded data
  - Enforce invariants like lowercasing hex addresses
  - Aggregate data from multiple places in entity in order to build useful relationships
- Depends on lib

### Lib
- Utils that are not domain specific, like case insensitive comparison or time.
