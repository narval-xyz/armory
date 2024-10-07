package criteria.intent

import data.armory.lib
import rego.v1

checkIntentContract(values) if {
	lib.caseInsensitiveFindInSet(input.intent.contract, values)
}
