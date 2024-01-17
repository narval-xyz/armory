package main

# Root user is always allowed to perform any action.

permit[{"policyId": "allow-root-user"}] := reason {
	is_principal_root_user

	reason := {"policyId": "allow-root-user"}
}
