package armory.util.case

import future.keywords.in

equalsIgnoreCase(a, b) = result {
	result := lower(a) == lower(b)
}

findCaseInsensitive(needle, haystack) = matching {
	lowerNeedle := lower(needle)
	matching := {elem |
		some elem in haystack
		lower(elem) == needle
	}
}
