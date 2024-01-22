package main

test_permitAllowRootUser {
	res = permit[{"policyId": "allow-root-user"}] with input as request with data.entities as entities

	res == {"policyId": "allow-root-user"}
}
