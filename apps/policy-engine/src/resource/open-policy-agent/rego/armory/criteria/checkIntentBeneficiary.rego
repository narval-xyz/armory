package armory.criteria

import rego.v1

checkIntentBeneficiary(values) if {
	input.intent.beneficiary in values
}
