package main

test_permit_allow_root_user {
	res = permit[{"policyId": "allow-root-user"}] with input as request with data.entities as entities

	res == {"policyId": "allow-root-user"}
}
