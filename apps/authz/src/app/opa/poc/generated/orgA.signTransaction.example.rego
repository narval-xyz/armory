package orgA.signTransaction.example


	permit if {
			action,symbol == "signTransaction,string"
			dev in "principal_groups"
			dev in "wallet_groups"
	}
	permit if {
			action == "signTransaction"
			principal == "0xaf4250162fcfc81a6cdde2f2950e3975112f1787"
			resource.uid == "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"
	}
	permit if {
			action == "signTransaction"
			principal_role == "member"
			is_wallet_assigned_to_principal
			input.contract_function.hex_signature in "0x1521465b,0xeae2ea7e,0x51782474,0x902ead61,0xdd86381e,0xdd7944f5"
	}
