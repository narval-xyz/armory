package main

import future.keywords.in

checkContractDeployIntent(values) {
	input.intent.type in {"deployContract", "deployErc4337Wallet", "deploySafeWallet"}
	input.intent.type in values
}
