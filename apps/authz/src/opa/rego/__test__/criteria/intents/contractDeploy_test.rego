package main

contractDeployRequest = {
	"action": "signTransaction",
	"intent": {
		"from": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
		"type": "deployContract",
		"bytecode": "",
	},
}

test_contractDeploy {
	checkIntentType({"deployContract"}) with input as contractDeployRequest
		with data.entities as entities

	checkSourceAddress({"eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"}) with input as contractDeployRequest
		with data.entities as entities
}
