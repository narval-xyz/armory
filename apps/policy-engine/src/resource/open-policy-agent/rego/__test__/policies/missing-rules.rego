package main

permit[{"policyId": "call-contract-custom", "policyName": "call-contract-custom"}] = reason {
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkPrincipalId({"auth0|62e1d7ca04533b042cb42419"})
	checkIntentContract({"eip155:137:0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad"})
	reason = {"type": "permit", "policyId": "call-contract-custom", "policyName": "call-contract-custom", "approvalsSatisfied": [], "approvalsMissing": []}
}
