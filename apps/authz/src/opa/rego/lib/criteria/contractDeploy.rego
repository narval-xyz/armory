package main

import future.keywords.in

contractDeployTypes = {"deployContract", "deployErc4337Wallet", "deploySafeWallet"}

checkContractDeployType(values) {
	input.intent.type in contractDeployTypes
	input.intent.type in values
}
