package armory.lib

import rego.v1

## Case insensitive string comparison
##
## Example:
## lib.caseInsensitiveEqual("foo", "FOO") => true
## lib.caseInsensitiveEqual("foo", "bar") => false
##
## This should be use for every id and hex string comparison.
caseInsensitiveEqual(a, b) if lower(a) == lower(b)

## Find a case-insensitive match in a SET
##
## Example:
## lib.caseInsensitiveFindInSet("foo", {"bar", "foo", "baz"}) => true
## lib.caseInsensitiveFindInSet("foo", {"bar", "baz"}) => false
##
caseInsensitiveFindInSet(needle, set) if {
	lowerNeedle := lower(needle)
	some elem in set
	lower(elem) == lowerNeedle
}
