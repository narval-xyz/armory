package main

# Root user is always allowed to perform any action.

permit[{"policyId": "allow-root-user"}] := reason {
	isPrincipalRootUser

	reason := {"policyId": "allow-root-user"}
}
