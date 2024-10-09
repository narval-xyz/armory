package main

import data.armory.criteria
import rego.v1

permit[{"policyId": "allow-root-user", "policyName": "Allow root user"}] := reason if {
	criteria.checkPrincipalRole({"root"})

	reason := {
		"type": "permit",
		"policyId": "allow-root-user",
		"policyName": "Allow root user",
		"approvalsSatisfied": [],
		"approvalsMissing": [],
	}
}

forbid[{"policyId": "default-forbid-policy", "policyName": "Default Forbid Policy"}] := {
	"type": "forbid",
	"policyId": "default-forbid-policy",
	"policyName": "Default Forbid Policy",
	"approvalsSatisfied": [],
	"approvalsMissing": [],
}
