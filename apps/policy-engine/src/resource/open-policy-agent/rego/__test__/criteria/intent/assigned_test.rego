package main

test_assigned_account {
  checkAccountAssigned with input as requestWithEip1559Transaction with data.entities as entities
}

test_assigned_lowercase {
  checkAccountAssigned with input as requestWithUpperCasedResource with data.entities as entities
}