package main

permit[{"policyId": "ca93bc3c-8664-407d-88eb-8d1aca74e03c", "policyName": "c4cb0186-a0e8-48b8-bf05-8eaffc9efdcc"}] = reason {
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x28597ea60030fbae79088d89d803f25143c7a6b5"})
	checkIntentHexSignature({"0xc16fad97"})
	reason = {"type": "permit", "policyId": "ca93bc3c-8664-407d-88eb-8d1aca74e03c", "policyName": "c4cb0186-a0e8-48b8-bf05-8eaffc9efdcc", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "5b7b8998-3b64-4de5-b674-44317fe92e3f", "policyName": "13fabcb5-e7d9-4e47-985e-9b048ebb7003"}] = reason {
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x28597ea60030fbae79088d89d803f25143c7a6b5"})
	checkIntentHexSignature({"0x2b3f22b4"})
	reason = {"type": "permit", "policyId": "5b7b8998-3b64-4de5-b674-44317fe92e3f", "policyName": "13fabcb5-e7d9-4e47-985e-9b048ebb7003", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "92a2467f-9f74-4b66-b0ee-39b5d8a0369a", "policyName": "ec539dbc-e44f-4e5b-8fe5-6f61de0c4e7b"}] = reason {
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"approveTokenAllowance"})
	checkIntentToken({"eip155:137/erc20:0x431cd3c9ac9fc73644bf68bf5691f4b83f9e104f"})
	checkIntentSpender({"eip155:137:0x28597ea60030fbae79088d89d803f25143c7a6b5"})
	reason = {"type": "permit", "policyId": "92a2467f-9f74-4b66-b0ee-39b5d8a0369a", "policyName": "ec539dbc-e44f-4e5b-8fe5-6f61de0c4e7b", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "ee76634f-84bd-428e-9cc8-14a9f5f9e4e4", "policyName": "e61592db-ec4a-435b-bce7-71b12ac57693"}] = reason {
	checkPrincipalRole({"admin"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"transferErc20", "transferNative"})
	reason = {"type": "permit", "policyId": "ee76634f-84bd-428e-9cc8-14a9f5f9e4e4", "policyName": "e61592db-ec4a-435b-bce7-71b12ac57693", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "a6e2ec25-f437-43b8-b811-01cdee573658", "policyName": "a68e8d20-0419-475c-8fcc-b17d4de8c955"}] = reason {
	checkPrincipalRole({"admin"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"transferErc721", "transferErc1155"})
	reason = {"type": "permit", "policyId": "a6e2ec25-f437-43b8-b811-01cdee573658", "policyName": "a68e8d20-0419-475c-8fcc-b17d4de8c955", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "3dfcef2a-1d86-4056-b3ef-4d8d32555ac8", "policyName": "f42953dc-b6d9-4186-bdcc-1b834779f462"}] = reason {
	checkPrincipalId({"auth0|62e1d7ca04533b042cb42419"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"transferErc20"})
	checkIntentToken({"eip155:137:0x431cd3c9ac9fc73644bf68bf5691f4b83f9e104f"})
	checkWalletAddress({"0x0ff514df05c423a120152df9e04ba94fab7b3491"})
	checkIntentAmount({"currency": "*", "operator": "lt", "value": "2"})
	reason = {"type": "permit", "policyId": "3dfcef2a-1d86-4056-b3ef-4d8d32555ac8", "policyName": "f42953dc-b6d9-4186-bdcc-1b834779f462", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "1ce7364f-3a44-4267-bbf5-5079e176acf3", "policyName": "417c3e87-9dc2-4ec8-9b8f-b5a421c90226"}] = reason {
	checkPrincipalId({"auth0|62e1d7ca04533b042cb42419"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
	reason = {"type": "permit", "policyId": "1ce7364f-3a44-4267-bbf5-5079e176acf3", "policyName": "417c3e87-9dc2-4ec8-9b8f-b5a421c90226", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "ddc456cd-cc03-425d-9cfa-14f7e19a35ff", "policyName": "593000a9-05fd-4e2a-88b1-946115dfcdcf"}] = reason {
	checkPrincipalId({"auth0|62e1d7ca04533b042cb42419"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
	reason = {"type": "permit", "policyId": "ddc456cd-cc03-425d-9cfa-14f7e19a35ff", "policyName": "593000a9-05fd-4e2a-88b1-946115dfcdcf", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "face08c5-bf20-4ddb-babc-52f5e5d9fd0e", "policyName": "a4a6b1b0-638a-4535-b48b-32e99ce58d92"}] = reason {
	checkPrincipalId({"auth0|62e1d7ca04533b042cb42419"})
	checkResourceIntegrity
	checkDestinationAddress({"nftAssetTransfer"})
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"transferErc721"})
	checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
	reason = {"type": "permit", "policyId": "face08c5-bf20-4ddb-babc-52f5e5d9fd0e", "policyName": "a4a6b1b0-638a-4535-b48b-32e99ce58d92", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "e5aa3728-60ac-466c-8823-2e71f38e8c1d", "policyName": "0a4a01d5-78ce-4cf8-9f97-bc5726e173df"}] = reason {
	checkPrincipalId({"auth0|64784e51867282eb243a9daa"})
	checkIntentDomain({"version": ["1"], "name": ["Crypto Unicorns Authentication"], "chainId": ["137"]})
	checkAction({"signTypedData"})
	checkIntentType({"signTypedData"})
	reason = {"type": "permit", "policyId": "e5aa3728-60ac-466c-8823-2e71f38e8c1d", "policyName": "0a4a01d5-78ce-4cf8-9f97-bc5726e173df", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "265ad6cd-a87d-4210-b06b-aa384916ac8a", "policyName": "fd02d4da-2c20-49bb-a904-57c5a81bc0e5"}] = reason {
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"approveTokenAllowance"})
	checkIntentToken({"eip155:137/erc20:0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad"})
	reason = {"type": "permit", "policyId": "265ad6cd-a87d-4210-b06b-aa384916ac8a", "policyName": "fd02d4da-2c20-49bb-a904-57c5a81bc0e5", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "72944d83-8365-458a-a70f-beac81466392", "policyName": "dd0c5566-8e45-4ada-9811-73eac1886b68"}] = reason {
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"approveTokenAllowance"})
	checkIntentToken({"eip155:137/erc20:0x64060ab139feaae7f06ca4e63189d86adeb51691"})
	reason = {"type": "permit", "policyId": "72944d83-8365-458a-a70f-beac81466392", "policyName": "dd0c5566-8e45-4ada-9811-73eac1886b68", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "4e545c67-81ee-43a3-935b-c7470a76c386", "policyName": "c3d6e2a3-8812-44f2-89cb-d13a63b649fa"}] = reason {
	checkPrincipalId({"auth0|64784e51867282eb243a9daa"})
	checkResourceIntegrity
	checkDestinationAddress({"nftAssetTransfer"})
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"transferErc721"})
	checkIntentContract({"eip155:137:0xa2a13ce1824f3916fc84c65e559391fc6674e6e8"})
	reason = {"type": "permit", "policyId": "4e545c67-81ee-43a3-935b-c7470a76c386", "policyName": "c3d6e2a3-8812-44f2-89cb-d13a63b649fa", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "0c287555-010c-4375-a64f-4a18503874b9", "policyName": "cbadfea4-164f-4c3b-88d9-5a20e6c09248"}] = reason {
	checkPrincipalId({"auth0|64784e51867282eb243a9daa"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x5c3e876cb6e531a3a35cc985ab53e8f3869530b5"})
	reason = {"type": "permit", "policyId": "0c287555-010c-4375-a64f-4a18503874b9", "policyName": "cbadfea4-164f-4c3b-88d9-5a20e6c09248", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "9a664dd1-deb6-4a6b-a174-ca56a3242d72", "policyName": "8a550f70-cc98-4b2d-a3ae-2a624ae3c56b"}] = reason {
	checkPrincipalRole({"admin"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x5c3e876cb6e531a3a35cc985ab53e8f3869530b5"})
	reason = {"type": "permit", "policyId": "9a664dd1-deb6-4a6b-a174-ca56a3242d72", "policyName": "8a550f70-cc98-4b2d-a3ae-2a624ae3c56b", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "904c82e9-2976-47a6-90aa-fb6973630303", "policyName": "c715fcf4-7e9f-45ef-8615-770b0597fddf"}] = reason {
	checkPrincipalId({"auth0|62e1d7ca04533b042cb42419"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x5c3e876cb6e531a3a35cc985ab53e8f3869530b5"})
	reason = {"type": "permit", "policyId": "904c82e9-2976-47a6-90aa-fb6973630303", "policyName": "c715fcf4-7e9f-45ef-8615-770b0597fddf", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "b06312d4-6eb4-488e-84b6-1c76f1fd8413", "policyName": "3d597a7c-cebc-4cb0-8c82-a31fda95e5e7"}] = reason {
	checkPrincipalId({"auth0|62e1d7ca04533b042cb42419"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0xa2a13ce1824f3916fc84c65e559391fc6674e6e8"})
	reason = {"type": "permit", "policyId": "b06312d4-6eb4-488e-84b6-1c76f1fd8413", "policyName": "3d597a7c-cebc-4cb0-8c82-a31fda95e5e7", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "8f484e46-96df-43dd-8f2e-3faeb8b1eef2", "policyName": "4655de9d-37be-4796-9c49-1e9344c39e21"}] = reason {
	checkPrincipalId({"auth0|62e1d7ca04533b042cb42419"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0xa2a13ce1824f3916fc84c65e559391fc6674e6e8"})
	reason = {"type": "permit", "policyId": "8f484e46-96df-43dd-8f2e-3faeb8b1eef2", "policyName": "4655de9d-37be-4796-9c49-1e9344c39e21", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "6c8f83d6-ca27-4b28-9925-9d9c3016ba29", "policyName": "7ad914af-edc6-4170-b840-4988ff831ca9"}] = reason {
	checkPrincipalId({"auth0|62e1d7ca04533b042cb42419"})
	checkResourceIntegrity
	checkDestinationAddress({"nftAssetTransfer"})
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"transferErc721"})
	checkIntentContract({"eip155:137:0xa2a13ce1824f3916fc84c65e559391fc6674e6e8"})
	reason = {"type": "permit", "policyId": "6c8f83d6-ca27-4b28-9925-9d9c3016ba29", "policyName": "7ad914af-edc6-4170-b840-4988ff831ca9", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "b9f83304-5702-4ebb-bb26-04c45f1f2750", "policyName": "18d771af-33a1-46c6-bd95-5008871eff60"}] = reason {
	checkPrincipalId({"auth0|62e1d7ca04533b042cb42419"})
	checkAction({"signMessage", "signTypedData"})
	checkIntentType({"signMessage", "signTypedData"})
	reason = {"type": "permit", "policyId": "b9f83304-5702-4ebb-bb26-04c45f1f2750", "policyName": "18d771af-33a1-46c6-bd95-5008871eff60", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "c70e4e98-48ed-4b1b-b2e9-934c6e98bc1e", "policyName": "7543edef-087e-4550-b6bb-dba3e3e6c710"}] = reason {
	checkPrincipalId({"debb4c0f-235c-497e-8009-7476b7494c26"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"transferErc721", "transferErc1155"})
	reason = {"type": "permit", "policyId": "c70e4e98-48ed-4b1b-b2e9-934c6e98bc1e", "policyName": "7543edef-087e-4550-b6bb-dba3e3e6c710", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "3ade42b5-86cd-4f13-b257-b9a799c3a406", "policyName": "9e2b8d76-69cb-4cc2-815f-499b054686c9"}] = reason {
	checkPrincipalId({"auth0|62e1d7ca04533b042cb42419"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x5c3e876cb6e531a3a35cc985ab53e8f3869530b5"})
	reason = {"type": "permit", "policyId": "3ade42b5-86cd-4f13-b257-b9a799c3a406", "policyName": "9e2b8d76-69cb-4cc2-815f-499b054686c9", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "5cbe9ce8-2d56-4017-84c3-3d872308d19b", "policyName": "c77b1a6c-f86a-4910-96a7-11809199dcdc"}] = reason {
	checkPrincipalRole({"admin"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0x9dafc880"})
	reason = {"type": "permit", "policyId": "5cbe9ce8-2d56-4017-84c3-3d872308d19b", "policyName": "c77b1a6c-f86a-4910-96a7-11809199dcdc", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "e4d7bb72-fa79-401b-867f-d2cd46f6d8c9", "policyName": "d1d59f96-cf8f-463e-9018-9dbd4fa2113d"}] = reason {
	checkPrincipalRole({"member"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0x9dafc880"})
	reason = {"type": "permit", "policyId": "e4d7bb72-fa79-401b-867f-d2cd46f6d8c9", "policyName": "d1d59f96-cf8f-463e-9018-9dbd4fa2113d", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "75bb603b-bc14-46ac-93b0-4a43288f2433", "policyName": "9383acd7-591c-419a-8730-2068f0a908a9"}] = reason {
	checkPrincipalRole({"admin"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0x4b4a0bdf"})
	reason = {"type": "permit", "policyId": "75bb603b-bc14-46ac-93b0-4a43288f2433", "policyName": "9383acd7-591c-419a-8730-2068f0a908a9", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "24c8b66a-d290-479a-b6c1-c0d82ecac5bf", "policyName": "13bd8904-2209-4717-a77d-511932f04391"}] = reason {
	checkPrincipalRole({"admin"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0xa3105f63"})
	reason = {"type": "permit", "policyId": "24c8b66a-d290-479a-b6c1-c0d82ecac5bf", "policyName": "13bd8904-2209-4717-a77d-511932f04391", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "e03f61d3-7263-4c50-82c8-a1acdece513a", "policyName": "50c7acef-8279-4fcd-a539-94c93a243d68"}] = reason {
	checkPrincipalRole({"member"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0x5e351737"})
	reason = {"type": "permit", "policyId": "e03f61d3-7263-4c50-82c8-a1acdece513a", "policyName": "50c7acef-8279-4fcd-a539-94c93a243d68", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "9804d000-5665-4114-945f-7573ee9a9605", "policyName": "3dd3670e-e166-4185-b18e-90f4afd07cbe"}] = reason {
	checkPrincipalRole({"admin"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0x5e351737"})
	reason = {"type": "permit", "policyId": "9804d000-5665-4114-945f-7573ee9a9605", "policyName": "3dd3670e-e166-4185-b18e-90f4afd07cbe", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "7e5e2134-8de3-4d3e-8a49-fbbb244d6e10", "policyName": "8f166dfc-1c16-4fcf-b760-9df12c430e46"}] = reason {
	checkPrincipalRole({"member"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0x37e28cd7"})
	reason = {"type": "permit", "policyId": "7e5e2134-8de3-4d3e-8a49-fbbb244d6e10", "policyName": "8f166dfc-1c16-4fcf-b760-9df12c430e46", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "fa7c45b6-df62-4f51-9cc6-34f3d7be661c", "policyName": "568d0fc4-ac9d-4cee-95f1-bac6863b9b38"}] = reason {
	checkPrincipalRole({"admin"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0x65c38bb8"})
	reason = {"type": "permit", "policyId": "fa7c45b6-df62-4f51-9cc6-34f3d7be661c", "policyName": "568d0fc4-ac9d-4cee-95f1-bac6863b9b38", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "ddf17f19-432d-4169-b3c2-072d7b2eecca", "policyName": "38487fdd-3503-4967-ba2c-281ca974a5d3"}] = reason {
	checkPrincipalRole({"admin"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0x37e28cd7"})
	reason = {"type": "permit", "policyId": "ddf17f19-432d-4169-b3c2-072d7b2eecca", "policyName": "38487fdd-3503-4967-ba2c-281ca974a5d3", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "75dcfd79-6e62-4b92-92a8-a4eea14b59c0", "policyName": "9dac2d74-54a4-415a-90ae-ed9786365b30"}] = reason {
	checkPrincipalRole({"member"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0xa3105f63"})
	reason = {"type": "permit", "policyId": "75dcfd79-6e62-4b92-92a8-a4eea14b59c0", "policyName": "9dac2d74-54a4-415a-90ae-ed9786365b30", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "587cefb4-7565-4d96-ba07-5afb52bcfb00", "policyName": "04051b89-0ba7-454a-bbc2-ea8a66e80ef1"}] = reason {
	checkPrincipalRole({"admin"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0x77f57d50"})
	reason = {"type": "permit", "policyId": "587cefb4-7565-4d96-ba07-5afb52bcfb00", "policyName": "04051b89-0ba7-454a-bbc2-ea8a66e80ef1", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "6649cf88-d5bc-4dfa-98ad-2b4a1d2c78b9", "policyName": "cf85beee-91d9-4b16-a234-e9231c5b5589"}] = reason {
	checkPrincipalRole({"member"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0x4b4a0bdf"})
	reason = {"type": "permit", "policyId": "6649cf88-d5bc-4dfa-98ad-2b4a1d2c78b9", "policyName": "cf85beee-91d9-4b16-a234-e9231c5b5589", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "65112f76-62c0-434d-8cf9-88decf08e64a", "policyName": "3b1a5031-84c0-4eec-bfd3-1fab190a0ca3"}] = reason {
	checkPrincipalRole({"member"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0x77f57d50"})
	reason = {"type": "permit", "policyId": "65112f76-62c0-434d-8cf9-88decf08e64a", "policyName": "3b1a5031-84c0-4eec-bfd3-1fab190a0ca3", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "bb2951e7-b0b1-4ad0-8956-0b8cc28ea210", "policyName": "55039c69-dfde-4a2a-8b25-48d273ed5bd9"}] = reason {
	checkPrincipalRole({"admin"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0x27b8e40c"})
	reason = {"type": "permit", "policyId": "bb2951e7-b0b1-4ad0-8956-0b8cc28ea210", "policyName": "55039c69-dfde-4a2a-8b25-48d273ed5bd9", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "ec34ddc9-2e87-492e-b18a-16861eb6ed74", "policyName": "f65db91c-e5e9-4f23-892f-9e97eed41fca"}] = reason {
	checkPrincipalRole({"member"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0x27b8e40c"})
	reason = {"type": "permit", "policyId": "ec34ddc9-2e87-492e-b18a-16861eb6ed74", "policyName": "f65db91c-e5e9-4f23-892f-9e97eed41fca", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "8fffb01a-ae87-4742-928b-9c4ec5740e06", "policyName": "2fa683d2-81d6-4c3f-a88d-9cadb2b5c21c"}] = reason {
	checkPrincipalRole({"member"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0x65c38bb8"})
	reason = {"type": "permit", "policyId": "8fffb01a-ae87-4742-928b-9c4ec5740e06", "policyName": "2fa683d2-81d6-4c3f-a88d-9cadb2b5c21c", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "8d0c443b-d467-443b-8f16-66986190e57e", "policyName": "0d745699-8176-44db-bde9-55474fba6cc7"}] = reason {
	checkPrincipalRole({"member"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0x9dafc880"})
	reason = {"type": "permit", "policyId": "8d0c443b-d467-443b-8f16-66986190e57e", "policyName": "0d745699-8176-44db-bde9-55474fba6cc7", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "e3864a48-479f-420d-9242-4c809fbbfb93", "policyName": "e7cd1d07-c92b-404c-9ec7-a6a3b8c43790"}] = reason {
	checkPrincipalRole({"member"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0xa3105f63"})
	reason = {"type": "permit", "policyId": "e3864a48-479f-420d-9242-4c809fbbfb93", "policyName": "e7cd1d07-c92b-404c-9ec7-a6a3b8c43790", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "db472bd5-e0cf-4f05-9784-7c13fcbd4d3c", "policyName": "f0932890-7756-46c2-9509-9260416e6172"}] = reason {
	checkPrincipalRole({"member"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0x5e351737"})
	reason = {"type": "permit", "policyId": "db472bd5-e0cf-4f05-9784-7c13fcbd4d3c", "policyName": "f0932890-7756-46c2-9509-9260416e6172", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "4199401f-63f4-4032-941b-486b42e9fc35", "policyName": "15c8a58c-c63d-4964-a200-1846c20b7c72"}] = reason {
	checkPrincipalRole({"admin"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0x4b4a0bdf"})
	reason = {"type": "permit", "policyId": "4199401f-63f4-4032-941b-486b42e9fc35", "policyName": "15c8a58c-c63d-4964-a200-1846c20b7c72", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "217b5f78-c4e4-4755-8f69-36c9af359512", "policyName": "3d166ee3-7ed5-4c81-a3f6-5576f474573f"}] = reason {
	checkPrincipalRole({"admin"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0x9dafc880"})
	reason = {"type": "permit", "policyId": "217b5f78-c4e4-4755-8f69-36c9af359512", "policyName": "3d166ee3-7ed5-4c81-a3f6-5576f474573f", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "a20f5e24-e26c-45d0-94c4-b5c26102be51", "policyName": "59409ad3-aa95-4bd6-b78e-0c9bf2b85025"}] = reason {
	checkPrincipalRole({"member"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0x27b8e40c"})
	reason = {"type": "permit", "policyId": "a20f5e24-e26c-45d0-94c4-b5c26102be51", "policyName": "59409ad3-aa95-4bd6-b78e-0c9bf2b85025", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "d28fb1ed-00f5-4ac6-8e68-fecfcae84c8b", "policyName": "45019a29-b5ee-4d3a-bebb-918867ba411d"}] = reason {
	checkPrincipalRole({"admin"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0xa3105f63"})
	reason = {"type": "permit", "policyId": "d28fb1ed-00f5-4ac6-8e68-fecfcae84c8b", "policyName": "45019a29-b5ee-4d3a-bebb-918867ba411d", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "34be574a-dfce-4b06-82a7-a8aff1d9ddde", "policyName": "ad512d85-3827-42a1-9f92-2373ad9c48a0"}] = reason {
	checkPrincipalRole({"admin"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0x77f57d50"})
	reason = {"type": "permit", "policyId": "34be574a-dfce-4b06-82a7-a8aff1d9ddde", "policyName": "ad512d85-3827-42a1-9f92-2373ad9c48a0", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "d73c82c1-eb0c-4fe9-b454-3f5381b347ae", "policyName": "67ebdaeb-4f83-45c5-8cec-68832fc69ec5"}] = reason {
	checkPrincipalRole({"member"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0x4b4a0bdf"})
	reason = {"type": "permit", "policyId": "d73c82c1-eb0c-4fe9-b454-3f5381b347ae", "policyName": "67ebdaeb-4f83-45c5-8cec-68832fc69ec5", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "d127e06a-97df-463b-89f8-4e5d296c7b03", "policyName": "18133452-fb49-4cbb-ab98-4277f72153bd"}] = reason {
	checkPrincipalRole({"admin"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0x37e28cd7"})
	reason = {"type": "permit", "policyId": "d127e06a-97df-463b-89f8-4e5d296c7b03", "policyName": "18133452-fb49-4cbb-ab98-4277f72153bd", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "a8958224-a6d6-48da-ae28-af70e20fe914", "policyName": "8e489a05-1ad5-4327-b316-70c8da8dc8f3"}] = reason {
	checkPrincipalRole({"member"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0x37e28cd7"})
	reason = {"type": "permit", "policyId": "a8958224-a6d6-48da-ae28-af70e20fe914", "policyName": "8e489a05-1ad5-4327-b316-70c8da8dc8f3", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "c4f692a1-f3ae-44e3-a297-10d5b00ba433", "policyName": "4acb88b3-775d-44a7-a18a-45644d4967a0"}] = reason {
	checkPrincipalRole({"member"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0x65c38bb8"})
	reason = {"type": "permit", "policyId": "c4f692a1-f3ae-44e3-a297-10d5b00ba433", "policyName": "4acb88b3-775d-44a7-a18a-45644d4967a0", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "7455b1b5-daea-4433-ad4b-69ee6caff4f3", "policyName": "06122f43-d9ff-49c1-925e-e812fd39c6aa"}] = reason {
	checkPrincipalRole({"member"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0x77f57d50"})
	reason = {"type": "permit", "policyId": "7455b1b5-daea-4433-ad4b-69ee6caff4f3", "policyName": "06122f43-d9ff-49c1-925e-e812fd39c6aa", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "b46975ba-bf52-42ad-b03d-4d2b9d97ba76", "policyName": "bef5ea3c-8e2b-42f3-846e-79383dcfe5e0"}] = reason {
	checkPrincipalRole({"admin"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0x5e351737"})
	reason = {"type": "permit", "policyId": "b46975ba-bf52-42ad-b03d-4d2b9d97ba76", "policyName": "bef5ea3c-8e2b-42f3-846e-79383dcfe5e0", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "ee72a1b5-05d7-4a9b-b3e6-f3a577e8c0b6", "policyName": "325bfba9-7c23-4b87-a676-fe61fb9b1826"}] = reason {
	checkPrincipalRole({"admin"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0x65c38bb8"})
	reason = {"type": "permit", "policyId": "ee72a1b5-05d7-4a9b-b3e6-f3a577e8c0b6", "policyName": "325bfba9-7c23-4b87-a676-fe61fb9b1826", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "8405d5c2-d722-4077-bc97-43f9a04bf816", "policyName": "1deb18cf-75cb-4cc0-850d-e73aa5c89c47"}] = reason {
	checkPrincipalRole({"admin"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0x27b8e40c"})
	reason = {"type": "permit", "policyId": "8405d5c2-d722-4077-bc97-43f9a04bf816", "policyName": "1deb18cf-75cb-4cc0-850d-e73aa5c89c47", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "9261d099-ffeb-49c6-9c7f-24d3d6b08234", "policyName": "4280497c-ba28-4e77-b36d-8c54ef4eeac2"}] = reason {
	checkPrincipalRole({"member"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0x37e28cd7"})
	reason = {"type": "permit", "policyId": "9261d099-ffeb-49c6-9c7f-24d3d6b08234", "policyName": "4280497c-ba28-4e77-b36d-8c54ef4eeac2", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "62ab6e5c-d1a1-4baf-9b88-fd4507aa2cee", "policyName": "7d4df6cc-ea13-49b7-940c-5130c0ed0992"}] = reason {
	checkPrincipalRole({"member"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0xa3105f63"})
	reason = {"type": "permit", "policyId": "62ab6e5c-d1a1-4baf-9b88-fd4507aa2cee", "policyName": "7d4df6cc-ea13-49b7-940c-5130c0ed0992", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "af0cde3f-2728-4615-a5d6-86c76a3040cb", "policyName": "a386c957-0ef6-45a6-859a-3f07e490782d"}] = reason {
	checkPrincipalRole({"member"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0x9dafc880"})
	reason = {"type": "permit", "policyId": "af0cde3f-2728-4615-a5d6-86c76a3040cb", "policyName": "a386c957-0ef6-45a6-859a-3f07e490782d", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "049bce58-a94b-4c1b-9cca-ed9e9c039521", "policyName": "0ff36d61-d11d-4ce9-a225-dabfa8a61dcf"}] = reason {
	checkPrincipalRole({"admin"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0x9dafc880"})
	reason = {"type": "permit", "policyId": "049bce58-a94b-4c1b-9cca-ed9e9c039521", "policyName": "0ff36d61-d11d-4ce9-a225-dabfa8a61dcf", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "81920e7f-9c80-40d3-ba39-169396cfc5b2", "policyName": "ef73b23d-168a-4e1c-9e0b-eb54058b925d"}] = reason {
	checkPrincipalRole({"admin"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0xa3105f63"})
	reason = {"type": "permit", "policyId": "81920e7f-9c80-40d3-ba39-169396cfc5b2", "policyName": "ef73b23d-168a-4e1c-9e0b-eb54058b925d", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "faeeac23-b232-495c-9c23-75958e505c21", "policyName": "2109d39d-6e3f-47bf-a6e6-0079128a77d8"}] = reason {
	checkPrincipalRole({"admin"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0x65c38bb8"})
	reason = {"type": "permit", "policyId": "faeeac23-b232-495c-9c23-75958e505c21", "policyName": "2109d39d-6e3f-47bf-a6e6-0079128a77d8", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "9fceeb37-082c-4231-91e8-cf26b67ccb69", "policyName": "d9b9257d-d335-450f-8e6c-cc910344563f"}] = reason {
	checkPrincipalRole({"member"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0x27b8e40c"})
	reason = {"type": "permit", "policyId": "9fceeb37-082c-4231-91e8-cf26b67ccb69", "policyName": "d9b9257d-d335-450f-8e6c-cc910344563f", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "39907d0d-6f8e-4480-97a8-0869466665fa", "policyName": "6d560223-1c9a-433e-bb63-4fbfe9c2c2e9"}] = reason {
	checkPrincipalRole({"member"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0x77f57d50"})
	reason = {"type": "permit", "policyId": "39907d0d-6f8e-4480-97a8-0869466665fa", "policyName": "6d560223-1c9a-433e-bb63-4fbfe9c2c2e9", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "309c09bd-91c4-404f-b068-3eedcf948706", "policyName": "c69202e1-b2e1-4cdc-9c0d-57870ec9e226"}] = reason {
	checkPrincipalRole({"member"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0x65c38bb8"})
	reason = {"type": "permit", "policyId": "309c09bd-91c4-404f-b068-3eedcf948706", "policyName": "c69202e1-b2e1-4cdc-9c0d-57870ec9e226", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "f5aad0d2-8b17-48a3-ba5a-9b4426440c00", "policyName": "83a25c78-f344-49bc-81d3-0beac44ab84e"}] = reason {
	checkPrincipalRole({"member"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0x5e351737"})
	reason = {"type": "permit", "policyId": "f5aad0d2-8b17-48a3-ba5a-9b4426440c00", "policyName": "83a25c78-f344-49bc-81d3-0beac44ab84e", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "96ca0c0e-0b72-4b86-af0b-0ae0bb914dea", "policyName": "8d0f728c-7214-43d5-ab4a-338c499d2eda"}] = reason {
	checkPrincipalRole({"admin"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0x37e28cd7"})
	reason = {"type": "permit", "policyId": "96ca0c0e-0b72-4b86-af0b-0ae0bb914dea", "policyName": "8d0f728c-7214-43d5-ab4a-338c499d2eda", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "bbb0fd08-6e60-4072-8c29-fa3f478d71dd", "policyName": "6eaaba91-2e24-4ce2-b201-90cda846c776"}] = reason {
	checkPrincipalRole({"admin"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0x4b4a0bdf"})
	reason = {"type": "permit", "policyId": "bbb0fd08-6e60-4072-8c29-fa3f478d71dd", "policyName": "6eaaba91-2e24-4ce2-b201-90cda846c776", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "0e4369fd-9c2b-430a-b0d5-a473520d0b62", "policyName": "e207ff6e-51a7-419c-b6bc-5f89d155e907"}] = reason {
	checkPrincipalRole({"admin"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0x77f57d50"})
	reason = {"type": "permit", "policyId": "0e4369fd-9c2b-430a-b0d5-a473520d0b62", "policyName": "e207ff6e-51a7-419c-b6bc-5f89d155e907", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "b02cb2ff-310f-4dcd-bf74-00a22f7de7a8", "policyName": "65970262-79ec-484d-a744-bd81dace3d15"}] = reason {
	checkPrincipalRole({"admin"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0x27b8e40c"})
	reason = {"type": "permit", "policyId": "b02cb2ff-310f-4dcd-bf74-00a22f7de7a8", "policyName": "65970262-79ec-484d-a744-bd81dace3d15", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "6aa40a03-c66b-4072-b8a1-5dd3a6d67fe9", "policyName": "8b8a4584-39e2-4b89-b471-eb6b262dfae9"}] = reason {
	checkPrincipalRole({"admin"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0x5e351737"})
	reason = {"type": "permit", "policyId": "6aa40a03-c66b-4072-b8a1-5dd3a6d67fe9", "policyName": "8b8a4584-39e2-4b89-b471-eb6b262dfae9", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "7540b7af-13a1-4ce8-9819-6ae361e3b38d", "policyName": "e8069224-68c3-4073-9249-afe0f6544631"}] = reason {
	checkPrincipalRole({"member"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0x4b4a0bdf"})
	reason = {"type": "permit", "policyId": "7540b7af-13a1-4ce8-9819-6ae361e3b38d", "policyName": "e8069224-68c3-4073-9249-afe0f6544631", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "822ccb53-72c6-4308-978e-c5a738094926", "policyName": "552fff6a-af3f-4a24-8b9a-4b77db6fc971"}] = reason {
	checkPrincipalId({"13b8f90e-d929-49a9-8f8c-a40bfff0f09e"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x4c60051384bd2d3c01bfc845cf5f4b44bcbe9de5"})
	reason = {"type": "permit", "policyId": "822ccb53-72c6-4308-978e-c5a738094926", "policyName": "552fff6a-af3f-4a24-8b9a-4b77db6fc971", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "61c19a8a-bf93-476a-963c-506633b2b3f7", "policyName": "afef70ed-9e23-4f79-a95c-a0616c01b5d1"}] = reason {
	checkPrincipalId({"debb4c0f-235c-497e-8009-7476b7494c26"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkWalletAddress({"0xa1d6e9a37b3fb99b226f64741627af6f4ae219e1"})
	reason = {"type": "permit", "policyId": "61c19a8a-bf93-476a-963c-506633b2b3f7", "policyName": "afef70ed-9e23-4f79-a95c-a0616c01b5d1", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "29b86334-1344-4d0b-b51e-b03912c6223c", "policyName": "6a898c76-584f-4616-8246-c5d31afc07c9"}] = reason {
	checkPrincipalId({"13b8f90e-d929-49a9-8f8c-a40bfff0f09e"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x4c60051384bd2d3c01bfc845cf5f4b44bcbe9de5"})
	checkIntentHexSignature({"0x24856bc3"})
	reason = {"type": "permit", "policyId": "29b86334-1344-4d0b-b51e-b03912c6223c", "policyName": "6a898c76-584f-4616-8246-c5d31afc07c9", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "ef39543a-8593-4335-bc94-544490309f2c", "policyName": "48d24de0-3d05-46ce-81cf-3f81e8022283"}] = reason {
	checkPrincipalId({"13b8f90e-d929-49a9-8f8c-a40bfff0f09e"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x4c60051384bd2d3c01bfc845cf5f4b44bcbe9de5"})
	checkIntentHexSignature({"0x24856bc3"})
	reason = {"type": "permit", "policyId": "ef39543a-8593-4335-bc94-544490309f2c", "policyName": "48d24de0-3d05-46ce-81cf-3f81e8022283", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "f0a3d278-d144-4112-86b6-01c3e3374237", "policyName": "a86e9f14-4018-43cc-b15a-fc1e42ec4406"}] = reason {
	checkPrincipalId({"13b8f90e-d929-49a9-8f8c-a40bfff0f09e"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x4c60051384bd2d3c01bfc845cf5f4b44bcbe9de5"})
	checkIntentHexSignature({"0x24856bc3"})
	reason = {"type": "permit", "policyId": "f0a3d278-d144-4112-86b6-01c3e3374237", "policyName": "a86e9f14-4018-43cc-b15a-fc1e42ec4406", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "ccc209f8-17dd-4ae9-a89e-56eeec45cfed", "policyName": "68627533-b4de-4c60-9bff-8419678638a5"}] = reason {
	checkPrincipalId({"13b8f90e-d929-49a9-8f8c-a40bfff0f09e"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x4c60051384bd2d3c01bfc845cf5f4b44bcbe9de5"})
	checkIntentHexSignature({"0x24856bc3"})
	reason = {"type": "permit", "policyId": "ccc209f8-17dd-4ae9-a89e-56eeec45cfed", "policyName": "68627533-b4de-4c60-9bff-8419678638a5", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "24f8bba0-1475-41b1-b695-58825a99faf9", "policyName": "8ddd52ba-fe72-488a-8c0a-49215cca56fd"}] = reason {
	checkPrincipalId({"auth0|62e3998004533b042cb44ccf"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
	reason = {"type": "permit", "policyId": "24f8bba0-1475-41b1-b695-58825a99faf9", "policyName": "8ddd52ba-fe72-488a-8c0a-49215cca56fd", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "31fb182f-f35f-40d4-b1c0-39f6403afb40", "policyName": "94890c04-d3d2-4614-82cd-1709abd96c0f"}] = reason {
	checkPrincipalId({"auth0|62e3998004533b042cb44ccf"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
	reason = {"type": "permit", "policyId": "31fb182f-f35f-40d4-b1c0-39f6403afb40", "policyName": "94890c04-d3d2-4614-82cd-1709abd96c0f", "approvalsSatisfied": [], "approvalsMissing": []}
}

forbid[{"policyId": "5274f5a4-1e67-4ede-a38a-d1a87e681451", "policyName": "746bbc21-c869-4d2e-8236-dda489274610"}] = reason {
	checkPrincipalId({"auth0|62e1d7ca04533b042cb42419"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
	reason = {"type": "forbid", "policyId": "5274f5a4-1e67-4ede-a38a-d1a87e681451", "policyName": "746bbc21-c869-4d2e-8236-dda489274610", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "360e4541-3d85-46b8-908b-92e2f7979acb", "policyName": "7bf29225-1825-4bd6-8b8a-ef2c0a40707a"}] = reason {
	checkPrincipalId({"615f46d7-7039-43a3-a904-6daccaf72e61"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0xfbe3ab0cbfbd17d06bdd73aa3f55aaf038720f59"})
	checkIntentHexSignature({"0x23b872dd"})
	reason = {"type": "permit", "policyId": "360e4541-3d85-46b8-908b-92e2f7979acb", "policyName": "7bf29225-1825-4bd6-8b8a-ef2c0a40707a", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "6e8e323f-d099-4e54-93e6-eecf5cf4bdb1", "policyName": "dda465a6-8dc1-4142-9d00-ec6313955f01"}] = reason {
	checkPrincipalId({"auth0|62e3998004533b042cb44ccf"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
	checkIntentHexSignature({"0x42842e0e"})
	reason = {"type": "permit", "policyId": "6e8e323f-d099-4e54-93e6-eecf5cf4bdb1", "policyName": "dda465a6-8dc1-4142-9d00-ec6313955f01", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "5f773712-d2eb-4acd-9670-a23e01df2507", "policyName": "d1f6e863-ae60-409d-870f-3faf7032d616"}] = reason {
	checkPrincipalRole({"admin"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
	checkIntentHexSignature({"0x65b4613f"})
	reason = {"type": "permit", "policyId": "5f773712-d2eb-4acd-9670-a23e01df2507", "policyName": "d1f6e863-ae60-409d-870f-3faf7032d616", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "5226d50e-f76d-476b-82e1-44b045ee4e3d", "policyName": "39550a81-1c30-48f3-a590-6cbb6ddd375d"}] = reason {
	checkPrincipalRole({"admin"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
	checkIntentHexSignature({"0xef68253d"})
	reason = {"type": "permit", "policyId": "5226d50e-f76d-476b-82e1-44b045ee4e3d", "policyName": "39550a81-1c30-48f3-a590-6cbb6ddd375d", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "9c394ba3-ee02-457a-bdcc-452e00751107", "policyName": "9d37e0ab-8b25-48d3-b0ba-766f15a12626"}] = reason {
	checkPrincipalRole({"admin"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
	checkIntentHexSignature({"0x93551267"})
	reason = {"type": "permit", "policyId": "9c394ba3-ee02-457a-bdcc-452e00751107", "policyName": "9d37e0ab-8b25-48d3-b0ba-766f15a12626", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "bf52e511-78e7-4caf-97fe-25f647036626", "policyName": "03959b54-5fdb-4c2c-b10e-996e07b7b1d4"}] = reason {
	checkPrincipalRole({"member"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
	checkIntentHexSignature({"0x93551267"})
	reason = {"type": "permit", "policyId": "bf52e511-78e7-4caf-97fe-25f647036626", "policyName": "03959b54-5fdb-4c2c-b10e-996e07b7b1d4", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "47c480c4-ae76-471a-9636-7a58d22dafa9", "policyName": "67151495-b1a6-4632-8dff-a84277205daa"}] = reason {
	checkPrincipalRole({"admin"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0xa2a13ce1824f3916fc84c65e559391fc6674e6e8"})
	checkIntentHexSignature({"0x93e39539"})
	reason = {"type": "permit", "policyId": "47c480c4-ae76-471a-9636-7a58d22dafa9", "policyName": "67151495-b1a6-4632-8dff-a84277205daa", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "b5799b7e-8716-4fa8-8408-8079db7120f2", "policyName": "e9918e0e-7621-4d95-afa3-deeaed768409"}] = reason {
	checkPrincipalRole({"member"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
	checkIntentHexSignature({"0x65b4613f"})
	reason = {"type": "permit", "policyId": "b5799b7e-8716-4fa8-8408-8079db7120f2", "policyName": "e9918e0e-7621-4d95-afa3-deeaed768409", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "5992cc5b-1e56-4248-bcb1-1e1774594b80", "policyName": "6c11f2c3-c9dc-4a67-afbb-14d2418b9233"}] = reason {
	checkPrincipalRole({"admin"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
	checkIntentHexSignature({"0x44c9b41f"})
	reason = {"type": "permit", "policyId": "5992cc5b-1e56-4248-bcb1-1e1774594b80", "policyName": "6c11f2c3-c9dc-4a67-afbb-14d2418b9233", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "1983132a-0821-44cb-a240-61892119861f", "policyName": "c71e98e1-f4ef-4682-b628-79d03473fbdc"}] = reason {
	checkPrincipalRole({"admin"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
	checkIntentHexSignature({"0x86c68622"})
	reason = {"type": "permit", "policyId": "1983132a-0821-44cb-a240-61892119861f", "policyName": "c71e98e1-f4ef-4682-b628-79d03473fbdc", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "8b6662d2-9e67-4e96-8842-e8dfa5232a7b", "policyName": "c0469d8c-1120-4985-8aa9-2df7a66885ea"}] = reason {
	checkPrincipalRole({"member"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0xa2a13ce1824f3916fc84c65e559391fc6674e6e8"})
	checkIntentHexSignature({"0x93e39539"})
	reason = {"type": "permit", "policyId": "8b6662d2-9e67-4e96-8842-e8dfa5232a7b", "policyName": "c0469d8c-1120-4985-8aa9-2df7a66885ea", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "bc57663a-d50f-4b49-89d7-290d03246162", "policyName": "f473c356-a95b-496a-83ad-a67e07f67e59"}] = reason {
	checkPrincipalRole({"member"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0x902ead61"})
	reason = {"type": "permit", "policyId": "bc57663a-d50f-4b49-89d7-290d03246162", "policyName": "f473c356-a95b-496a-83ad-a67e07f67e59", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "52d78224-ef88-40c6-97e9-f76825cf0fe5", "policyName": "fe3167f2-c5c4-4ed1-9217-cfa02e858515"}] = reason {
	checkPrincipalRole({"admin"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x6bc613a25afe159b70610b64783ca51c9258b92e"})
	checkIntentHexSignature({"0x6548b7ae"})
	reason = {"type": "permit", "policyId": "52d78224-ef88-40c6-97e9-f76825cf0fe5", "policyName": "fe3167f2-c5c4-4ed1-9217-cfa02e858515", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "8a2d843e-dc14-4e11-a0fa-476f4b450d45", "policyName": "a018b301-3234-434b-83df-8547c14e926b"}] = reason {
	checkPrincipalRole({"member"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
	checkIntentHexSignature({"0x86c68622"})
	reason = {"type": "permit", "policyId": "8a2d843e-dc14-4e11-a0fa-476f4b450d45", "policyName": "a018b301-3234-434b-83df-8547c14e926b", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "75ce191b-eaba-49d1-b0fb-4a8e9afb0612", "policyName": "8b357452-f7aa-4585-a798-720ac5a64e59"}] = reason {
	checkPrincipalRole({"member"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
	checkIntentHexSignature({"0x5d878596"})
	reason = {"type": "permit", "policyId": "75ce191b-eaba-49d1-b0fb-4a8e9afb0612", "policyName": "8b357452-f7aa-4585-a798-720ac5a64e59", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "c4ec02d3-9f51-4b7f-95f2-afa1086a8ff6", "policyName": "5f1644df-8377-4691-91b0-fe6aa00d621f"}] = reason {
	checkPrincipalRole({"admin"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0xdd86381e"})
	reason = {"type": "permit", "policyId": "c4ec02d3-9f51-4b7f-95f2-afa1086a8ff6", "policyName": "5f1644df-8377-4691-91b0-fe6aa00d621f", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "47435ac4-83f2-4a4e-a04f-e76ee87741ed", "policyName": "247157a4-1b64-4e75-8321-b98e38b0389e"}] = reason {
	checkPrincipalRole({"admin"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0x51782474"})
	reason = {"type": "permit", "policyId": "47435ac4-83f2-4a4e-a04f-e76ee87741ed", "policyName": "247157a4-1b64-4e75-8321-b98e38b0389e", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "64b41c41-3af3-47f9-b409-951bba136b8f", "policyName": "eabd89d2-194d-42cd-81c2-edef36b76caa"}] = reason {
	checkPrincipalRole({"member"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0xeae2ea7e"})
	reason = {"type": "permit", "policyId": "64b41c41-3af3-47f9-b409-951bba136b8f", "policyName": "eabd89d2-194d-42cd-81c2-edef36b76caa", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "98ba79a4-0d83-4e1e-a58d-866bb9960c43", "policyName": "99e86b13-641e-47ca-8936-a95d3a6f437b"}] = reason {
	checkPrincipalRole({"admin"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
	checkIntentHexSignature({"0xd2df3a9e"})
	reason = {"type": "permit", "policyId": "98ba79a4-0d83-4e1e-a58d-866bb9960c43", "policyName": "99e86b13-641e-47ca-8936-a95d3a6f437b", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "c37da7f1-3801-4c21-bba6-2974d1bc7538", "policyName": "964091bf-3bba-4699-b3e1-d3eb46ca6d8c"}] = reason {
	checkPrincipalRole({"member"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
	checkIntentHexSignature({"0xd4db00cc"})
	reason = {"type": "permit", "policyId": "c37da7f1-3801-4c21-bba6-2974d1bc7538", "policyName": "964091bf-3bba-4699-b3e1-d3eb46ca6d8c", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "e10310eb-4c50-47f4-89cb-4f3f8a0a4aca", "policyName": "c5510e0e-7a09-4db9-9690-019dad364989"}] = reason {
	checkPrincipalRole({"member"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x6bc613a25afe159b70610b64783ca51c9258b92e"})
	checkIntentHexSignature({"0x6548b7ae"})
	reason = {"type": "permit", "policyId": "e10310eb-4c50-47f4-89cb-4f3f8a0a4aca", "policyName": "c5510e0e-7a09-4db9-9690-019dad364989", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "072498de-98c7-47f5-af67-16b243fcc40b", "policyName": "acf62623-e4f0-414a-99f8-2e30552d2976"}] = reason {
	checkPrincipalRole({"admin"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
	checkIntentHexSignature({"0xd4db00cc"})
	reason = {"type": "permit", "policyId": "072498de-98c7-47f5-af67-16b243fcc40b", "policyName": "acf62623-e4f0-414a-99f8-2e30552d2976", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "6c7e285a-373d-4526-b00e-e0cd4f769e2c", "policyName": "110502e9-ac0c-423f-9a8f-6376e2ffed88"}] = reason {
	checkPrincipalRole({"member"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0x51782474"})
	reason = {"type": "permit", "policyId": "6c7e285a-373d-4526-b00e-e0cd4f769e2c", "policyName": "110502e9-ac0c-423f-9a8f-6376e2ffed88", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "c5b695a0-43fa-4b69-8507-d9788a11d339", "policyName": "bc3fae98-2e50-4ff0-9c82-cd77cc6ee143"}] = reason {
	checkPrincipalId({"13b8f90e-d929-49a9-8f8c-a40bfff0f09e"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x3df16fb8dc28f63565af2815e04a3368360ffd23"})
	checkWalletAddress({"0x7a0854f64ded80455208ad6939950d915b2a101e"})
	reason = {"type": "permit", "policyId": "c5b695a0-43fa-4b69-8507-d9788a11d339", "policyName": "bc3fae98-2e50-4ff0-9c82-cd77cc6ee143", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "b4470584-bcc7-411e-8c98-8af6275dad68", "policyName": "44b5d3e8-5e02-428f-b057-61dd6293e374"}] = reason {
	checkPrincipalRole({"member"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
	checkIntentHexSignature({"0x9edcab23"})
	reason = {"type": "permit", "policyId": "b4470584-bcc7-411e-8c98-8af6275dad68", "policyName": "44b5d3e8-5e02-428f-b057-61dd6293e374", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "02d6d57a-c530-4d6a-ab5a-25d5c4c2d94b", "policyName": "a8ed180c-6607-4d6d-bce5-7be3a671dd2d"}] = reason {
	checkPrincipalRole({"admin"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
	checkIntentHexSignature({"0x9edcab23"})
	reason = {"type": "permit", "policyId": "02d6d57a-c530-4d6a-ab5a-25d5c4c2d94b", "policyName": "a8ed180c-6607-4d6d-bce5-7be3a671dd2d", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "b983b04e-4787-43af-b31c-3dbb8163bdcd", "policyName": "ae036a24-fa6c-463c-acfa-59914cf67a59"}] = reason {
	checkPrincipalRole({"admin"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0xd3ac2166"})
	reason = {"type": "permit", "policyId": "b983b04e-4787-43af-b31c-3dbb8163bdcd", "policyName": "ae036a24-fa6c-463c-acfa-59914cf67a59", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "d04b2ab1-c46f-4b70-8c41-aef3afc9deb1", "policyName": "325ec9af-67dc-4a2a-9f90-1703406cf261"}] = reason {
	checkPrincipalRole({"member"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0xd3ac2166"})
	reason = {"type": "permit", "policyId": "d04b2ab1-c46f-4b70-8c41-aef3afc9deb1", "policyName": "325ec9af-67dc-4a2a-9f90-1703406cf261", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "61dc6cac-fdb6-49b0-9785-12fb706f170b", "policyName": "48412cc3-a596-4b04-aca4-b000f1e1335b"}] = reason {
	checkPrincipalRole({"admin"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0x1521465b"})
	reason = {"type": "permit", "policyId": "61dc6cac-fdb6-49b0-9785-12fb706f170b", "policyName": "48412cc3-a596-4b04-aca4-b000f1e1335b", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "5d04a7cd-8140-4148-9464-fc0cf05df0dc", "policyName": "cd19a84f-4b15-440f-a389-5f70420c43cd"}] = reason {
	checkPrincipalRole({"admin"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0x902ead61"})
	reason = {"type": "permit", "policyId": "5d04a7cd-8140-4148-9464-fc0cf05df0dc", "policyName": "cd19a84f-4b15-440f-a389-5f70420c43cd", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "6636cbd3-f2ae-4171-8ec2-a07fff6f3f9b", "policyName": "c4f40208-9037-49a1-870e-7303ca1c0c14"}] = reason {
	checkPrincipalRole({"member"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0x1521465b"})
	reason = {"type": "permit", "policyId": "6636cbd3-f2ae-4171-8ec2-a07fff6f3f9b", "policyName": "c4f40208-9037-49a1-870e-7303ca1c0c14", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "49a33ee1-7461-4571-a7a4-c9ec73dc97c7", "policyName": "bc39284b-490a-43c4-bb5a-87862a1ee4a9"}] = reason {
	checkPrincipalRole({"admin"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0xeae2ea7e"})
	reason = {"type": "permit", "policyId": "49a33ee1-7461-4571-a7a4-c9ec73dc97c7", "policyName": "bc39284b-490a-43c4-bb5a-87862a1ee4a9", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "903cbf48-a002-43e6-9452-b268ff1c8ba9", "policyName": "32a8e7af-b58a-476e-908a-74bb561f61b1"}] = reason {
	checkPrincipalRole({"member"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
	checkIntentHexSignature({"0xe01c7002"})
	reason = {"type": "permit", "policyId": "903cbf48-a002-43e6-9452-b268ff1c8ba9", "policyName": "32a8e7af-b58a-476e-908a-74bb561f61b1", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "6f8ff3b0-ee5c-4a44-8d6d-c47cbe753e62", "policyName": "f7e4631d-e5ae-435f-a00c-23448909e7db"}] = reason {
	checkPrincipalRole({"admin"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"transferErc721", "transferErc1155"})
	reason = {"type": "permit", "policyId": "6f8ff3b0-ee5c-4a44-8d6d-c47cbe753e62", "policyName": "f7e4631d-e5ae-435f-a00c-23448909e7db", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "9f356177-c180-49ec-a95c-2de000762422", "policyName": "7af674ef-428e-4e13-9d79-4a38ff4c0eb2"}] = reason {
	checkPrincipalRole({"admin"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"transferErc721", "transferErc1155"})
	reason = {"type": "permit", "policyId": "9f356177-c180-49ec-a95c-2de000762422", "policyName": "7af674ef-428e-4e13-9d79-4a38ff4c0eb2", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "ca0c1818-e34f-423d-a57c-7e834cb2fffa", "policyName": "fe3d3406-aa65-4a20-8c72-7a24b614151a"}] = reason {
	checkPrincipalRole({"admin"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
	checkIntentHexSignature({"0xe01c7002"})
	reason = {"type": "permit", "policyId": "ca0c1818-e34f-423d-a57c-7e834cb2fffa", "policyName": "fe3d3406-aa65-4a20-8c72-7a24b614151a", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "c6a28700-ad20-4c5f-8d5f-2bff2442ca9f", "policyName": "f30d6697-2cda-4553-9e7d-66886110a882"}] = reason {
	checkPrincipalRole({"admin"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0xdd7944f5"})
	reason = {"type": "permit", "policyId": "c6a28700-ad20-4c5f-8d5f-2bff2442ca9f", "policyName": "f30d6697-2cda-4553-9e7d-66886110a882", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "b674b94b-aea6-4084-b1ff-13b160ec9c49", "policyName": "7fc04ac3-368f-42b1-b9f4-06761241567c"}] = reason {
	checkPrincipalRole({"member"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
	checkIntentHexSignature({"0x44c9b41f"})
	reason = {"type": "permit", "policyId": "b674b94b-aea6-4084-b1ff-13b160ec9c49", "policyName": "7fc04ac3-368f-42b1-b9f4-06761241567c", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "7c15f011-70ce-48da-8c69-caf79d95fa94", "policyName": "8a30c2d3-ffe0-473c-a1b4-730754cb9430"}] = reason {
	checkPrincipalRole({"member"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0xa2a13ce1824f3916fc84c65e559391fc6674e6e8"})
	checkIntentHexSignature({"0x5757b38a"})
	reason = {"type": "permit", "policyId": "7c15f011-70ce-48da-8c69-caf79d95fa94", "policyName": "8a30c2d3-ffe0-473c-a1b4-730754cb9430", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "19d135a3-eda9-4a29-82f6-a96414e652cf", "policyName": "5d164652-f401-4ae3-acf1-048927eb7a88"}] = reason {
	checkPrincipalId({"13b8f90e-d929-49a9-8f8c-a40bfff0f09e"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x8f8e18dbebb8ca4fc2bc7e3425fcdfd5264e33e8"})
	checkWalletAddress({"0x7a0854f64ded80455208ad6939950d915b2a101e"})
	reason = {"type": "permit", "policyId": "19d135a3-eda9-4a29-82f6-a96414e652cf", "policyName": "5d164652-f401-4ae3-acf1-048927eb7a88", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "bdafeb83-2c7a-4716-9495-2c67eb53ed07", "policyName": "64a3a0e5-8d9c-4b3a-a82a-2271a3f6aacc"}] = reason {
	checkPrincipalRole({"member"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0xdd7944f5"})
	reason = {"type": "permit", "policyId": "bdafeb83-2c7a-4716-9495-2c67eb53ed07", "policyName": "64a3a0e5-8d9c-4b3a-a82a-2271a3f6aacc", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "1d27e69c-c3c0-48a1-a99c-312218fcb2ee", "policyName": "3ecd9a08-abee-4ab3-a15b-d0fbe348240f"}] = reason {
	checkPrincipalRole({"member"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
	checkIntentHexSignature({"0xef68253d"})
	reason = {"type": "permit", "policyId": "1d27e69c-c3c0-48a1-a99c-312218fcb2ee", "policyName": "3ecd9a08-abee-4ab3-a15b-d0fbe348240f", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "e31904fe-a65b-4921-8191-0c7014e8d1af", "policyName": "959057f2-ad2c-4d45-a0ec-0c2da6f627c5"}] = reason {
	checkPrincipalRole({"member"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x4c60051384bd2d3c01bfc845cf5f4b44bcbe9de5"})
	checkIntentHexSignature({"0x3593564c"})
	reason = {"type": "permit", "policyId": "e31904fe-a65b-4921-8191-0c7014e8d1af", "policyName": "959057f2-ad2c-4d45-a0ec-0c2da6f627c5", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "c921406e-8b41-487b-a7f9-1eb89e0d04c3", "policyName": "d1100363-5283-4a61-b905-dfc760815bff"}] = reason {
	checkPrincipalRole({"member"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
	checkIntentHexSignature({"0xd2df3a9e"})
	reason = {"type": "permit", "policyId": "c921406e-8b41-487b-a7f9-1eb89e0d04c3", "policyName": "d1100363-5283-4a61-b905-dfc760815bff", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "21b309a9-4767-4255-aa48-c86e741d5647", "policyName": "8f409d35-aea5-45b2-bbf9-64569fed60ae"}] = reason {
	checkPrincipalRole({"admin"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"transferErc20", "transferNative"})
	reason = {"type": "permit", "policyId": "21b309a9-4767-4255-aa48-c86e741d5647", "policyName": "8f409d35-aea5-45b2-bbf9-64569fed60ae", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "095748e7-50d1-4c0d-b92d-51d0378be62a", "policyName": "20d630d0-5f68-47a8-8e8a-554ed8ab505a"}] = reason {
	checkPrincipalRole({"member"})
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkIntentHexSignature({"0xdd86381e"})
	reason = {"type": "permit", "policyId": "095748e7-50d1-4c0d-b92d-51d0378be62a", "policyName": "20d630d0-5f68-47a8-8e8a-554ed8ab505a", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "d01e3a32-2e18-42af-afcd-e28ea21cff54", "policyName": "ad2488cf-8ab6-41b0-bc9e-41ef61153fec"}] = reason {
	checkPrincipalRole({"member"})
	checkIntentDomain({"version": ["1"], "name": ["Crypto Unicorns Authentication"], "chainId": ["137"]})
	checkAction({"signTypedData"})
	checkIntentType({"signTypedData"})
	reason = {"type": "permit", "policyId": "d01e3a32-2e18-42af-afcd-e28ea21cff54", "policyName": "ad2488cf-8ab6-41b0-bc9e-41ef61153fec", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "a0d7ceb1-85f1-4664-b817-90b931cc4a8f", "policyName": "816207da-5679-43d9-90cb-0ae17d3e26df"}] = reason {
	checkPrincipalRole({"admin"})
	checkAction({"signMessage", "signTypedData"})
	checkIntentType({"signMessage", "signTypedData"})
	reason = {"type": "permit", "policyId": "a0d7ceb1-85f1-4664-b817-90b931cc4a8f", "policyName": "816207da-5679-43d9-90cb-0ae17d3e26df", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "13f092e1-ec88-4a36-a6de-4fe18c71b3cd", "policyName": "8d79f8c1-8c65-441b-9319-ff5c9803bc65"}] = reason {
	checkResourceIntegrity
	checkChainId({"137"})
	checkAction({"signTransaction"})
	checkIntentType({"transferErc20", "transferNative"})
	reason = {"type": "permit", "policyId": "13f092e1-ec88-4a36-a6de-4fe18c71b3cd", "policyName": "8d79f8c1-8c65-441b-9319-ff5c9803bc65", "approvalsSatisfied": [], "approvalsMissing": []}
}
