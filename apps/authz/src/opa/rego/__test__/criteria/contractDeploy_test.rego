package main

import future.keywords.in

test_contractDeploy {
	contractDeployRequest = {
		"action": "signTransaction",
		"intent": {
			"from": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
			"type": "deployContract",
			"bytecode": "",
		},
	}

	checkContractDeployType({"deployContract"}) with input as contractDeployRequest
		with data.entities as entities
}
