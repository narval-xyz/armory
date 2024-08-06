package main

test_contractDeploy {
	contractDeployRequest = object.union(requestWithEip1559Transaction, {
		"action": "signTransaction",
		"resource": {"uid": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"},
		"intent": {
			"from": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
			"type": "deployContract",
			"chainId": "137",
		},
	})
	checkIntentType({"deployContract", "deployErc4337Account", "deploySafeAccount"}) with input as contractDeployRequest with data.entities as entities
	checkAccountId({"eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"}) with input as contractDeployRequest with data.entities as entities
	checkSourceId({"eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"}) with input as contractDeployRequest with data.entities as entities
	checkIntentChainId({"137"}) with input as contractDeployRequest with data.entities as entities
}
