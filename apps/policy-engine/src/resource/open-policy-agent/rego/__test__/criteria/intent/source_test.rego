package main

test_source {
	res = getSource(input.intent) with input as request with data.entities as entities
	res == {
        "id": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
        "address": "0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
        "accountType": "eoa"
	}
    
    checkSourceId({"eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"}) with input as request with data.entities as entities
    checkSourceAddress({"0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"}) with input as request with data.entities as entities
    checkSourceAccountType({"eoa"}) with input as request with data.entities as entities
}
