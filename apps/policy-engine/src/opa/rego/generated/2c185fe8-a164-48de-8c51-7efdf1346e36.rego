package main

permit[{"policyId": "e0850fb1-5260-4b41-a2dd-787b4fe71597", "policyName": "c4cb0186-a0e8-48b8-bf05-8eaffc9efdcc"}] = reason {
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x28597ea60030fbae79088d89d803f25143c7a6b5"})
	checkIntentHexSignature({"0xc16fad97"})
	reason = {"type": "permit", "policyId": "e0850fb1-5260-4b41-a2dd-787b4fe71597", "policyName": "c4cb0186-a0e8-48b8-bf05-8eaffc9efdcc", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "12e46387-159b-4008-89ca-5ad9a936d638", "policyName": "13fabcb5-e7d9-4e47-985e-9b048ebb7003"}] = reason {
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x28597ea60030fbae79088d89d803f25143c7a6b5"})
	checkIntentHexSignature({"0x2b3f22b4"})
	reason = {"type": "permit", "policyId": "12e46387-159b-4008-89ca-5ad9a936d638", "policyName": "13fabcb5-e7d9-4e47-985e-9b048ebb7003", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "47229d3c-f6b4-44c9-8c72-ad76dcb02398", "policyName": "ec539dbc-e44f-4e5b-8fe5-6f61de0c4e7b"}] = reason {
	checkAction({"signTransaction"})
	checkIntentType({"approveTokenAllowance"})
	checkIntentToken({"eip155:137:0x431cd3c9ac9fc73644bf68bf5691f4b83f9e104f"})
	checkIntentSpender({"eip155:137:0x28597ea60030fbae79088d89d803f25143c7a6b5"})
	reason = {"type": "permit", "policyId": "47229d3c-f6b4-44c9-8c72-ad76dcb02398", "policyName": "ec539dbc-e44f-4e5b-8fe5-6f61de0c4e7b", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "a55f314c-d35d-4e56-88a4-ad249de62a05", "policyName": "e61592db-ec4a-435b-bce7-71b12ac57693"}] = reason {
	checkPrincipalRole({"admin"})
	checkAction({"signTransaction"})
	checkIntentType({"transferErc20", "transferNative"})
	reason = {"type": "permit", "policyId": "a55f314c-d35d-4e56-88a4-ad249de62a05", "policyName": "e61592db-ec4a-435b-bce7-71b12ac57693", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "9320d8a7-fdd2-4644-8868-2f58d4727cd1", "policyName": "a68e8d20-0419-475c-8fcc-b17d4de8c955"}] = reason {
	checkPrincipalRole({"admin"})
	checkAction({"signTransaction"})
	checkIntentType({"transferErc721", "transferErc1155"})
	reason = {"type": "permit", "policyId": "9320d8a7-fdd2-4644-8868-2f58d4727cd1", "policyName": "a68e8d20-0419-475c-8fcc-b17d4de8c955", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "a33b67c9-ff2a-448e-a21d-bbdb1aee0d3f", "policyName": "f42953dc-b6d9-4186-bdcc-1b834779f462"}] = reason {
	checkPrincipalId({"auth0|62e1d7ca04533b042cb42419"})
	checkWalletAddress({"0x0ff514df05c423a120152df9e04ba94fab7b3491"})
	checkAction({"signTransaction"})
	checkIntentType({"transferErc20"})
	checkIntentToken({"eip155:137:0x431cd3c9ac9fc73644bf68bf5691f4b83f9e104f"})
	checkIntentAmount({"currency": "*", "operator": "lt", "value": "2"})
	reason = {"type": "permit", "policyId": "a33b67c9-ff2a-448e-a21d-bbdb1aee0d3f", "policyName": "f42953dc-b6d9-4186-bdcc-1b834779f462", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "440b74ad-adbb-41c0-8a41-f1fddd8595e8", "policyName": "417c3e87-9dc2-4ec8-9b8f-b5a421c90226"}] = reason {
	checkPrincipalId({"auth0|62e1d7ca04533b042cb42419"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
	reason = {"type": "permit", "policyId": "440b74ad-adbb-41c0-8a41-f1fddd8595e8", "policyName": "417c3e87-9dc2-4ec8-9b8f-b5a421c90226", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "7d9670b9-c9e3-4854-a960-8c57dffa6a60", "policyName": "593000a9-05fd-4e2a-88b1-946115dfcdcf"}] = reason {
	checkPrincipalId({"auth0|62e1d7ca04533b042cb42419"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
	reason = {"type": "permit", "policyId": "7d9670b9-c9e3-4854-a960-8c57dffa6a60", "policyName": "593000a9-05fd-4e2a-88b1-946115dfcdcf", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "ccaa9480-172a-4a59-afa3-8ece0f09a211", "policyName": "a4a6b1b0-638a-4535-b48b-32e99ce58d92"}] = reason {
	checkPrincipalId({"auth0|62e1d7ca04533b042cb42419"})
	checkAction({"signTransaction"})
	checkIntentType({"transferErc721"})
	checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
	checkDestinationAddress({"0x03e00f3aa6e4918c72bf07d60a5a21ce658d1a50"})
	reason = {"type": "permit", "policyId": "ccaa9480-172a-4a59-afa3-8ece0f09a211", "policyName": "a4a6b1b0-638a-4535-b48b-32e99ce58d92", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "7c150e91-d8cc-4678-bec9-08d9196e68fe", "policyName": "0a4a01d5-78ce-4cf8-9f97-bc5726e173df"}] = reason {
	checkPrincipalId({"auth0|64784e51867282eb243a9daa"})
	checkAction({"signTypedData"})
	checkIntentType({"signTypedData"})
	checkIntentDomain({"chainId": ["137"], "name": ["Crypto Unicorns Authentication"], "version": ["1"]})
	reason = {"type": "permit", "policyId": "7c150e91-d8cc-4678-bec9-08d9196e68fe", "policyName": "0a4a01d5-78ce-4cf8-9f97-bc5726e173df", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "851ed7de-4ea9-4989-a69d-89e73c2c3f5a", "policyName": "fd02d4da-2c20-49bb-a904-57c5a81bc0e5"}] = reason {
	checkAction({"signTransaction"})
	checkIntentType({"approveTokenAllowance"})
	checkIntentToken({"eip155:137:0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad"})
	reason = {"type": "permit", "policyId": "851ed7de-4ea9-4989-a69d-89e73c2c3f5a", "policyName": "fd02d4da-2c20-49bb-a904-57c5a81bc0e5", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "177ae0de-0f21-4291-bada-ebbc887a58cf", "policyName": "dd0c5566-8e45-4ada-9811-73eac1886b68"}] = reason {
	checkAction({"signTransaction"})
	checkIntentType({"approveTokenAllowance"})
	checkIntentToken({"eip155:137:0x64060ab139feaae7f06ca4e63189d86adeb51691"})
	reason = {"type": "permit", "policyId": "177ae0de-0f21-4291-bada-ebbc887a58cf", "policyName": "dd0c5566-8e45-4ada-9811-73eac1886b68", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "449c80cd-3063-4f83-ac44-b62ea61456f0", "policyName": "c3d6e2a3-8812-44f2-89cb-d13a63b649fa"}] = reason {
	checkPrincipalId({"auth0|64784e51867282eb243a9daa"})
	checkAction({"signTransaction"})
	checkIntentType({"transferErc721"})
	checkIntentContract({"eip155:137:0xa2a13ce1824f3916fc84c65e559391fc6674e6e8"})
	checkDestinationAddress({"0xe5c2e7f0b542401e6bcf50f3f87c22b1f144929f"})
	reason = {"type": "permit", "policyId": "449c80cd-3063-4f83-ac44-b62ea61456f0", "policyName": "c3d6e2a3-8812-44f2-89cb-d13a63b649fa", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "ec037b20-f68a-49aa-9d31-84150bc8c535", "policyName": "cbadfea4-164f-4c3b-88d9-5a20e6c09248"}] = reason {
	checkPrincipalId({"auth0|64784e51867282eb243a9daa"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x5c3e876cb6e531a3a35cc985ab53e8f3869530b5"})
	reason = {"type": "permit", "policyId": "ec037b20-f68a-49aa-9d31-84150bc8c535", "policyName": "cbadfea4-164f-4c3b-88d9-5a20e6c09248", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "995a8169-d96f-443c-9f19-06ce82e9c942", "policyName": "8a550f70-cc98-4b2d-a3ae-2a624ae3c56b"}] = reason {
	checkPrincipalRole({"admin"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x5c3e876cb6e531a3a35cc985ab53e8f3869530b5"})
	reason = {"type": "permit", "policyId": "995a8169-d96f-443c-9f19-06ce82e9c942", "policyName": "8a550f70-cc98-4b2d-a3ae-2a624ae3c56b", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "e19bcdc5-70e7-4765-8f52-acdf40907ad4", "policyName": "c715fcf4-7e9f-45ef-8615-770b0597fddf"}] = reason {
	checkPrincipalId({"auth0|62e1d7ca04533b042cb42419"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x5c3e876cb6e531a3a35cc985ab53e8f3869530b5"})
	reason = {"type": "permit", "policyId": "e19bcdc5-70e7-4765-8f52-acdf40907ad4", "policyName": "c715fcf4-7e9f-45ef-8615-770b0597fddf", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "eab2f8ac-a76c-400e-9c7b-606deff6cec1", "policyName": "3d597a7c-cebc-4cb0-8c82-a31fda95e5e7"}] = reason {
	checkPrincipalId({"auth0|62e1d7ca04533b042cb42419"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0xa2a13ce1824f3916fc84c65e559391fc6674e6e8"})
	reason = {"type": "permit", "policyId": "eab2f8ac-a76c-400e-9c7b-606deff6cec1", "policyName": "3d597a7c-cebc-4cb0-8c82-a31fda95e5e7", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "4233ce5d-3eca-48e3-919e-188e5b1ea988", "policyName": "4655de9d-37be-4796-9c49-1e9344c39e21"}] = reason {
	checkPrincipalId({"auth0|62e1d7ca04533b042cb42419"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0xa2a13ce1824f3916fc84c65e559391fc6674e6e8"})
	reason = {"type": "permit", "policyId": "4233ce5d-3eca-48e3-919e-188e5b1ea988", "policyName": "4655de9d-37be-4796-9c49-1e9344c39e21", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "3cd1025c-a160-4a47-a070-415669420976", "policyName": "7ad914af-edc6-4170-b840-4988ff831ca9"}] = reason {
	checkPrincipalId({"auth0|62e1d7ca04533b042cb42419"})
	checkAction({"signTransaction"})
	checkIntentType({"transferErc721"})
	checkIntentContract({"eip155:137:0xa2a13ce1824f3916fc84c65e559391fc6674e6e8"})
	checkDestinationAddress({"0xe5c2e7f0b542401e6bcf50f3f87c22b1f144929f"})
	reason = {"type": "permit", "policyId": "3cd1025c-a160-4a47-a070-415669420976", "policyName": "7ad914af-edc6-4170-b840-4988ff831ca9", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "eec4b891-bebb-4785-a860-2d9559dbec29", "policyName": "18d771af-33a1-46c6-bd95-5008871eff60"}] = reason {
	checkPrincipalId({"auth0|62e1d7ca04533b042cb42419"})
	checkAction({"signMessage", "signTypedData"})
	checkIntentType({"signMessage", "signTypedData"})
	reason = {"type": "permit", "policyId": "eec4b891-bebb-4785-a860-2d9559dbec29", "policyName": "18d771af-33a1-46c6-bd95-5008871eff60", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "7b151369-5683-4b0a-a1a1-a1f94467ef53", "policyName": "7543edef-087e-4550-b6bb-dba3e3e6c710"}] = reason {
	checkPrincipalId({"debb4c0f-235c-497e-8009-7476b7494c26"})
	checkAction({"signTransaction"})
	checkIntentType({"transferErc721", "transferErc1155"})
	reason = {"type": "permit", "policyId": "7b151369-5683-4b0a-a1a1-a1f94467ef53", "policyName": "7543edef-087e-4550-b6bb-dba3e3e6c710", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "65494894-94de-40a8-856c-a1169d8bc703", "policyName": "9e2b8d76-69cb-4cc2-815f-499b054686c9"}] = reason {
	checkPrincipalId({"auth0|62e1d7ca04533b042cb42419"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x5c3e876cb6e531a3a35cc985ab53e8f3869530b5"})
	reason = {"type": "permit", "policyId": "65494894-94de-40a8-856c-a1169d8bc703", "policyName": "9e2b8d76-69cb-4cc2-815f-499b054686c9", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "2f89157b-fafc-4b4a-bb62-7b6f546b10e5", "policyName": "c77b1a6c-f86a-4910-96a7-11809199dcdc"}] = reason {
	checkPrincipalRole({"admin"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0x9dafc880"})
	reason = {"type": "permit", "policyId": "2f89157b-fafc-4b4a-bb62-7b6f546b10e5", "policyName": "c77b1a6c-f86a-4910-96a7-11809199dcdc", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "2f76c5e2-0314-4b8a-ac38-e16dced4726f", "policyName": "d1d59f96-cf8f-463e-9018-9dbd4fa2113d"}] = reason {
	checkPrincipalRole({"member"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0x9dafc880"})
	reason = {"type": "permit", "policyId": "2f76c5e2-0314-4b8a-ac38-e16dced4726f", "policyName": "d1d59f96-cf8f-463e-9018-9dbd4fa2113d", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "46a76c08-548d-4902-b676-af099566bfcf", "policyName": "9383acd7-591c-419a-8730-2068f0a908a9"}] = reason {
	checkPrincipalRole({"admin"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0x4b4a0bdf"})
	reason = {"type": "permit", "policyId": "46a76c08-548d-4902-b676-af099566bfcf", "policyName": "9383acd7-591c-419a-8730-2068f0a908a9", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "04635ec7-f36b-4c92-8234-262637a78041", "policyName": "13bd8904-2209-4717-a77d-511932f04391"}] = reason {
	checkPrincipalRole({"admin"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0xa3105f63"})
	reason = {"type": "permit", "policyId": "04635ec7-f36b-4c92-8234-262637a78041", "policyName": "13bd8904-2209-4717-a77d-511932f04391", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "a736db8f-32dd-4a7a-822a-1c7735202082", "policyName": "50c7acef-8279-4fcd-a539-94c93a243d68"}] = reason {
	checkPrincipalRole({"member"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0x5e351737"})
	reason = {"type": "permit", "policyId": "a736db8f-32dd-4a7a-822a-1c7735202082", "policyName": "50c7acef-8279-4fcd-a539-94c93a243d68", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "67147217-0000-4010-8c43-84adfbb32f38", "policyName": "3dd3670e-e166-4185-b18e-90f4afd07cbe"}] = reason {
	checkPrincipalRole({"admin"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0x5e351737"})
	reason = {"type": "permit", "policyId": "67147217-0000-4010-8c43-84adfbb32f38", "policyName": "3dd3670e-e166-4185-b18e-90f4afd07cbe", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "91e9241f-12c1-4380-89e3-85d2a6417168", "policyName": "8f166dfc-1c16-4fcf-b760-9df12c430e46"}] = reason {
	checkPrincipalRole({"member"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0x37e28cd7"})
	reason = {"type": "permit", "policyId": "91e9241f-12c1-4380-89e3-85d2a6417168", "policyName": "8f166dfc-1c16-4fcf-b760-9df12c430e46", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "4aa080f3-39f6-4620-8870-73840ff446fb", "policyName": "568d0fc4-ac9d-4cee-95f1-bac6863b9b38"}] = reason {
	checkPrincipalRole({"admin"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0x65c38bb8"})
	reason = {"type": "permit", "policyId": "4aa080f3-39f6-4620-8870-73840ff446fb", "policyName": "568d0fc4-ac9d-4cee-95f1-bac6863b9b38", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "325c22dd-4c4b-4631-96d9-eca1c32331da", "policyName": "38487fdd-3503-4967-ba2c-281ca974a5d3"}] = reason {
	checkPrincipalRole({"admin"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0x37e28cd7"})
	reason = {"type": "permit", "policyId": "325c22dd-4c4b-4631-96d9-eca1c32331da", "policyName": "38487fdd-3503-4967-ba2c-281ca974a5d3", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "d8de9d7d-421c-4b82-863d-f0f3b3040bc9", "policyName": "9dac2d74-54a4-415a-90ae-ed9786365b30"}] = reason {
	checkPrincipalRole({"member"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0xa3105f63"})
	reason = {"type": "permit", "policyId": "d8de9d7d-421c-4b82-863d-f0f3b3040bc9", "policyName": "9dac2d74-54a4-415a-90ae-ed9786365b30", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "dd7ded3d-1392-4c46-93bc-c751aaf93fb3", "policyName": "04051b89-0ba7-454a-bbc2-ea8a66e80ef1"}] = reason {
	checkPrincipalRole({"admin"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0x77f57d50"})
	reason = {"type": "permit", "policyId": "dd7ded3d-1392-4c46-93bc-c751aaf93fb3", "policyName": "04051b89-0ba7-454a-bbc2-ea8a66e80ef1", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "fadcd82a-a924-4410-aea7-924d0ac58c80", "policyName": "cf85beee-91d9-4b16-a234-e9231c5b5589"}] = reason {
	checkPrincipalRole({"member"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0x4b4a0bdf"})
	reason = {"type": "permit", "policyId": "fadcd82a-a924-4410-aea7-924d0ac58c80", "policyName": "cf85beee-91d9-4b16-a234-e9231c5b5589", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "bae0c446-993f-45f2-b7ef-dc435f29988a", "policyName": "3b1a5031-84c0-4eec-bfd3-1fab190a0ca3"}] = reason {
	checkPrincipalRole({"member"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0x77f57d50"})
	reason = {"type": "permit", "policyId": "bae0c446-993f-45f2-b7ef-dc435f29988a", "policyName": "3b1a5031-84c0-4eec-bfd3-1fab190a0ca3", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "b87f2108-1ea2-47f8-94f9-2a1871ed7fcc", "policyName": "55039c69-dfde-4a2a-8b25-48d273ed5bd9"}] = reason {
	checkPrincipalRole({"admin"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0x27b8e40c"})
	reason = {"type": "permit", "policyId": "b87f2108-1ea2-47f8-94f9-2a1871ed7fcc", "policyName": "55039c69-dfde-4a2a-8b25-48d273ed5bd9", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "b1b570b1-c397-47a8-a28b-f8c50dc295e1", "policyName": "f65db91c-e5e9-4f23-892f-9e97eed41fca"}] = reason {
	checkPrincipalRole({"member"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0x27b8e40c"})
	reason = {"type": "permit", "policyId": "b1b570b1-c397-47a8-a28b-f8c50dc295e1", "policyName": "f65db91c-e5e9-4f23-892f-9e97eed41fca", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "fd509d4a-9dba-4e78-a1aa-9034f88bf904", "policyName": "2fa683d2-81d6-4c3f-a88d-9cadb2b5c21c"}] = reason {
	checkPrincipalRole({"member"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0x65c38bb8"})
	reason = {"type": "permit", "policyId": "fd509d4a-9dba-4e78-a1aa-9034f88bf904", "policyName": "2fa683d2-81d6-4c3f-a88d-9cadb2b5c21c", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "aebed4fa-f997-47d3-b63c-6418682eb655", "policyName": "0d745699-8176-44db-bde9-55474fba6cc7"}] = reason {
	checkPrincipalRole({"member"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0x9dafc880"})
	reason = {"type": "permit", "policyId": "aebed4fa-f997-47d3-b63c-6418682eb655", "policyName": "0d745699-8176-44db-bde9-55474fba6cc7", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "4f53fd7c-7805-40c5-b8e5-756b702cc6d8", "policyName": "e7cd1d07-c92b-404c-9ec7-a6a3b8c43790"}] = reason {
	checkPrincipalRole({"member"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0xa3105f63"})
	reason = {"type": "permit", "policyId": "4f53fd7c-7805-40c5-b8e5-756b702cc6d8", "policyName": "e7cd1d07-c92b-404c-9ec7-a6a3b8c43790", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "b5aa9671-183d-4b7c-a832-39adb66bb2e8", "policyName": "f0932890-7756-46c2-9509-9260416e6172"}] = reason {
	checkPrincipalRole({"member"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0x5e351737"})
	reason = {"type": "permit", "policyId": "b5aa9671-183d-4b7c-a832-39adb66bb2e8", "policyName": "f0932890-7756-46c2-9509-9260416e6172", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "51768cdd-8a51-49d9-9476-1bd994c59f33", "policyName": "15c8a58c-c63d-4964-a200-1846c20b7c72"}] = reason {
	checkPrincipalRole({"admin"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0x4b4a0bdf"})
	reason = {"type": "permit", "policyId": "51768cdd-8a51-49d9-9476-1bd994c59f33", "policyName": "15c8a58c-c63d-4964-a200-1846c20b7c72", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "f1c42fc4-80d0-453f-8113-581e8db3fc06", "policyName": "3d166ee3-7ed5-4c81-a3f6-5576f474573f"}] = reason {
	checkPrincipalRole({"admin"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0x9dafc880"})
	reason = {"type": "permit", "policyId": "f1c42fc4-80d0-453f-8113-581e8db3fc06", "policyName": "3d166ee3-7ed5-4c81-a3f6-5576f474573f", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "94946791-b00d-4ac6-9e2c-623dbee3378e", "policyName": "59409ad3-aa95-4bd6-b78e-0c9bf2b85025"}] = reason {
	checkPrincipalRole({"member"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0x27b8e40c"})
	reason = {"type": "permit", "policyId": "94946791-b00d-4ac6-9e2c-623dbee3378e", "policyName": "59409ad3-aa95-4bd6-b78e-0c9bf2b85025", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "022de576-1a25-4ffe-99df-1f20cf454c93", "policyName": "45019a29-b5ee-4d3a-bebb-918867ba411d"}] = reason {
	checkPrincipalRole({"admin"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0xa3105f63"})
	reason = {"type": "permit", "policyId": "022de576-1a25-4ffe-99df-1f20cf454c93", "policyName": "45019a29-b5ee-4d3a-bebb-918867ba411d", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "04502d97-2571-484d-a7b8-0385bac75a5b", "policyName": "ad512d85-3827-42a1-9f92-2373ad9c48a0"}] = reason {
	checkPrincipalRole({"admin"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0x77f57d50"})
	reason = {"type": "permit", "policyId": "04502d97-2571-484d-a7b8-0385bac75a5b", "policyName": "ad512d85-3827-42a1-9f92-2373ad9c48a0", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "4893728b-7c42-4483-a1d9-a884ff8123fa", "policyName": "67ebdaeb-4f83-45c5-8cec-68832fc69ec5"}] = reason {
	checkPrincipalRole({"member"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0x4b4a0bdf"})
	reason = {"type": "permit", "policyId": "4893728b-7c42-4483-a1d9-a884ff8123fa", "policyName": "67ebdaeb-4f83-45c5-8cec-68832fc69ec5", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "22cd9bc1-9bda-454d-a4ae-7b0267d9c4da", "policyName": "18133452-fb49-4cbb-ab98-4277f72153bd"}] = reason {
	checkPrincipalRole({"admin"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0x37e28cd7"})
	reason = {"type": "permit", "policyId": "22cd9bc1-9bda-454d-a4ae-7b0267d9c4da", "policyName": "18133452-fb49-4cbb-ab98-4277f72153bd", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "18283b20-a4a9-4fb6-b954-498547c365e2", "policyName": "8e489a05-1ad5-4327-b316-70c8da8dc8f3"}] = reason {
	checkPrincipalRole({"member"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0x37e28cd7"})
	reason = {"type": "permit", "policyId": "18283b20-a4a9-4fb6-b954-498547c365e2", "policyName": "8e489a05-1ad5-4327-b316-70c8da8dc8f3", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "e4f3b25a-f155-482c-8640-c1c75284cddb", "policyName": "4acb88b3-775d-44a7-a18a-45644d4967a0"}] = reason {
	checkPrincipalRole({"member"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0x65c38bb8"})
	reason = {"type": "permit", "policyId": "e4f3b25a-f155-482c-8640-c1c75284cddb", "policyName": "4acb88b3-775d-44a7-a18a-45644d4967a0", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "24487793-de4c-4d78-b352-a143fe25b322", "policyName": "06122f43-d9ff-49c1-925e-e812fd39c6aa"}] = reason {
	checkPrincipalRole({"member"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0x77f57d50"})
	reason = {"type": "permit", "policyId": "24487793-de4c-4d78-b352-a143fe25b322", "policyName": "06122f43-d9ff-49c1-925e-e812fd39c6aa", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "577497ba-4c2f-4d94-8a44-c54597c13610", "policyName": "bef5ea3c-8e2b-42f3-846e-79383dcfe5e0"}] = reason {
	checkPrincipalRole({"admin"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0x5e351737"})
	reason = {"type": "permit", "policyId": "577497ba-4c2f-4d94-8a44-c54597c13610", "policyName": "bef5ea3c-8e2b-42f3-846e-79383dcfe5e0", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "8ebcd3ae-0367-47e7-b939-74197c3f82c2", "policyName": "325bfba9-7c23-4b87-a676-fe61fb9b1826"}] = reason {
	checkPrincipalRole({"admin"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0x65c38bb8"})
	reason = {"type": "permit", "policyId": "8ebcd3ae-0367-47e7-b939-74197c3f82c2", "policyName": "325bfba9-7c23-4b87-a676-fe61fb9b1826", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "7880af47-8147-4aad-a5ad-099234bf9c36", "policyName": "1deb18cf-75cb-4cc0-850d-e73aa5c89c47"}] = reason {
	checkPrincipalRole({"admin"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0x27b8e40c"})
	reason = {"type": "permit", "policyId": "7880af47-8147-4aad-a5ad-099234bf9c36", "policyName": "1deb18cf-75cb-4cc0-850d-e73aa5c89c47", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "eebbadf5-56a0-4201-a653-32318e839dd7", "policyName": "4280497c-ba28-4e77-b36d-8c54ef4eeac2"}] = reason {
	checkPrincipalRole({"member"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0x37e28cd7"})
	reason = {"type": "permit", "policyId": "eebbadf5-56a0-4201-a653-32318e839dd7", "policyName": "4280497c-ba28-4e77-b36d-8c54ef4eeac2", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "568871dc-d061-4dab-b71f-38fa4ca9bae4", "policyName": "7d4df6cc-ea13-49b7-940c-5130c0ed0992"}] = reason {
	checkPrincipalRole({"member"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0xa3105f63"})
	reason = {"type": "permit", "policyId": "568871dc-d061-4dab-b71f-38fa4ca9bae4", "policyName": "7d4df6cc-ea13-49b7-940c-5130c0ed0992", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "f4ec829a-0804-4780-8a20-355d94814b8b", "policyName": "a386c957-0ef6-45a6-859a-3f07e490782d"}] = reason {
	checkPrincipalRole({"member"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0x9dafc880"})
	reason = {"type": "permit", "policyId": "f4ec829a-0804-4780-8a20-355d94814b8b", "policyName": "a386c957-0ef6-45a6-859a-3f07e490782d", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "b7bfa4ca-733e-4c23-8712-3122e877a8f6", "policyName": "0ff36d61-d11d-4ce9-a225-dabfa8a61dcf"}] = reason {
	checkPrincipalRole({"admin"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0x9dafc880"})
	reason = {"type": "permit", "policyId": "b7bfa4ca-733e-4c23-8712-3122e877a8f6", "policyName": "0ff36d61-d11d-4ce9-a225-dabfa8a61dcf", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "410b9fbc-acad-495b-8667-eb540a41b2df", "policyName": "ef73b23d-168a-4e1c-9e0b-eb54058b925d"}] = reason {
	checkPrincipalRole({"admin"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0xa3105f63"})
	reason = {"type": "permit", "policyId": "410b9fbc-acad-495b-8667-eb540a41b2df", "policyName": "ef73b23d-168a-4e1c-9e0b-eb54058b925d", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "a574f0bb-8b4d-42bf-b7d6-d6ff968b802c", "policyName": "2109d39d-6e3f-47bf-a6e6-0079128a77d8"}] = reason {
	checkPrincipalRole({"admin"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0x65c38bb8"})
	reason = {"type": "permit", "policyId": "a574f0bb-8b4d-42bf-b7d6-d6ff968b802c", "policyName": "2109d39d-6e3f-47bf-a6e6-0079128a77d8", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "c9b85e63-d8d4-4c7b-ba68-c0c68f694323", "policyName": "d9b9257d-d335-450f-8e6c-cc910344563f"}] = reason {
	checkPrincipalRole({"member"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0x27b8e40c"})
	reason = {"type": "permit", "policyId": "c9b85e63-d8d4-4c7b-ba68-c0c68f694323", "policyName": "d9b9257d-d335-450f-8e6c-cc910344563f", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "8a3f3b1e-ef4c-4f46-84e8-5967a0aa15df", "policyName": "6d560223-1c9a-433e-bb63-4fbfe9c2c2e9"}] = reason {
	checkPrincipalRole({"member"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0x77f57d50"})
	reason = {"type": "permit", "policyId": "8a3f3b1e-ef4c-4f46-84e8-5967a0aa15df", "policyName": "6d560223-1c9a-433e-bb63-4fbfe9c2c2e9", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "21fba82a-df5a-45ab-9e31-cc6d90c8df04", "policyName": "c69202e1-b2e1-4cdc-9c0d-57870ec9e226"}] = reason {
	checkPrincipalRole({"member"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0x65c38bb8"})
	reason = {"type": "permit", "policyId": "21fba82a-df5a-45ab-9e31-cc6d90c8df04", "policyName": "c69202e1-b2e1-4cdc-9c0d-57870ec9e226", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "0e2df99a-3b9b-464c-983f-48f326bf64b1", "policyName": "83a25c78-f344-49bc-81d3-0beac44ab84e"}] = reason {
	checkPrincipalRole({"member"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0x5e351737"})
	reason = {"type": "permit", "policyId": "0e2df99a-3b9b-464c-983f-48f326bf64b1", "policyName": "83a25c78-f344-49bc-81d3-0beac44ab84e", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "ae438b2d-5ec8-43b9-a41f-f41c80e7582a", "policyName": "8d0f728c-7214-43d5-ab4a-338c499d2eda"}] = reason {
	checkPrincipalRole({"admin"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0x37e28cd7"})
	reason = {"type": "permit", "policyId": "ae438b2d-5ec8-43b9-a41f-f41c80e7582a", "policyName": "8d0f728c-7214-43d5-ab4a-338c499d2eda", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "244114f3-ade4-4e2e-800d-80c1dfbafe9f", "policyName": "6eaaba91-2e24-4ce2-b201-90cda846c776"}] = reason {
	checkPrincipalRole({"admin"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0x4b4a0bdf"})
	reason = {"type": "permit", "policyId": "244114f3-ade4-4e2e-800d-80c1dfbafe9f", "policyName": "6eaaba91-2e24-4ce2-b201-90cda846c776", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "ed4225e6-4c55-4cfb-ae06-29bb5b6c9e68", "policyName": "e207ff6e-51a7-419c-b6bc-5f89d155e907"}] = reason {
	checkPrincipalRole({"admin"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0x77f57d50"})
	reason = {"type": "permit", "policyId": "ed4225e6-4c55-4cfb-ae06-29bb5b6c9e68", "policyName": "e207ff6e-51a7-419c-b6bc-5f89d155e907", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "1ed58576-22f4-4cc9-a86c-632d5de917c0", "policyName": "65970262-79ec-484d-a744-bd81dace3d15"}] = reason {
	checkPrincipalRole({"admin"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0x27b8e40c"})
	reason = {"type": "permit", "policyId": "1ed58576-22f4-4cc9-a86c-632d5de917c0", "policyName": "65970262-79ec-484d-a744-bd81dace3d15", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "f4b341f2-7cd0-40aa-84b5-2f3f79e8cd2c", "policyName": "8b8a4584-39e2-4b89-b471-eb6b262dfae9"}] = reason {
	checkPrincipalRole({"admin"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0x5e351737"})
	reason = {"type": "permit", "policyId": "f4b341f2-7cd0-40aa-84b5-2f3f79e8cd2c", "policyName": "8b8a4584-39e2-4b89-b471-eb6b262dfae9", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "1145deea-616e-4715-8a02-36d15ad7b313", "policyName": "e8069224-68c3-4073-9249-afe0f6544631"}] = reason {
	checkPrincipalRole({"member"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0x4b4a0bdf"})
	reason = {"type": "permit", "policyId": "1145deea-616e-4715-8a02-36d15ad7b313", "policyName": "e8069224-68c3-4073-9249-afe0f6544631", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "7bf33033-df82-4f79-9926-c6accb36975b", "policyName": "552fff6a-af3f-4a24-8b9a-4b77db6fc971"}] = reason {
	checkPrincipalId({"13b8f90e-d929-49a9-8f8c-a40bfff0f09e"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x4c60051384bd2d3c01bfc845cf5f4b44bcbe9de5"})
	reason = {"type": "permit", "policyId": "7bf33033-df82-4f79-9926-c6accb36975b", "policyName": "552fff6a-af3f-4a24-8b9a-4b77db6fc971", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "44328f37-691d-4506-95e3-9e3e0caae65a", "policyName": "afef70ed-9e23-4f79-a95c-a0616c01b5d1"}] = reason {
	checkPrincipalId({"debb4c0f-235c-497e-8009-7476b7494c26"})
	checkWalletAddress({"0xa1d6e9a37b3fb99b226f64741627af6f4ae219e1"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	reason = {"type": "permit", "policyId": "44328f37-691d-4506-95e3-9e3e0caae65a", "policyName": "afef70ed-9e23-4f79-a95c-a0616c01b5d1", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "ccba2e2c-8b73-40bc-ba41-de251547163d", "policyName": "6a898c76-584f-4616-8246-c5d31afc07c9"}] = reason {
	checkPrincipalId({"13b8f90e-d929-49a9-8f8c-a40bfff0f09e"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x4c60051384bd2d3c01bfc845cf5f4b44bcbe9de5"})
	checkIntentHexSignature({"0x24856bc3"})
	reason = {"type": "permit", "policyId": "ccba2e2c-8b73-40bc-ba41-de251547163d", "policyName": "6a898c76-584f-4616-8246-c5d31afc07c9", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "23cfde5f-b773-4132-9a22-6228ea66b492", "policyName": "48d24de0-3d05-46ce-81cf-3f81e8022283"}] = reason {
	checkPrincipalId({"13b8f90e-d929-49a9-8f8c-a40bfff0f09e"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x4c60051384bd2d3c01bfc845cf5f4b44bcbe9de5"})
	checkIntentHexSignature({"0x24856bc3"})
	reason = {"type": "permit", "policyId": "23cfde5f-b773-4132-9a22-6228ea66b492", "policyName": "48d24de0-3d05-46ce-81cf-3f81e8022283", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "0e126cd3-3b42-4bac-a683-ac5477995a47", "policyName": "a86e9f14-4018-43cc-b15a-fc1e42ec4406"}] = reason {
	checkPrincipalId({"13b8f90e-d929-49a9-8f8c-a40bfff0f09e"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x4c60051384bd2d3c01bfc845cf5f4b44bcbe9de5"})
	checkIntentHexSignature({"0x24856bc3"})
	reason = {"type": "permit", "policyId": "0e126cd3-3b42-4bac-a683-ac5477995a47", "policyName": "a86e9f14-4018-43cc-b15a-fc1e42ec4406", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "c28f2481-2417-4a39-b327-b788198a3916", "policyName": "68627533-b4de-4c60-9bff-8419678638a5"}] = reason {
	checkPrincipalId({"13b8f90e-d929-49a9-8f8c-a40bfff0f09e"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x4c60051384bd2d3c01bfc845cf5f4b44bcbe9de5"})
	checkIntentHexSignature({"0x24856bc3"})
	reason = {"type": "permit", "policyId": "c28f2481-2417-4a39-b327-b788198a3916", "policyName": "68627533-b4de-4c60-9bff-8419678638a5", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "0a3df350-0876-41d9-a560-ebec793edfb4", "policyName": "8ddd52ba-fe72-488a-8c0a-49215cca56fd"}] = reason {
	checkPrincipalId({"auth0|62e3998004533b042cb44ccf"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
	reason = {"type": "permit", "policyId": "0a3df350-0876-41d9-a560-ebec793edfb4", "policyName": "8ddd52ba-fe72-488a-8c0a-49215cca56fd", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "585b92b2-50e2-48f2-9931-3d9ec9fc2789", "policyName": "94890c04-d3d2-4614-82cd-1709abd96c0f"}] = reason {
	checkPrincipalId({"auth0|62e3998004533b042cb44ccf"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
	reason = {"type": "permit", "policyId": "585b92b2-50e2-48f2-9931-3d9ec9fc2789", "policyName": "94890c04-d3d2-4614-82cd-1709abd96c0f", "approvalsSatisfied": [], "approvalsMissing": []}
}

forbid[{"policyId": "2513c10e-e210-46ee-952f-906017ebf1d8", "policyName": "746bbc21-c869-4d2e-8236-dda489274610"}] = reason {
	checkPrincipalId({"auth0|62e1d7ca04533b042cb42419"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
	reason = {"type": "forbid", "policyId": "2513c10e-e210-46ee-952f-906017ebf1d8", "policyName": "746bbc21-c869-4d2e-8236-dda489274610", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "6c7e8a4d-12a1-49a8-9889-cc0658a00b02", "policyName": "7bf29225-1825-4bd6-8b8a-ef2c0a40707a"}] = reason {
	checkPrincipalId({"615f46d7-7039-43a3-a904-6daccaf72e61"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0xfbe3ab0cbfbd17d06bdd73aa3f55aaf038720f59"})
	checkIntentHexSignature({"0x23b872dd"})
	reason = {"type": "permit", "policyId": "6c7e8a4d-12a1-49a8-9889-cc0658a00b02", "policyName": "7bf29225-1825-4bd6-8b8a-ef2c0a40707a", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "3047c664-0ef1-42ed-9c01-4e6293e0db26", "policyName": "dda465a6-8dc1-4142-9d00-ec6313955f01"}] = reason {
	checkPrincipalId({"auth0|62e3998004533b042cb44ccf"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
	checkIntentHexSignature({"0x42842e0e"})
	reason = {"type": "permit", "policyId": "3047c664-0ef1-42ed-9c01-4e6293e0db26", "policyName": "dda465a6-8dc1-4142-9d00-ec6313955f01", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "287b7c2a-4ed3-44af-a389-c59c5a77a48a", "policyName": "d1f6e863-ae60-409d-870f-3faf7032d616"}] = reason {
	checkPrincipalRole({"admin"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
	checkIntentHexSignature({"0x65b4613f"})
	reason = {"type": "permit", "policyId": "287b7c2a-4ed3-44af-a389-c59c5a77a48a", "policyName": "d1f6e863-ae60-409d-870f-3faf7032d616", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "93c22f62-43c6-48a2-9dd9-742614ef4ed8", "policyName": "39550a81-1c30-48f3-a590-6cbb6ddd375d"}] = reason {
	checkPrincipalRole({"admin"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
	checkIntentHexSignature({"0xef68253d"})
	reason = {"type": "permit", "policyId": "93c22f62-43c6-48a2-9dd9-742614ef4ed8", "policyName": "39550a81-1c30-48f3-a590-6cbb6ddd375d", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "7d5968e8-ca47-4d48-afe6-763af115c05d", "policyName": "9d37e0ab-8b25-48d3-b0ba-766f15a12626"}] = reason {
	checkPrincipalRole({"admin"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
	checkIntentHexSignature({"0x93551267"})
	reason = {"type": "permit", "policyId": "7d5968e8-ca47-4d48-afe6-763af115c05d", "policyName": "9d37e0ab-8b25-48d3-b0ba-766f15a12626", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "e8657990-e615-4aef-abb9-184428892c25", "policyName": "03959b54-5fdb-4c2c-b10e-996e07b7b1d4"}] = reason {
	checkPrincipalRole({"member"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
	checkIntentHexSignature({"0x93551267"})
	reason = {"type": "permit", "policyId": "e8657990-e615-4aef-abb9-184428892c25", "policyName": "03959b54-5fdb-4c2c-b10e-996e07b7b1d4", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "6b82dc54-6ce9-4cd9-9455-c274063d6375", "policyName": "67151495-b1a6-4632-8dff-a84277205daa"}] = reason {
	checkPrincipalRole({"admin"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0xa2a13ce1824f3916fc84c65e559391fc6674e6e8"})
	checkIntentHexSignature({"0x93e39539"})
	reason = {"type": "permit", "policyId": "6b82dc54-6ce9-4cd9-9455-c274063d6375", "policyName": "67151495-b1a6-4632-8dff-a84277205daa", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "e13f409b-caed-4c51-8f55-1b205c828750", "policyName": "e9918e0e-7621-4d95-afa3-deeaed768409"}] = reason {
	checkPrincipalRole({"member"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
	checkIntentHexSignature({"0x65b4613f"})
	reason = {"type": "permit", "policyId": "e13f409b-caed-4c51-8f55-1b205c828750", "policyName": "e9918e0e-7621-4d95-afa3-deeaed768409", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "73a5e14c-0bb0-46f6-a12f-e6a7007ee696", "policyName": "6c11f2c3-c9dc-4a67-afbb-14d2418b9233"}] = reason {
	checkPrincipalRole({"admin"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
	checkIntentHexSignature({"0x44c9b41f"})
	reason = {"type": "permit", "policyId": "73a5e14c-0bb0-46f6-a12f-e6a7007ee696", "policyName": "6c11f2c3-c9dc-4a67-afbb-14d2418b9233", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "a05071ac-7fa2-4fcc-b556-cc5a414c03bd", "policyName": "c71e98e1-f4ef-4682-b628-79d03473fbdc"}] = reason {
	checkPrincipalRole({"admin"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
	checkIntentHexSignature({"0x86c68622"})
	reason = {"type": "permit", "policyId": "a05071ac-7fa2-4fcc-b556-cc5a414c03bd", "policyName": "c71e98e1-f4ef-4682-b628-79d03473fbdc", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "65abd628-954c-4285-b81e-945d72bd71c1", "policyName": "c0469d8c-1120-4985-8aa9-2df7a66885ea"}] = reason {
	checkPrincipalRole({"member"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0xa2a13ce1824f3916fc84c65e559391fc6674e6e8"})
	checkIntentHexSignature({"0x93e39539"})
	reason = {"type": "permit", "policyId": "65abd628-954c-4285-b81e-945d72bd71c1", "policyName": "c0469d8c-1120-4985-8aa9-2df7a66885ea", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "4e39c15c-5740-4add-9f55-e41ea53c12f7", "policyName": "f473c356-a95b-496a-83ad-a67e07f67e59"}] = reason {
	checkPrincipalRole({"member"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0x902ead61"})
	reason = {"type": "permit", "policyId": "4e39c15c-5740-4add-9f55-e41ea53c12f7", "policyName": "f473c356-a95b-496a-83ad-a67e07f67e59", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "28d20d57-6d85-440b-86ec-77d286e59563", "policyName": "fe3167f2-c5c4-4ed1-9217-cfa02e858515"}] = reason {
	checkPrincipalRole({"admin"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x6bc613a25afe159b70610b64783ca51c9258b92e"})
	checkIntentHexSignature({"0x6548b7ae"})
	reason = {"type": "permit", "policyId": "28d20d57-6d85-440b-86ec-77d286e59563", "policyName": "fe3167f2-c5c4-4ed1-9217-cfa02e858515", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "1deffca8-835b-407b-b26c-2227aa2a34a5", "policyName": "a018b301-3234-434b-83df-8547c14e926b"}] = reason {
	checkPrincipalRole({"member"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
	checkIntentHexSignature({"0x86c68622"})
	reason = {"type": "permit", "policyId": "1deffca8-835b-407b-b26c-2227aa2a34a5", "policyName": "a018b301-3234-434b-83df-8547c14e926b", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "9429ec53-a27f-40f9-8dc6-89433902a401", "policyName": "8b357452-f7aa-4585-a798-720ac5a64e59"}] = reason {
	checkPrincipalRole({"member"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
	checkIntentHexSignature({"0x5d878596"})
	reason = {"type": "permit", "policyId": "9429ec53-a27f-40f9-8dc6-89433902a401", "policyName": "8b357452-f7aa-4585-a798-720ac5a64e59", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "609e87c8-b118-4cc1-8424-799cd7b4cbee", "policyName": "5f1644df-8377-4691-91b0-fe6aa00d621f"}] = reason {
	checkPrincipalRole({"admin"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0xdd86381e"})
	reason = {"type": "permit", "policyId": "609e87c8-b118-4cc1-8424-799cd7b4cbee", "policyName": "5f1644df-8377-4691-91b0-fe6aa00d621f", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "a499c8dc-51ce-4a44-a499-bee03464d82a", "policyName": "247157a4-1b64-4e75-8321-b98e38b0389e"}] = reason {
	checkPrincipalRole({"admin"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0x51782474"})
	reason = {"type": "permit", "policyId": "a499c8dc-51ce-4a44-a499-bee03464d82a", "policyName": "247157a4-1b64-4e75-8321-b98e38b0389e", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "60f67e05-185d-49af-ba3d-03f64e331a42", "policyName": "eabd89d2-194d-42cd-81c2-edef36b76caa"}] = reason {
	checkPrincipalRole({"member"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0xeae2ea7e"})
	reason = {"type": "permit", "policyId": "60f67e05-185d-49af-ba3d-03f64e331a42", "policyName": "eabd89d2-194d-42cd-81c2-edef36b76caa", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "386e9765-5d48-4a2b-a334-2b86dc7b09ca", "policyName": "99e86b13-641e-47ca-8936-a95d3a6f437b"}] = reason {
	checkPrincipalRole({"admin"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
	checkIntentHexSignature({"0xd2df3a9e"})
	reason = {"type": "permit", "policyId": "386e9765-5d48-4a2b-a334-2b86dc7b09ca", "policyName": "99e86b13-641e-47ca-8936-a95d3a6f437b", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "5d2bf70b-0dd5-472c-8166-ecf7778ca34b", "policyName": "964091bf-3bba-4699-b3e1-d3eb46ca6d8c"}] = reason {
	checkPrincipalRole({"member"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
	checkIntentHexSignature({"0xd4db00cc"})
	reason = {"type": "permit", "policyId": "5d2bf70b-0dd5-472c-8166-ecf7778ca34b", "policyName": "964091bf-3bba-4699-b3e1-d3eb46ca6d8c", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "1434ebb9-27ed-4e47-acca-7965ed127e24", "policyName": "c5510e0e-7a09-4db9-9690-019dad364989"}] = reason {
	checkPrincipalRole({"member"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x6bc613a25afe159b70610b64783ca51c9258b92e"})
	checkIntentHexSignature({"0x6548b7ae"})
	reason = {"type": "permit", "policyId": "1434ebb9-27ed-4e47-acca-7965ed127e24", "policyName": "c5510e0e-7a09-4db9-9690-019dad364989", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "cfbf3fe3-a755-4b05-8689-80fbabd9450f", "policyName": "acf62623-e4f0-414a-99f8-2e30552d2976"}] = reason {
	checkPrincipalRole({"admin"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
	checkIntentHexSignature({"0xd4db00cc"})
	reason = {"type": "permit", "policyId": "cfbf3fe3-a755-4b05-8689-80fbabd9450f", "policyName": "acf62623-e4f0-414a-99f8-2e30552d2976", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "8da1dc26-1828-48bd-bf0b-4868b3b4fc7b", "policyName": "110502e9-ac0c-423f-9a8f-6376e2ffed88"}] = reason {
	checkPrincipalRole({"member"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0x51782474"})
	reason = {"type": "permit", "policyId": "8da1dc26-1828-48bd-bf0b-4868b3b4fc7b", "policyName": "110502e9-ac0c-423f-9a8f-6376e2ffed88", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "9b79e7c9-541a-49b6-93ad-8a7e3d4d8bf7", "policyName": "bc3fae98-2e50-4ff0-9c82-cd77cc6ee143"}] = reason {
	checkPrincipalId({"13b8f90e-d929-49a9-8f8c-a40bfff0f09e"})
	checkWalletAddress({"0x7a0854f64ded80455208ad6939950d915b2a101e"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x3df16fb8dc28f63565af2815e04a3368360ffd23"})
	reason = {"type": "permit", "policyId": "9b79e7c9-541a-49b6-93ad-8a7e3d4d8bf7", "policyName": "bc3fae98-2e50-4ff0-9c82-cd77cc6ee143", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "d5b1dcca-018b-4036-a3db-b4832c435ab9", "policyName": "44b5d3e8-5e02-428f-b057-61dd6293e374"}] = reason {
	checkPrincipalRole({"member"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
	checkIntentHexSignature({"0x9edcab23"})
	reason = {"type": "permit", "policyId": "d5b1dcca-018b-4036-a3db-b4832c435ab9", "policyName": "44b5d3e8-5e02-428f-b057-61dd6293e374", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "326a3394-4904-43e5-acef-b8ffdfa0cad6", "policyName": "a8ed180c-6607-4d6d-bce5-7be3a671dd2d"}] = reason {
	checkPrincipalRole({"admin"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
	checkIntentHexSignature({"0x9edcab23"})
	reason = {"type": "permit", "policyId": "326a3394-4904-43e5-acef-b8ffdfa0cad6", "policyName": "a8ed180c-6607-4d6d-bce5-7be3a671dd2d", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "33529971-c05a-4b4b-9e04-6995141d65c8", "policyName": "ae036a24-fa6c-463c-acfa-59914cf67a59"}] = reason {
	checkPrincipalRole({"admin"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0xd3ac2166"})
	reason = {"type": "permit", "policyId": "33529971-c05a-4b4b-9e04-6995141d65c8", "policyName": "ae036a24-fa6c-463c-acfa-59914cf67a59", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "53997e36-4327-47b8-b49b-484ced244f97", "policyName": "325ec9af-67dc-4a2a-9f90-1703406cf261"}] = reason {
	checkPrincipalRole({"member"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0xd3ac2166"})
	reason = {"type": "permit", "policyId": "53997e36-4327-47b8-b49b-484ced244f97", "policyName": "325ec9af-67dc-4a2a-9f90-1703406cf261", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "a07c1f27-259f-40b7-83ff-79f13e8b8de0", "policyName": "48412cc3-a596-4b04-aca4-b000f1e1335b"}] = reason {
	checkPrincipalRole({"admin"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0x1521465b"})
	reason = {"type": "permit", "policyId": "a07c1f27-259f-40b7-83ff-79f13e8b8de0", "policyName": "48412cc3-a596-4b04-aca4-b000f1e1335b", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "2a3356f8-dbb1-4cea-bc4f-4e37b7d89bc9", "policyName": "cd19a84f-4b15-440f-a389-5f70420c43cd"}] = reason {
	checkPrincipalRole({"admin"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0x902ead61"})
	reason = {"type": "permit", "policyId": "2a3356f8-dbb1-4cea-bc4f-4e37b7d89bc9", "policyName": "cd19a84f-4b15-440f-a389-5f70420c43cd", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "de81d657-b7c8-406b-8fb3-0a57f5a4858a", "policyName": "c4f40208-9037-49a1-870e-7303ca1c0c14"}] = reason {
	checkPrincipalRole({"member"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0x1521465b"})
	reason = {"type": "permit", "policyId": "de81d657-b7c8-406b-8fb3-0a57f5a4858a", "policyName": "c4f40208-9037-49a1-870e-7303ca1c0c14", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "1ba9506d-6b4c-4d62-bed5-7c2dedae5024", "policyName": "bc39284b-490a-43c4-bb5a-87862a1ee4a9"}] = reason {
	checkPrincipalRole({"admin"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0xeae2ea7e"})
	reason = {"type": "permit", "policyId": "1ba9506d-6b4c-4d62-bed5-7c2dedae5024", "policyName": "bc39284b-490a-43c4-bb5a-87862a1ee4a9", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "9be912eb-a911-4bed-a1ca-48caed389099", "policyName": "32a8e7af-b58a-476e-908a-74bb561f61b1"}] = reason {
	checkPrincipalRole({"member"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
	checkIntentHexSignature({"0xe01c7002"})
	reason = {"type": "permit", "policyId": "9be912eb-a911-4bed-a1ca-48caed389099", "policyName": "32a8e7af-b58a-476e-908a-74bb561f61b1", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "687e0158-7c40-476c-b887-60bc03430d9c", "policyName": "f7e4631d-e5ae-435f-a00c-23448909e7db"}] = reason {
	checkPrincipalRole({"admin"})
	checkAction({"signTransaction"})
	checkIntentType({"transferErc721", "transferErc1155"})
	reason = {"type": "permit", "policyId": "687e0158-7c40-476c-b887-60bc03430d9c", "policyName": "f7e4631d-e5ae-435f-a00c-23448909e7db", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "ed31ae36-e116-4be4-a4d9-ed838aed4ab0", "policyName": "7af674ef-428e-4e13-9d79-4a38ff4c0eb2"}] = reason {
	checkPrincipalRole({"admin"})
	checkAction({"signTransaction"})
	checkIntentType({"transferErc721", "transferErc1155"})
	reason = {"type": "permit", "policyId": "ed31ae36-e116-4be4-a4d9-ed838aed4ab0", "policyName": "7af674ef-428e-4e13-9d79-4a38ff4c0eb2", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "df163d6b-6c8b-43d6-925a-1e4cb19deb47", "policyName": "fe3d3406-aa65-4a20-8c72-7a24b614151a"}] = reason {
	checkPrincipalRole({"admin"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
	checkIntentHexSignature({"0xe01c7002"})
	reason = {"type": "permit", "policyId": "df163d6b-6c8b-43d6-925a-1e4cb19deb47", "policyName": "fe3d3406-aa65-4a20-8c72-7a24b614151a", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "3d6a3adb-f61c-40d0-b814-d95a12d2386f", "policyName": "f30d6697-2cda-4553-9e7d-66886110a882"}] = reason {
	checkPrincipalRole({"admin"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0xdd7944f5"})
	reason = {"type": "permit", "policyId": "3d6a3adb-f61c-40d0-b814-d95a12d2386f", "policyName": "f30d6697-2cda-4553-9e7d-66886110a882", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "b3ef2506-1eed-4e06-9226-d0fd534da6a7", "policyName": "7fc04ac3-368f-42b1-b9f4-06761241567c"}] = reason {
	checkPrincipalRole({"member"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
	checkIntentHexSignature({"0x44c9b41f"})
	reason = {"type": "permit", "policyId": "b3ef2506-1eed-4e06-9226-d0fd534da6a7", "policyName": "7fc04ac3-368f-42b1-b9f4-06761241567c", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "b57d2cac-aef1-49e9-b7ff-94ecccad469f", "policyName": "8a30c2d3-ffe0-473c-a1b4-730754cb9430"}] = reason {
	checkPrincipalRole({"member"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0xa2a13ce1824f3916fc84c65e559391fc6674e6e8"})
	checkIntentHexSignature({"0x5757b38a"})
	reason = {"type": "permit", "policyId": "b57d2cac-aef1-49e9-b7ff-94ecccad469f", "policyName": "8a30c2d3-ffe0-473c-a1b4-730754cb9430", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "3e72c178-43ac-455e-a42b-e7089909c499", "policyName": "5d164652-f401-4ae3-acf1-048927eb7a88"}] = reason {
	checkPrincipalId({"13b8f90e-d929-49a9-8f8c-a40bfff0f09e"})
	checkWalletAddress({"0x7a0854f64ded80455208ad6939950d915b2a101e"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	reason = {"type": "permit", "policyId": "3e72c178-43ac-455e-a42b-e7089909c499", "policyName": "5d164652-f401-4ae3-acf1-048927eb7a88", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "5d705964-d8cf-4d2b-9d36-a51459f7e495", "policyName": "64a3a0e5-8d9c-4b3a-a82a-2271a3f6aacc"}] = reason {
	checkPrincipalRole({"member"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0xdd7944f5"})
	reason = {"type": "permit", "policyId": "5d705964-d8cf-4d2b-9d36-a51459f7e495", "policyName": "64a3a0e5-8d9c-4b3a-a82a-2271a3f6aacc", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "0b779680-b302-46d5-88ee-8e7b8535e8aa", "policyName": "3ecd9a08-abee-4ab3-a15b-d0fbe348240f"}] = reason {
	checkPrincipalRole({"member"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
	checkIntentHexSignature({"0xef68253d"})
	reason = {"type": "permit", "policyId": "0b779680-b302-46d5-88ee-8e7b8535e8aa", "policyName": "3ecd9a08-abee-4ab3-a15b-d0fbe348240f", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "ec33cce7-de46-4422-b8ba-aacbed3aa36f", "policyName": "959057f2-ad2c-4d45-a0ec-0c2da6f627c5"}] = reason {
	checkPrincipalRole({"member"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x4c60051384bd2d3c01bfc845cf5f4b44bcbe9de5"})
	checkIntentHexSignature({"0x3593564c"})
	reason = {"type": "permit", "policyId": "ec33cce7-de46-4422-b8ba-aacbed3aa36f", "policyName": "959057f2-ad2c-4d45-a0ec-0c2da6f627c5", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "17db31f1-31ff-4095-ba21-708211d5b9c9", "policyName": "d1100363-5283-4a61-b905-dfc760815bff"}] = reason {
	checkPrincipalRole({"member"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
	checkIntentHexSignature({"0xd2df3a9e"})
	reason = {"type": "permit", "policyId": "17db31f1-31ff-4095-ba21-708211d5b9c9", "policyName": "d1100363-5283-4a61-b905-dfc760815bff", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "c4500657-ee12-4bca-afa9-54ccd4c70de9", "policyName": "8f409d35-aea5-45b2-bbf9-64569fed60ae"}] = reason {
	checkPrincipalRole({"admin"})
	checkAction({"signTransaction"})
	checkIntentType({"transferErc20", "transferNative"})
	reason = {"type": "permit", "policyId": "c4500657-ee12-4bca-afa9-54ccd4c70de9", "policyName": "8f409d35-aea5-45b2-bbf9-64569fed60ae", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "c11f5e06-98ab-426a-b900-51660f0d7b14", "policyName": "20d630d0-5f68-47a8-8e8a-554ed8ab505a"}] = reason {
	checkPrincipalRole({"member"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0xdd86381e"})
	reason = {"type": "permit", "policyId": "c11f5e06-98ab-426a-b900-51660f0d7b14", "policyName": "20d630d0-5f68-47a8-8e8a-554ed8ab505a", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "867317a3-8bff-421b-9170-ea8fcd72dc97", "policyName": "ad2488cf-8ab6-41b0-bc9e-41ef61153fec"}] = reason {
	checkPrincipalRole({"member"})
	checkAction({"signTypedData"})
	checkIntentType({"signTypedData"})
	checkIntentDomain({"name": ["Crypto Unicorns Authentication"], "version": ["1"]})
	reason = {"type": "permit", "policyId": "867317a3-8bff-421b-9170-ea8fcd72dc97", "policyName": "ad2488cf-8ab6-41b0-bc9e-41ef61153fec", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "46fe5278-aa6c-44a8-9437-e9060c5c116d", "policyName": "816207da-5679-43d9-90cb-0ae17d3e26df"}] = reason {
	checkPrincipalRole({"admin"})
	checkAction({"signMessage", "signTypedData"})
	checkIntentType({"signMessage", "signTypedData"})
	reason = {"type": "permit", "policyId": "46fe5278-aa6c-44a8-9437-e9060c5c116d", "policyName": "816207da-5679-43d9-90cb-0ae17d3e26df", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "5d0cb604-6ce4-45e9-834c-a50acd6147a6", "policyName": "8d79f8c1-8c65-441b-9319-ff5c9803bc65"}] = reason {
	checkAction({"signTransaction"})
	checkIntentType({"transferErc20", "transferNative"})
	reason = {"type": "permit", "policyId": "5d0cb604-6ce4-45e9-834c-a50acd6147a6", "policyName": "8d79f8c1-8c65-441b-9319-ff5c9803bc65", "approvalsSatisfied": [], "approvalsMissing": []}
}
