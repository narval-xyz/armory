package main

test_contractDeploy {
	contractDeployRequest = {
		"action": "signTransaction",
		"resource": {"uid": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"},
		"intent": {
			"from": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
			"type": "deployContract",
			"chainId": 137,
		},
	}

	checkIntentType({"deployContract", "deployErc4337Wallet", "deploySafeWallet"}) with input as contractDeployRequest
		with data.entities as entities

	checkWalletId({"eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"}) with input as contractDeployRequest
		with data.entities as entities

	checkIntentChainId({1, 137}) with input as contractDeployRequest with data.entities as entities
}
