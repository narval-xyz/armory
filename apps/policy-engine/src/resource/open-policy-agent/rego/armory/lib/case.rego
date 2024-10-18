package armory.lib

import rego.v1

## Case insensitive string comparison
##
## Example:
## lib.caseInsensitiveEqual("foo", "FOO") permit
## lib.caseInsensitiveEqual("foo", "bar") deny
##
## This should be use for every id and hex string comparison.
caseInsensitiveEqual(a, b) if lower(a) == lower(b)

## Find a case-insensitive match in a SET
##
## Example:
## lib.caseInsensitiveFindInSet("foo", {"bar", "foo", "baz"}) => permit
## lib.caseInsensitiveFindInSet("foo", {"bar", "baz"}) => deny
##
caseInsensitiveFindInSet(needle, set) if {
	lowerNeedle := lower(needle)
	some elem in set
	lower(elem) == lowerNeedle
}
