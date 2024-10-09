package armory.constants

import rego.v1

wildcard := "*"

actions := {
	"signTransaction": "signTransaction",
	"signRaw": "signRaw",
	"signMessage": "signMessage",
	"signTypedData": "signTypedData",
	"grantPermission": "grantPermission",
}

operators := {
	"equal": "eq",
	"notEqual": "ne",
	"greaterThan": "gt",
	"greaterThanOrEqual": "gte",
	"lessThan": "lt",
	"lessThanOrEqual": "lte",
	# 'contains' is a restricted keyword in Rego - it's the native 'contains' function
	"has": "contains",
}

chainAssetId := {
	"1": "eip155:1/slip44:60",
	"10": "eip155:10/slip44:614",
	"56": "eip155:56/slip44:714",
	"137": "eip155:137/slip44:966",
	"250": "eip155:250/slip44:1007",
	"42161": "eip155:42161/slip44:9001",
	"42220": "eip155:42220/slip44:52752",
	"43114": "eip155:43114/slip44:9000",
}
