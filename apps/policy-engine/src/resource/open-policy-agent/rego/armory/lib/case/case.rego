package armory.lib.case

import rego.v1

## Case insensitive string comparison
##
## Example:
## equalsIgnoreCase("foo", "FOO") => true
## equalsIgnoreCase("foo", "bar") => false
##
## This should be use for every id and hex string comparison.
equalsIgnoreCase(a, b) := result if {
	result := lower(a) == lower(b)
}

## Find a case-insensitive match in a SET
##
## Example:
## findCaseInsensitive("foo", {"bar", "foo", "baz"}) => true
## findCaseInsensitive("foo", {"bar", "baz"}) => false
##
findCaseInsensitive(needle, set) if {
	lowerNeedle := lower(needle)
	some elem in set
	lower(elem) == lowerNeedle
}
