package armory.criteria

import data.armory.testData
import rego.v1

test_contractDeploy if {
	contractDeployRequest = object.union(test_data.requestWithEip1559Transaction, {
		"action": "signTransaction",
		"resource": {"uid": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"},
		"intent": {
			"from": "eip155:137:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
			"type": "deployContract",
			"chainId": "137",
		},
	})
	checkIntentType({"deployContract", "deployErc4337Account", "deploySafeAccount"}) with input as contractDeployRequest with data.entities as test_data.entities
	checkAccountId({"eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"}) with input as contractDeployRequest with data.entities as test_data.entities
	checkSourceId({"eip155:137:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"}) with input as contractDeployRequest with data.entities as test_data.entities
	checkIntentChainId({"137"}) with input as contractDeployRequest with data.entities as test_data.entities
}
