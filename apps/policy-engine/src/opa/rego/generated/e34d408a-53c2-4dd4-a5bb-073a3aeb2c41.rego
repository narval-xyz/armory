package main

permit[{"policyId": "096c943b-f898-45da-8627-de2a7a3b38c3", "policyName": "c4cb0186-a0e8-48b8-bf05-8eaffc9efdcc"}] = reason {
	checkResourceIntegrity
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x28597ea60030fbae79088d89d803f25143c7a6b5"})
	checkChainId({"137"})
	checkIntentHexSignature({"0xc16fad97"})
	reason = {"type": "permit", "policyId": "096c943b-f898-45da-8627-de2a7a3b38c3", "policyName": "c4cb0186-a0e8-48b8-bf05-8eaffc9efdcc", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "9a291b42-38f0-4c5e-bca4-40ac981968a2", "policyName": "13fabcb5-e7d9-4e47-985e-9b048ebb7003"}] = reason {
	checkResourceIntegrity
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x28597ea60030fbae79088d89d803f25143c7a6b5"})
	checkChainId({"137"})
	checkIntentHexSignature({"0x2b3f22b4"})
	reason = {"type": "permit", "policyId": "9a291b42-38f0-4c5e-bca4-40ac981968a2", "policyName": "13fabcb5-e7d9-4e47-985e-9b048ebb7003", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "8f1fc67b-04c7-4d3c-bae9-ab5e284952e7", "policyName": "ec539dbc-e44f-4e5b-8fe5-6f61de0c4e7b"}] = reason {
	checkResourceIntegrity
	checkAction({"signTransaction"})
	checkIntentType({"approveTokenAllowance"})
	checkIntentToken({"eip155:137/erc20:0x431cd3c9ac9fc73644bf68bf5691f4b83f9e104f"})
	checkIntentSpender({"eip155:137:0x28597ea60030fbae79088d89d803f25143c7a6b5"})
	checkChainId({"137"})
	reason = {"type": "permit", "policyId": "8f1fc67b-04c7-4d3c-bae9-ab5e284952e7", "policyName": "ec539dbc-e44f-4e5b-8fe5-6f61de0c4e7b", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "db1e720d-b72b-411e-bd5a-1a0f941a958e", "policyName": "e61592db-ec4a-435b-bce7-71b12ac57693"}] = reason {
	checkResourceIntegrity
	checkPrincipalRole({"admin"})
	checkAction({"signTransaction"})
	checkIntentType({"transferErc20", "transferNative"})
	reason = {"type": "permit", "policyId": "db1e720d-b72b-411e-bd5a-1a0f941a958e", "policyName": "e61592db-ec4a-435b-bce7-71b12ac57693", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "bd8d934e-af2d-49dc-b640-4950790c7c88", "policyName": "a68e8d20-0419-475c-8fcc-b17d4de8c955"}] = reason {
	checkResourceIntegrity
	checkPrincipalRole({"admin"})
	checkAction({"signTransaction"})
	checkIntentType({"transferErc721", "transferErc1155"})
	reason = {"type": "permit", "policyId": "bd8d934e-af2d-49dc-b640-4950790c7c88", "policyName": "a68e8d20-0419-475c-8fcc-b17d4de8c955", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "37f1a9f6-fcc8-4a42-b3f6-461ed5d9a2f1", "policyName": "f42953dc-b6d9-4186-bdcc-1b834779f462"}] = reason {
	checkResourceIntegrity
	checkPrincipalId({"auth0|62e1d7ca04533b042cb42419"})
	checkAction({"signTransaction"})
	checkIntentType({"transferErc20"})
	checkIntentToken({"eip155:137:0x431cd3c9ac9fc73644bf68bf5691f4b83f9e104f"})
	checkChainId({"137"})
	checkWalletAddress({"0x0ff514df05c423a120152df9e04ba94fab7b3491"})
	checkIntentAmount({"currency": "*", "operator": "lt", "value": "2"})
	reason = {"type": "permit", "policyId": "37f1a9f6-fcc8-4a42-b3f6-461ed5d9a2f1", "policyName": "f42953dc-b6d9-4186-bdcc-1b834779f462", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "8ec9f546-5a10-4de9-a13c-f8a635935680", "policyName": "417c3e87-9dc2-4ec8-9b8f-b5a421c90226"}] = reason {
	checkResourceIntegrity
	checkPrincipalId({"auth0|62e1d7ca04533b042cb42419"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
	checkChainId({"137"})
	reason = {"type": "permit", "policyId": "8ec9f546-5a10-4de9-a13c-f8a635935680", "policyName": "417c3e87-9dc2-4ec8-9b8f-b5a421c90226", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "c1f75be0-0fd3-4be2-9e6e-979146192572", "policyName": "593000a9-05fd-4e2a-88b1-946115dfcdcf"}] = reason {
	checkResourceIntegrity
	checkPrincipalId({"auth0|62e1d7ca04533b042cb42419"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
	checkChainId({"137"})
	reason = {"type": "permit", "policyId": "c1f75be0-0fd3-4be2-9e6e-979146192572", "policyName": "593000a9-05fd-4e2a-88b1-946115dfcdcf", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "008537b2-0095-4675-b371-7a1890e4f84e", "policyName": "a4a6b1b0-638a-4535-b48b-32e99ce58d92"}] = reason {
	checkResourceIntegrity
	checkPrincipalId({"auth0|62e1d7ca04533b042cb42419"})
	checkDestinationAddress({"nftAssetTransfer"})
	checkAction({"signTransaction"})
	checkIntentType({"transferErc721"})
	checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
	checkChainId({"137"})
	reason = {"type": "permit", "policyId": "008537b2-0095-4675-b371-7a1890e4f84e", "policyName": "a4a6b1b0-638a-4535-b48b-32e99ce58d92", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "4c6912e5-6d78-4e7a-924a-168adf20e2f7", "policyName": "0a4a01d5-78ce-4cf8-9f97-bc5726e173df"}] = reason {
	checkResourceIntegrity
	checkPrincipalId({"auth0|64784e51867282eb243a9daa"})
	checkAction({"signMessage"})
	checkChainId({"137"})
	checkIntentDomain({"version": ["1"], "name": ["Crypto Unicorns Authentication"]})
	reason = {"type": "permit", "policyId": "4c6912e5-6d78-4e7a-924a-168adf20e2f7", "policyName": "0a4a01d5-78ce-4cf8-9f97-bc5726e173df", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "4a4e6f4e-1ca5-4a7d-8c3f-979a8be33cf8", "policyName": "fd02d4da-2c20-49bb-a904-57c5a81bc0e5"}] = reason {
	checkResourceIntegrity
	checkAction({"signTransaction"})
	checkIntentType({"approveTokenAllowance"})
	checkIntentToken({"eip155:137/erc20:0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad"})
	checkChainId({"137"})
	reason = {"type": "permit", "policyId": "4a4e6f4e-1ca5-4a7d-8c3f-979a8be33cf8", "policyName": "fd02d4da-2c20-49bb-a904-57c5a81bc0e5", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "762489a7-5c41-4081-a527-5929703a6707", "policyName": "dd0c5566-8e45-4ada-9811-73eac1886b68"}] = reason {
	checkResourceIntegrity
	checkAction({"signTransaction"})
	checkIntentType({"approveTokenAllowance"})
	checkIntentToken({"eip155:137/erc20:0x64060ab139feaae7f06ca4e63189d86adeb51691"})
	checkChainId({"137"})
	reason = {"type": "permit", "policyId": "762489a7-5c41-4081-a527-5929703a6707", "policyName": "dd0c5566-8e45-4ada-9811-73eac1886b68", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "489c7804-233f-45fe-88f8-3f800bbaed5a", "policyName": "c3d6e2a3-8812-44f2-89cb-d13a63b649fa"}] = reason {
	checkResourceIntegrity
	checkPrincipalId({"auth0|64784e51867282eb243a9daa"})
	checkDestinationAddress({"nftAssetTransfer"})
	checkAction({"signTransaction"})
	checkIntentType({"transferErc721"})
	checkIntentContract({"eip155:137:0xa2a13ce1824f3916fc84c65e559391fc6674e6e8"})
	checkChainId({"137"})
	reason = {"type": "permit", "policyId": "489c7804-233f-45fe-88f8-3f800bbaed5a", "policyName": "c3d6e2a3-8812-44f2-89cb-d13a63b649fa", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "8385b01a-182b-4a07-a557-0ae9b4c7c5e8", "policyName": "cbadfea4-164f-4c3b-88d9-5a20e6c09248"}] = reason {
	checkResourceIntegrity
	checkPrincipalId({"auth0|64784e51867282eb243a9daa"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x5c3e876cb6e531a3a35cc985ab53e8f3869530b5"})
	checkChainId({"137"})
	reason = {"type": "permit", "policyId": "8385b01a-182b-4a07-a557-0ae9b4c7c5e8", "policyName": "cbadfea4-164f-4c3b-88d9-5a20e6c09248", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "cf2e4433-c45b-4401-b472-8fbda6b5284a", "policyName": "8a550f70-cc98-4b2d-a3ae-2a624ae3c56b"}] = reason {
	checkResourceIntegrity
	checkPrincipalRole({"admin"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x5c3e876cb6e531a3a35cc985ab53e8f3869530b5"})
	checkChainId({"137"})
	reason = {"type": "permit", "policyId": "cf2e4433-c45b-4401-b472-8fbda6b5284a", "policyName": "8a550f70-cc98-4b2d-a3ae-2a624ae3c56b", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "99a32b34-33f7-4fe0-95df-0e021411dfd5", "policyName": "c715fcf4-7e9f-45ef-8615-770b0597fddf"}] = reason {
	checkResourceIntegrity
	checkPrincipalId({"auth0|62e1d7ca04533b042cb42419"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x5c3e876cb6e531a3a35cc985ab53e8f3869530b5"})
	checkChainId({"137"})
	reason = {"type": "permit", "policyId": "99a32b34-33f7-4fe0-95df-0e021411dfd5", "policyName": "c715fcf4-7e9f-45ef-8615-770b0597fddf", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "bd0ce56e-b563-4da4-8863-c0bd61b42b1e", "policyName": "3d597a7c-cebc-4cb0-8c82-a31fda95e5e7"}] = reason {
	checkResourceIntegrity
	checkPrincipalId({"auth0|62e1d7ca04533b042cb42419"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0xa2a13ce1824f3916fc84c65e559391fc6674e6e8"})
	checkChainId({"137"})
	reason = {"type": "permit", "policyId": "bd0ce56e-b563-4da4-8863-c0bd61b42b1e", "policyName": "3d597a7c-cebc-4cb0-8c82-a31fda95e5e7", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "8b39e0c4-02f5-42de-9e24-4142c50ace64", "policyName": "4655de9d-37be-4796-9c49-1e9344c39e21"}] = reason {
	checkResourceIntegrity
	checkPrincipalId({"auth0|62e1d7ca04533b042cb42419"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0xa2a13ce1824f3916fc84c65e559391fc6674e6e8"})
	checkChainId({"137"})
	reason = {"type": "permit", "policyId": "8b39e0c4-02f5-42de-9e24-4142c50ace64", "policyName": "4655de9d-37be-4796-9c49-1e9344c39e21", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "be147e0e-3c09-4642-a932-373ec08e1323", "policyName": "7ad914af-edc6-4170-b840-4988ff831ca9"}] = reason {
	checkResourceIntegrity
	checkPrincipalId({"auth0|62e1d7ca04533b042cb42419"})
	checkDestinationAddress({"nftAssetTransfer"})
	checkAction({"signTransaction"})
	checkIntentType({"transferErc721"})
	checkIntentContract({"eip155:137:0xa2a13ce1824f3916fc84c65e559391fc6674e6e8"})
	checkChainId({"137"})
	reason = {"type": "permit", "policyId": "be147e0e-3c09-4642-a932-373ec08e1323", "policyName": "7ad914af-edc6-4170-b840-4988ff831ca9", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "9fa86c7a-df87-468e-95bc-c1a61691dd39", "policyName": "18d771af-33a1-46c6-bd95-5008871eff60"}] = reason {
	checkResourceIntegrity
	checkPrincipalId({"auth0|62e1d7ca04533b042cb42419"})
	checkAction({"signMessage"})
	reason = {"type": "permit", "policyId": "9fa86c7a-df87-468e-95bc-c1a61691dd39", "policyName": "18d771af-33a1-46c6-bd95-5008871eff60", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "12570773-b779-4e9e-8a77-f10463c31719", "policyName": "7543edef-087e-4550-b6bb-dba3e3e6c710"}] = reason {
	checkResourceIntegrity
	checkPrincipalId({"debb4c0f-235c-497e-8009-7476b7494c26"})
	checkAction({"signTransaction"})
	checkIntentType({"transferErc721", "transferErc1155"})
	reason = {"type": "permit", "policyId": "12570773-b779-4e9e-8a77-f10463c31719", "policyName": "7543edef-087e-4550-b6bb-dba3e3e6c710", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "fbb67a97-460e-43e1-8d45-f2e7093def84", "policyName": "9e2b8d76-69cb-4cc2-815f-499b054686c9"}] = reason {
	checkResourceIntegrity
	checkPrincipalId({"auth0|62e1d7ca04533b042cb42419"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x5c3e876cb6e531a3a35cc985ab53e8f3869530b5"})
	checkChainId({"137"})
	reason = {"type": "permit", "policyId": "fbb67a97-460e-43e1-8d45-f2e7093def84", "policyName": "9e2b8d76-69cb-4cc2-815f-499b054686c9", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "0aeeb917-37a2-4a29-beb8-755eb02fb23b", "policyName": "c77b1a6c-f86a-4910-96a7-11809199dcdc"}] = reason {
	checkResourceIntegrity
	checkPrincipalRole({"admin"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkChainId({"137"})
	checkIntentHexSignature({"0x9dafc880"})
	reason = {"type": "permit", "policyId": "0aeeb917-37a2-4a29-beb8-755eb02fb23b", "policyName": "c77b1a6c-f86a-4910-96a7-11809199dcdc", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "876a2230-49bd-4c88-b7e3-599afe122c03", "policyName": "d1d59f96-cf8f-463e-9018-9dbd4fa2113d"}] = reason {
	checkResourceIntegrity
	checkPrincipalRole({"member"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkChainId({"137"})
	checkIntentHexSignature({"0x9dafc880"})
	reason = {"type": "permit", "policyId": "876a2230-49bd-4c88-b7e3-599afe122c03", "policyName": "d1d59f96-cf8f-463e-9018-9dbd4fa2113d", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "2cf38102-9af7-4ed2-872a-50ef5ff9dc58", "policyName": "9383acd7-591c-419a-8730-2068f0a908a9"}] = reason {
	checkResourceIntegrity
	checkPrincipalRole({"admin"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkChainId({"137"})
	checkIntentHexSignature({"0x4b4a0bdf"})
	reason = {"type": "permit", "policyId": "2cf38102-9af7-4ed2-872a-50ef5ff9dc58", "policyName": "9383acd7-591c-419a-8730-2068f0a908a9", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "9a68a07a-1181-4500-966a-4c1e184ebc14", "policyName": "13bd8904-2209-4717-a77d-511932f04391"}] = reason {
	checkResourceIntegrity
	checkPrincipalRole({"admin"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkChainId({"137"})
	checkIntentHexSignature({"0xa3105f63"})
	reason = {"type": "permit", "policyId": "9a68a07a-1181-4500-966a-4c1e184ebc14", "policyName": "13bd8904-2209-4717-a77d-511932f04391", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "fc6b3ba5-83d0-41b5-b8d1-14dfe1e2b032", "policyName": "50c7acef-8279-4fcd-a539-94c93a243d68"}] = reason {
	checkResourceIntegrity
	checkPrincipalRole({"member"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkChainId({"137"})
	checkIntentHexSignature({"0x5e351737"})
	reason = {"type": "permit", "policyId": "fc6b3ba5-83d0-41b5-b8d1-14dfe1e2b032", "policyName": "50c7acef-8279-4fcd-a539-94c93a243d68", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "980506ed-57a3-4886-a95d-651ecee084cd", "policyName": "3dd3670e-e166-4185-b18e-90f4afd07cbe"}] = reason {
	checkResourceIntegrity
	checkPrincipalRole({"admin"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkChainId({"137"})
	checkIntentHexSignature({"0x5e351737"})
	reason = {"type": "permit", "policyId": "980506ed-57a3-4886-a95d-651ecee084cd", "policyName": "3dd3670e-e166-4185-b18e-90f4afd07cbe", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "89f0e6ff-6e33-41c9-82a1-a6b5303a3ea0", "policyName": "8f166dfc-1c16-4fcf-b760-9df12c430e46"}] = reason {
	checkResourceIntegrity
	checkPrincipalRole({"member"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkChainId({"137"})
	checkIntentHexSignature({"0x37e28cd7"})
	reason = {"type": "permit", "policyId": "89f0e6ff-6e33-41c9-82a1-a6b5303a3ea0", "policyName": "8f166dfc-1c16-4fcf-b760-9df12c430e46", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "752c757b-69cf-4356-b978-327b440211dc", "policyName": "568d0fc4-ac9d-4cee-95f1-bac6863b9b38"}] = reason {
	checkResourceIntegrity
	checkPrincipalRole({"admin"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkChainId({"137"})
	checkIntentHexSignature({"0x65c38bb8"})
	reason = {"type": "permit", "policyId": "752c757b-69cf-4356-b978-327b440211dc", "policyName": "568d0fc4-ac9d-4cee-95f1-bac6863b9b38", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "d661942e-05e8-40f5-9e63-96edcf29b039", "policyName": "38487fdd-3503-4967-ba2c-281ca974a5d3"}] = reason {
	checkResourceIntegrity
	checkPrincipalRole({"admin"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkChainId({"137"})
	checkIntentHexSignature({"0x37e28cd7"})
	reason = {"type": "permit", "policyId": "d661942e-05e8-40f5-9e63-96edcf29b039", "policyName": "38487fdd-3503-4967-ba2c-281ca974a5d3", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "69a61bdf-15f1-4c9d-a0af-1824dd8c697d", "policyName": "9dac2d74-54a4-415a-90ae-ed9786365b30"}] = reason {
	checkResourceIntegrity
	checkPrincipalRole({"member"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkChainId({"137"})
	checkIntentHexSignature({"0xa3105f63"})
	reason = {"type": "permit", "policyId": "69a61bdf-15f1-4c9d-a0af-1824dd8c697d", "policyName": "9dac2d74-54a4-415a-90ae-ed9786365b30", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "12d1bf12-72a5-4290-98f2-69e4d59b52ec", "policyName": "04051b89-0ba7-454a-bbc2-ea8a66e80ef1"}] = reason {
	checkResourceIntegrity
	checkPrincipalRole({"admin"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkChainId({"137"})
	checkIntentHexSignature({"0x77f57d50"})
	reason = {"type": "permit", "policyId": "12d1bf12-72a5-4290-98f2-69e4d59b52ec", "policyName": "04051b89-0ba7-454a-bbc2-ea8a66e80ef1", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "0295b0ae-2517-488c-9576-71ac04e44462", "policyName": "cf85beee-91d9-4b16-a234-e9231c5b5589"}] = reason {
	checkResourceIntegrity
	checkPrincipalRole({"member"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkChainId({"137"})
	checkIntentHexSignature({"0x4b4a0bdf"})
	reason = {"type": "permit", "policyId": "0295b0ae-2517-488c-9576-71ac04e44462", "policyName": "cf85beee-91d9-4b16-a234-e9231c5b5589", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "d3448763-7571-4f19-9528-9aaabcb48b1c", "policyName": "3b1a5031-84c0-4eec-bfd3-1fab190a0ca3"}] = reason {
	checkResourceIntegrity
	checkPrincipalRole({"member"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkChainId({"137"})
	checkIntentHexSignature({"0x77f57d50"})
	reason = {"type": "permit", "policyId": "d3448763-7571-4f19-9528-9aaabcb48b1c", "policyName": "3b1a5031-84c0-4eec-bfd3-1fab190a0ca3", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "f9d74721-a08d-4ba0-881f-82d45fb0de21", "policyName": "55039c69-dfde-4a2a-8b25-48d273ed5bd9"}] = reason {
	checkResourceIntegrity
	checkPrincipalRole({"admin"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkChainId({"137"})
	checkIntentHexSignature({"0x27b8e40c"})
	reason = {"type": "permit", "policyId": "f9d74721-a08d-4ba0-881f-82d45fb0de21", "policyName": "55039c69-dfde-4a2a-8b25-48d273ed5bd9", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "12454a14-cbe2-4b51-bceb-85f1c4379377", "policyName": "f65db91c-e5e9-4f23-892f-9e97eed41fca"}] = reason {
	checkResourceIntegrity
	checkPrincipalRole({"member"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkChainId({"137"})
	checkIntentHexSignature({"0x27b8e40c"})
	reason = {"type": "permit", "policyId": "12454a14-cbe2-4b51-bceb-85f1c4379377", "policyName": "f65db91c-e5e9-4f23-892f-9e97eed41fca", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "8d3e6306-bfb9-42a2-8e79-d2446f7c166f", "policyName": "2fa683d2-81d6-4c3f-a88d-9cadb2b5c21c"}] = reason {
	checkResourceIntegrity
	checkPrincipalRole({"member"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkChainId({"137"})
	checkIntentHexSignature({"0x65c38bb8"})
	reason = {"type": "permit", "policyId": "8d3e6306-bfb9-42a2-8e79-d2446f7c166f", "policyName": "2fa683d2-81d6-4c3f-a88d-9cadb2b5c21c", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "adcf0097-fbcb-4539-9ca6-3a0acc0ff499", "policyName": "0d745699-8176-44db-bde9-55474fba6cc7"}] = reason {
	checkResourceIntegrity
	checkPrincipalRole({"member"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkChainId({"137"})
	checkIntentHexSignature({"0x9dafc880"})
	reason = {"type": "permit", "policyId": "adcf0097-fbcb-4539-9ca6-3a0acc0ff499", "policyName": "0d745699-8176-44db-bde9-55474fba6cc7", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "b4abf94f-7ef5-4b7b-bbb6-1d8cb903ba1e", "policyName": "e7cd1d07-c92b-404c-9ec7-a6a3b8c43790"}] = reason {
	checkResourceIntegrity
	checkPrincipalRole({"member"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkChainId({"137"})
	checkIntentHexSignature({"0xa3105f63"})
	reason = {"type": "permit", "policyId": "b4abf94f-7ef5-4b7b-bbb6-1d8cb903ba1e", "policyName": "e7cd1d07-c92b-404c-9ec7-a6a3b8c43790", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "56c43855-0da1-466b-b797-50cf3d27ef78", "policyName": "f0932890-7756-46c2-9509-9260416e6172"}] = reason {
	checkResourceIntegrity
	checkPrincipalRole({"member"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkChainId({"137"})
	checkIntentHexSignature({"0x5e351737"})
	reason = {"type": "permit", "policyId": "56c43855-0da1-466b-b797-50cf3d27ef78", "policyName": "f0932890-7756-46c2-9509-9260416e6172", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "c632e6d0-d086-410a-92fb-c194fd1488ea", "policyName": "15c8a58c-c63d-4964-a200-1846c20b7c72"}] = reason {
	checkResourceIntegrity
	checkPrincipalRole({"admin"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkChainId({"137"})
	checkIntentHexSignature({"0x4b4a0bdf"})
	reason = {"type": "permit", "policyId": "c632e6d0-d086-410a-92fb-c194fd1488ea", "policyName": "15c8a58c-c63d-4964-a200-1846c20b7c72", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "9bc744f3-a199-40c0-81f0-2de69f349595", "policyName": "3d166ee3-7ed5-4c81-a3f6-5576f474573f"}] = reason {
	checkResourceIntegrity
	checkPrincipalRole({"admin"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkChainId({"137"})
	checkIntentHexSignature({"0x9dafc880"})
	reason = {"type": "permit", "policyId": "9bc744f3-a199-40c0-81f0-2de69f349595", "policyName": "3d166ee3-7ed5-4c81-a3f6-5576f474573f", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "252f1f83-35a4-4b4d-aa0b-d1b1d3ac848e", "policyName": "59409ad3-aa95-4bd6-b78e-0c9bf2b85025"}] = reason {
	checkResourceIntegrity
	checkPrincipalRole({"member"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkChainId({"137"})
	checkIntentHexSignature({"0x27b8e40c"})
	reason = {"type": "permit", "policyId": "252f1f83-35a4-4b4d-aa0b-d1b1d3ac848e", "policyName": "59409ad3-aa95-4bd6-b78e-0c9bf2b85025", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "66914785-1d5e-4069-98d4-1501e0ffb217", "policyName": "45019a29-b5ee-4d3a-bebb-918867ba411d"}] = reason {
	checkResourceIntegrity
	checkPrincipalRole({"admin"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkChainId({"137"})
	checkIntentHexSignature({"0xa3105f63"})
	reason = {"type": "permit", "policyId": "66914785-1d5e-4069-98d4-1501e0ffb217", "policyName": "45019a29-b5ee-4d3a-bebb-918867ba411d", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "ba1ef977-3b86-43c9-8ad1-6230c0745a24", "policyName": "ad512d85-3827-42a1-9f92-2373ad9c48a0"}] = reason {
	checkResourceIntegrity
	checkPrincipalRole({"admin"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkChainId({"137"})
	checkIntentHexSignature({"0x77f57d50"})
	reason = {"type": "permit", "policyId": "ba1ef977-3b86-43c9-8ad1-6230c0745a24", "policyName": "ad512d85-3827-42a1-9f92-2373ad9c48a0", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "75dc4935-dd17-4320-b37e-54586293668b", "policyName": "67ebdaeb-4f83-45c5-8cec-68832fc69ec5"}] = reason {
	checkResourceIntegrity
	checkPrincipalRole({"member"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkChainId({"137"})
	checkIntentHexSignature({"0x4b4a0bdf"})
	reason = {"type": "permit", "policyId": "75dc4935-dd17-4320-b37e-54586293668b", "policyName": "67ebdaeb-4f83-45c5-8cec-68832fc69ec5", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "2999e97c-00df-4fdd-ad83-8353206664d9", "policyName": "18133452-fb49-4cbb-ab98-4277f72153bd"}] = reason {
	checkResourceIntegrity
	checkPrincipalRole({"admin"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkChainId({"137"})
	checkIntentHexSignature({"0x37e28cd7"})
	reason = {"type": "permit", "policyId": "2999e97c-00df-4fdd-ad83-8353206664d9", "policyName": "18133452-fb49-4cbb-ab98-4277f72153bd", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "379df08d-8c03-4cf9-9bed-067838bd1787", "policyName": "8e489a05-1ad5-4327-b316-70c8da8dc8f3"}] = reason {
	checkResourceIntegrity
	checkPrincipalRole({"member"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkChainId({"137"})
	checkIntentHexSignature({"0x37e28cd7"})
	reason = {"type": "permit", "policyId": "379df08d-8c03-4cf9-9bed-067838bd1787", "policyName": "8e489a05-1ad5-4327-b316-70c8da8dc8f3", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "e680a54a-2f78-4461-8ae3-3cdc625f3a6b", "policyName": "4acb88b3-775d-44a7-a18a-45644d4967a0"}] = reason {
	checkResourceIntegrity
	checkPrincipalRole({"member"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkChainId({"137"})
	checkIntentHexSignature({"0x65c38bb8"})
	reason = {"type": "permit", "policyId": "e680a54a-2f78-4461-8ae3-3cdc625f3a6b", "policyName": "4acb88b3-775d-44a7-a18a-45644d4967a0", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "5947ac5f-16ea-423d-a4f3-36036aee45df", "policyName": "06122f43-d9ff-49c1-925e-e812fd39c6aa"}] = reason {
	checkResourceIntegrity
	checkPrincipalRole({"member"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkChainId({"137"})
	checkIntentHexSignature({"0x77f57d50"})
	reason = {"type": "permit", "policyId": "5947ac5f-16ea-423d-a4f3-36036aee45df", "policyName": "06122f43-d9ff-49c1-925e-e812fd39c6aa", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "414918f2-5e76-4db3-b727-1801b433b285", "policyName": "bef5ea3c-8e2b-42f3-846e-79383dcfe5e0"}] = reason {
	checkResourceIntegrity
	checkPrincipalRole({"admin"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkChainId({"137"})
	checkIntentHexSignature({"0x5e351737"})
	reason = {"type": "permit", "policyId": "414918f2-5e76-4db3-b727-1801b433b285", "policyName": "bef5ea3c-8e2b-42f3-846e-79383dcfe5e0", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "e7926d9a-ac70-4343-9570-39aeadc68cf5", "policyName": "325bfba9-7c23-4b87-a676-fe61fb9b1826"}] = reason {
	checkResourceIntegrity
	checkPrincipalRole({"admin"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkChainId({"137"})
	checkIntentHexSignature({"0x65c38bb8"})
	reason = {"type": "permit", "policyId": "e7926d9a-ac70-4343-9570-39aeadc68cf5", "policyName": "325bfba9-7c23-4b87-a676-fe61fb9b1826", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "1a07cb3e-ee76-412d-8611-060753d0ef78", "policyName": "1deb18cf-75cb-4cc0-850d-e73aa5c89c47"}] = reason {
	checkResourceIntegrity
	checkPrincipalRole({"admin"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkChainId({"137"})
	checkIntentHexSignature({"0x27b8e40c"})
	reason = {"type": "permit", "policyId": "1a07cb3e-ee76-412d-8611-060753d0ef78", "policyName": "1deb18cf-75cb-4cc0-850d-e73aa5c89c47", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "f2c78998-07c9-4ef4-a669-43589f8edfd5", "policyName": "4280497c-ba28-4e77-b36d-8c54ef4eeac2"}] = reason {
	checkResourceIntegrity
	checkPrincipalRole({"member"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkChainId({"137"})
	checkIntentHexSignature({"0x37e28cd7"})
	reason = {"type": "permit", "policyId": "f2c78998-07c9-4ef4-a669-43589f8edfd5", "policyName": "4280497c-ba28-4e77-b36d-8c54ef4eeac2", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "f3048c2a-a3c6-4a96-830c-fc0a0107cb79", "policyName": "7d4df6cc-ea13-49b7-940c-5130c0ed0992"}] = reason {
	checkResourceIntegrity
	checkPrincipalRole({"member"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkChainId({"137"})
	checkIntentHexSignature({"0xa3105f63"})
	reason = {"type": "permit", "policyId": "f3048c2a-a3c6-4a96-830c-fc0a0107cb79", "policyName": "7d4df6cc-ea13-49b7-940c-5130c0ed0992", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "00302d52-18ac-462d-9850-cff34728f52a", "policyName": "a386c957-0ef6-45a6-859a-3f07e490782d"}] = reason {
	checkResourceIntegrity
	checkPrincipalRole({"member"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkChainId({"137"})
	checkIntentHexSignature({"0x9dafc880"})
	reason = {"type": "permit", "policyId": "00302d52-18ac-462d-9850-cff34728f52a", "policyName": "a386c957-0ef6-45a6-859a-3f07e490782d", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "e49643a6-01ab-4bad-ae06-126229a9df88", "policyName": "0ff36d61-d11d-4ce9-a225-dabfa8a61dcf"}] = reason {
	checkResourceIntegrity
	checkPrincipalRole({"admin"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkChainId({"137"})
	checkIntentHexSignature({"0x9dafc880"})
	reason = {"type": "permit", "policyId": "e49643a6-01ab-4bad-ae06-126229a9df88", "policyName": "0ff36d61-d11d-4ce9-a225-dabfa8a61dcf", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "c4295735-0e5d-4263-b650-8575669188ce", "policyName": "ef73b23d-168a-4e1c-9e0b-eb54058b925d"}] = reason {
	checkResourceIntegrity
	checkPrincipalRole({"admin"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkChainId({"137"})
	checkIntentHexSignature({"0xa3105f63"})
	reason = {"type": "permit", "policyId": "c4295735-0e5d-4263-b650-8575669188ce", "policyName": "ef73b23d-168a-4e1c-9e0b-eb54058b925d", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "e79dc307-6981-4f7e-84a4-231b78e396ea", "policyName": "2109d39d-6e3f-47bf-a6e6-0079128a77d8"}] = reason {
	checkResourceIntegrity
	checkPrincipalRole({"admin"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkChainId({"137"})
	checkIntentHexSignature({"0x65c38bb8"})
	reason = {"type": "permit", "policyId": "e79dc307-6981-4f7e-84a4-231b78e396ea", "policyName": "2109d39d-6e3f-47bf-a6e6-0079128a77d8", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "ddbafcf4-f331-474d-ad9c-57fd048f3de4", "policyName": "d9b9257d-d335-450f-8e6c-cc910344563f"}] = reason {
	checkResourceIntegrity
	checkPrincipalRole({"member"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkChainId({"137"})
	checkIntentHexSignature({"0x27b8e40c"})
	reason = {"type": "permit", "policyId": "ddbafcf4-f331-474d-ad9c-57fd048f3de4", "policyName": "d9b9257d-d335-450f-8e6c-cc910344563f", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "b6fae9a4-1dd6-4221-9525-d58c4fe006d8", "policyName": "6d560223-1c9a-433e-bb63-4fbfe9c2c2e9"}] = reason {
	checkResourceIntegrity
	checkPrincipalRole({"member"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkChainId({"137"})
	checkIntentHexSignature({"0x77f57d50"})
	reason = {"type": "permit", "policyId": "b6fae9a4-1dd6-4221-9525-d58c4fe006d8", "policyName": "6d560223-1c9a-433e-bb63-4fbfe9c2c2e9", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "1c142e6d-350f-43b3-ba5c-9dedfe60b37c", "policyName": "c69202e1-b2e1-4cdc-9c0d-57870ec9e226"}] = reason {
	checkResourceIntegrity
	checkPrincipalRole({"member"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkChainId({"137"})
	checkIntentHexSignature({"0x65c38bb8"})
	reason = {"type": "permit", "policyId": "1c142e6d-350f-43b3-ba5c-9dedfe60b37c", "policyName": "c69202e1-b2e1-4cdc-9c0d-57870ec9e226", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "af5eb1a4-031d-4615-8b56-696905dc22d6", "policyName": "83a25c78-f344-49bc-81d3-0beac44ab84e"}] = reason {
	checkResourceIntegrity
	checkPrincipalRole({"member"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkChainId({"137"})
	checkIntentHexSignature({"0x5e351737"})
	reason = {"type": "permit", "policyId": "af5eb1a4-031d-4615-8b56-696905dc22d6", "policyName": "83a25c78-f344-49bc-81d3-0beac44ab84e", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "870093d7-54ec-4ede-a59a-10bd25ba0485", "policyName": "8d0f728c-7214-43d5-ab4a-338c499d2eda"}] = reason {
	checkResourceIntegrity
	checkPrincipalRole({"admin"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkChainId({"137"})
	checkIntentHexSignature({"0x37e28cd7"})
	reason = {"type": "permit", "policyId": "870093d7-54ec-4ede-a59a-10bd25ba0485", "policyName": "8d0f728c-7214-43d5-ab4a-338c499d2eda", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "2881f0b0-64b0-4eb2-a71c-72bcef291b66", "policyName": "6eaaba91-2e24-4ce2-b201-90cda846c776"}] = reason {
	checkResourceIntegrity
	checkPrincipalRole({"admin"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkChainId({"137"})
	checkIntentHexSignature({"0x4b4a0bdf"})
	reason = {"type": "permit", "policyId": "2881f0b0-64b0-4eb2-a71c-72bcef291b66", "policyName": "6eaaba91-2e24-4ce2-b201-90cda846c776", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "393d4171-c545-4840-8081-697a083ef5e0", "policyName": "e207ff6e-51a7-419c-b6bc-5f89d155e907"}] = reason {
	checkResourceIntegrity
	checkPrincipalRole({"admin"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkChainId({"137"})
	checkIntentHexSignature({"0x77f57d50"})
	reason = {"type": "permit", "policyId": "393d4171-c545-4840-8081-697a083ef5e0", "policyName": "e207ff6e-51a7-419c-b6bc-5f89d155e907", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "047e0886-0406-4c64-8222-5b827e8ccc2d", "policyName": "65970262-79ec-484d-a744-bd81dace3d15"}] = reason {
	checkResourceIntegrity
	checkPrincipalRole({"admin"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkChainId({"137"})
	checkIntentHexSignature({"0x27b8e40c"})
	reason = {"type": "permit", "policyId": "047e0886-0406-4c64-8222-5b827e8ccc2d", "policyName": "65970262-79ec-484d-a744-bd81dace3d15", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "581406eb-2275-4c0c-aca5-6be43cff769d", "policyName": "8b8a4584-39e2-4b89-b471-eb6b262dfae9"}] = reason {
	checkResourceIntegrity
	checkPrincipalRole({"admin"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkChainId({"137"})
	checkIntentHexSignature({"0x5e351737"})
	reason = {"type": "permit", "policyId": "581406eb-2275-4c0c-aca5-6be43cff769d", "policyName": "8b8a4584-39e2-4b89-b471-eb6b262dfae9", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "1e820919-c28d-4189-b13b-41cb9404d5be", "policyName": "e8069224-68c3-4073-9249-afe0f6544631"}] = reason {
	checkResourceIntegrity
	checkPrincipalRole({"member"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkChainId({"137"})
	checkIntentHexSignature({"0x4b4a0bdf"})
	reason = {"type": "permit", "policyId": "1e820919-c28d-4189-b13b-41cb9404d5be", "policyName": "e8069224-68c3-4073-9249-afe0f6544631", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "1aa44b88-0b24-46e2-a304-91edee3bc8e4", "policyName": "552fff6a-af3f-4a24-8b9a-4b77db6fc971"}] = reason {
	checkResourceIntegrity
	checkPrincipalId({"13b8f90e-d929-49a9-8f8c-a40bfff0f09e"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x4c60051384bd2d3c01bfc845cf5f4b44bcbe9de5"})
	checkChainId({"137"})
	reason = {"type": "permit", "policyId": "1aa44b88-0b24-46e2-a304-91edee3bc8e4", "policyName": "552fff6a-af3f-4a24-8b9a-4b77db6fc971", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "b0319968-b583-4d0f-b7f9-504dedf2365e", "policyName": "afef70ed-9e23-4f79-a95c-a0616c01b5d1"}] = reason {
	checkResourceIntegrity
	checkPrincipalId({"debb4c0f-235c-497e-8009-7476b7494c26"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkWalletAddress({"0xa1d6e9a37b3fb99b226f64741627af6f4ae219e1"})
	reason = {"type": "permit", "policyId": "b0319968-b583-4d0f-b7f9-504dedf2365e", "policyName": "afef70ed-9e23-4f79-a95c-a0616c01b5d1", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "a039db89-b9ca-42ca-9fb8-575d979b294a", "policyName": "6a898c76-584f-4616-8246-c5d31afc07c9"}] = reason {
	checkResourceIntegrity
	checkPrincipalId({"13b8f90e-d929-49a9-8f8c-a40bfff0f09e"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x4c60051384bd2d3c01bfc845cf5f4b44bcbe9de5"})
	checkChainId({"137"})
	checkIntentHexSignature({"0x24856bc3"})
	reason = {"type": "permit", "policyId": "a039db89-b9ca-42ca-9fb8-575d979b294a", "policyName": "6a898c76-584f-4616-8246-c5d31afc07c9", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "9c6f7f56-1e0a-44c9-88cb-92b97d41eabf", "policyName": "48d24de0-3d05-46ce-81cf-3f81e8022283"}] = reason {
	checkResourceIntegrity
	checkPrincipalId({"13b8f90e-d929-49a9-8f8c-a40bfff0f09e"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x4c60051384bd2d3c01bfc845cf5f4b44bcbe9de5"})
	checkChainId({"137"})
	checkIntentHexSignature({"0x24856bc3"})
	reason = {"type": "permit", "policyId": "9c6f7f56-1e0a-44c9-88cb-92b97d41eabf", "policyName": "48d24de0-3d05-46ce-81cf-3f81e8022283", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "33313a97-08f0-4446-bdf8-fce6307cf354", "policyName": "a86e9f14-4018-43cc-b15a-fc1e42ec4406"}] = reason {
	checkResourceIntegrity
	checkPrincipalId({"13b8f90e-d929-49a9-8f8c-a40bfff0f09e"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x4c60051384bd2d3c01bfc845cf5f4b44bcbe9de5"})
	checkChainId({"137"})
	checkIntentHexSignature({"0x24856bc3"})
	reason = {"type": "permit", "policyId": "33313a97-08f0-4446-bdf8-fce6307cf354", "policyName": "a86e9f14-4018-43cc-b15a-fc1e42ec4406", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "9770242d-54fb-418a-9fb2-e0967ea92088", "policyName": "68627533-b4de-4c60-9bff-8419678638a5"}] = reason {
	checkResourceIntegrity
	checkPrincipalId({"13b8f90e-d929-49a9-8f8c-a40bfff0f09e"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x4c60051384bd2d3c01bfc845cf5f4b44bcbe9de5"})
	checkChainId({"137"})
	checkIntentHexSignature({"0x24856bc3"})
	reason = {"type": "permit", "policyId": "9770242d-54fb-418a-9fb2-e0967ea92088", "policyName": "68627533-b4de-4c60-9bff-8419678638a5", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "ceca9af9-c7d7-42bc-93bb-60160d7a04cb", "policyName": "8ddd52ba-fe72-488a-8c0a-49215cca56fd"}] = reason {
	checkResourceIntegrity
	checkPrincipalId({"auth0|62e3998004533b042cb44ccf"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
	checkChainId({"137"})
	reason = {"type": "permit", "policyId": "ceca9af9-c7d7-42bc-93bb-60160d7a04cb", "policyName": "8ddd52ba-fe72-488a-8c0a-49215cca56fd", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "f34291b1-4dd2-4eed-8ee6-823dc7aed530", "policyName": "94890c04-d3d2-4614-82cd-1709abd96c0f"}] = reason {
	checkResourceIntegrity
	checkPrincipalId({"auth0|62e3998004533b042cb44ccf"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
	checkChainId({"137"})
	reason = {"type": "permit", "policyId": "f34291b1-4dd2-4eed-8ee6-823dc7aed530", "policyName": "94890c04-d3d2-4614-82cd-1709abd96c0f", "approvalsSatisfied": [], "approvalsMissing": []}
}

forbid[{"policyId": "56fffe2d-5b77-4c71-8da6-454134b826de", "policyName": "746bbc21-c869-4d2e-8236-dda489274610"}] = reason {
	checkResourceIntegrity
	checkPrincipalId({"auth0|62e1d7ca04533b042cb42419"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
	checkChainId({"137"})
	reason = {"type": "forbid", "policyId": "56fffe2d-5b77-4c71-8da6-454134b826de", "policyName": "746bbc21-c869-4d2e-8236-dda489274610", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "3f105c4a-6bc6-4b54-8a8d-16afc9722589", "policyName": "7bf29225-1825-4bd6-8b8a-ef2c0a40707a"}] = reason {
	checkResourceIntegrity
	checkPrincipalId({"615f46d7-7039-43a3-a904-6daccaf72e61"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0xfbe3ab0cbfbd17d06bdd73aa3f55aaf038720f59"})
	checkChainId({"137"})
	checkIntentHexSignature({"0x23b872dd"})
	reason = {"type": "permit", "policyId": "3f105c4a-6bc6-4b54-8a8d-16afc9722589", "policyName": "7bf29225-1825-4bd6-8b8a-ef2c0a40707a", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "8b9d00bf-d1e6-414b-a032-6b275fa07bb0", "policyName": "dda465a6-8dc1-4142-9d00-ec6313955f01"}] = reason {
	checkResourceIntegrity
	checkPrincipalId({"auth0|62e3998004533b042cb44ccf"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
	checkChainId({"137"})
	checkIntentHexSignature({"0x42842e0e"})
	reason = {"type": "permit", "policyId": "8b9d00bf-d1e6-414b-a032-6b275fa07bb0", "policyName": "dda465a6-8dc1-4142-9d00-ec6313955f01", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "218df6c2-ae11-4949-a6f6-778d0af2e41b", "policyName": "d1f6e863-ae60-409d-870f-3faf7032d616"}] = reason {
	checkResourceIntegrity
	checkPrincipalRole({"admin"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
	checkChainId({"137"})
	checkIntentHexSignature({"0x65b4613f"})
	reason = {"type": "permit", "policyId": "218df6c2-ae11-4949-a6f6-778d0af2e41b", "policyName": "d1f6e863-ae60-409d-870f-3faf7032d616", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "e527d063-a908-4ff0-b6c9-071d3485f00e", "policyName": "39550a81-1c30-48f3-a590-6cbb6ddd375d"}] = reason {
	checkResourceIntegrity
	checkPrincipalRole({"admin"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
	checkChainId({"137"})
	checkIntentHexSignature({"0xef68253d"})
	reason = {"type": "permit", "policyId": "e527d063-a908-4ff0-b6c9-071d3485f00e", "policyName": "39550a81-1c30-48f3-a590-6cbb6ddd375d", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "51971121-3097-47a8-87e5-367a97cd4903", "policyName": "9d37e0ab-8b25-48d3-b0ba-766f15a12626"}] = reason {
	checkResourceIntegrity
	checkPrincipalRole({"admin"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
	checkChainId({"137"})
	checkIntentHexSignature({"0x93551267"})
	reason = {"type": "permit", "policyId": "51971121-3097-47a8-87e5-367a97cd4903", "policyName": "9d37e0ab-8b25-48d3-b0ba-766f15a12626", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "d5b39f25-ce05-4fba-9a3f-19394e855cf3", "policyName": "03959b54-5fdb-4c2c-b10e-996e07b7b1d4"}] = reason {
	checkResourceIntegrity
	checkPrincipalRole({"member"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
	checkChainId({"137"})
	checkIntentHexSignature({"0x93551267"})
	reason = {"type": "permit", "policyId": "d5b39f25-ce05-4fba-9a3f-19394e855cf3", "policyName": "03959b54-5fdb-4c2c-b10e-996e07b7b1d4", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "7adf39aa-d76e-41c6-b6f6-72cb0793f8a7", "policyName": "67151495-b1a6-4632-8dff-a84277205daa"}] = reason {
	checkResourceIntegrity
	checkPrincipalRole({"admin"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0xa2a13ce1824f3916fc84c65e559391fc6674e6e8"})
	checkChainId({"137"})
	checkIntentHexSignature({"0x93e39539"})
	reason = {"type": "permit", "policyId": "7adf39aa-d76e-41c6-b6f6-72cb0793f8a7", "policyName": "67151495-b1a6-4632-8dff-a84277205daa", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "a5ee3b88-3e54-45c7-b4b9-295657ea15f0", "policyName": "e9918e0e-7621-4d95-afa3-deeaed768409"}] = reason {
	checkResourceIntegrity
	checkPrincipalRole({"member"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
	checkChainId({"137"})
	checkIntentHexSignature({"0x65b4613f"})
	reason = {"type": "permit", "policyId": "a5ee3b88-3e54-45c7-b4b9-295657ea15f0", "policyName": "e9918e0e-7621-4d95-afa3-deeaed768409", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "1fb8402b-193b-4f11-a690-8aff6cf95451", "policyName": "6c11f2c3-c9dc-4a67-afbb-14d2418b9233"}] = reason {
	checkResourceIntegrity
	checkPrincipalRole({"admin"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
	checkChainId({"137"})
	checkIntentHexSignature({"0x44c9b41f"})
	reason = {"type": "permit", "policyId": "1fb8402b-193b-4f11-a690-8aff6cf95451", "policyName": "6c11f2c3-c9dc-4a67-afbb-14d2418b9233", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "3a7f0ed9-61f2-417e-bd9a-01e9c969f253", "policyName": "c71e98e1-f4ef-4682-b628-79d03473fbdc"}] = reason {
	checkResourceIntegrity
	checkPrincipalRole({"admin"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
	checkChainId({"137"})
	checkIntentHexSignature({"0x86c68622"})
	reason = {"type": "permit", "policyId": "3a7f0ed9-61f2-417e-bd9a-01e9c969f253", "policyName": "c71e98e1-f4ef-4682-b628-79d03473fbdc", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "881ea037-2afa-4be5-bd81-6652692e495a", "policyName": "c0469d8c-1120-4985-8aa9-2df7a66885ea"}] = reason {
	checkResourceIntegrity
	checkPrincipalRole({"member"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0xa2a13ce1824f3916fc84c65e559391fc6674e6e8"})
	checkChainId({"137"})
	checkIntentHexSignature({"0x93e39539"})
	reason = {"type": "permit", "policyId": "881ea037-2afa-4be5-bd81-6652692e495a", "policyName": "c0469d8c-1120-4985-8aa9-2df7a66885ea", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "41604b92-390f-4ab5-aa79-9e2ba8e6635a", "policyName": "f473c356-a95b-496a-83ad-a67e07f67e59"}] = reason {
	checkResourceIntegrity
	checkPrincipalRole({"member"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkChainId({"137"})
	checkIntentHexSignature({"0x902ead61"})
	reason = {"type": "permit", "policyId": "41604b92-390f-4ab5-aa79-9e2ba8e6635a", "policyName": "f473c356-a95b-496a-83ad-a67e07f67e59", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "33f6af25-ed2e-4c96-a820-2d1e98567b12", "policyName": "fe3167f2-c5c4-4ed1-9217-cfa02e858515"}] = reason {
	checkResourceIntegrity
	checkPrincipalRole({"admin"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x6bc613a25afe159b70610b64783ca51c9258b92e"})
	checkChainId({"137"})
	checkIntentHexSignature({"0x6548b7ae"})
	reason = {"type": "permit", "policyId": "33f6af25-ed2e-4c96-a820-2d1e98567b12", "policyName": "fe3167f2-c5c4-4ed1-9217-cfa02e858515", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "5567e13f-1a1b-4be2-9444-b1a48db1c480", "policyName": "a018b301-3234-434b-83df-8547c14e926b"}] = reason {
	checkResourceIntegrity
	checkPrincipalRole({"member"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
	checkChainId({"137"})
	checkIntentHexSignature({"0x86c68622"})
	reason = {"type": "permit", "policyId": "5567e13f-1a1b-4be2-9444-b1a48db1c480", "policyName": "a018b301-3234-434b-83df-8547c14e926b", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "4cb28bb0-5341-4bf9-8ca1-35f400ea1059", "policyName": "8b357452-f7aa-4585-a798-720ac5a64e59"}] = reason {
	checkResourceIntegrity
	checkPrincipalRole({"member"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
	checkChainId({"137"})
	checkIntentHexSignature({"0x5d878596"})
	reason = {"type": "permit", "policyId": "4cb28bb0-5341-4bf9-8ca1-35f400ea1059", "policyName": "8b357452-f7aa-4585-a798-720ac5a64e59", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "e46915fa-239b-4a40-af91-ed81aa2aab46", "policyName": "5f1644df-8377-4691-91b0-fe6aa00d621f"}] = reason {
	checkResourceIntegrity
	checkPrincipalRole({"admin"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkChainId({"137"})
	checkIntentHexSignature({"0xdd86381e"})
	reason = {"type": "permit", "policyId": "e46915fa-239b-4a40-af91-ed81aa2aab46", "policyName": "5f1644df-8377-4691-91b0-fe6aa00d621f", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "96754397-003f-4656-a1de-d8e3104fb353", "policyName": "247157a4-1b64-4e75-8321-b98e38b0389e"}] = reason {
	checkResourceIntegrity
	checkPrincipalRole({"admin"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkChainId({"137"})
	checkIntentHexSignature({"0x51782474"})
	reason = {"type": "permit", "policyId": "96754397-003f-4656-a1de-d8e3104fb353", "policyName": "247157a4-1b64-4e75-8321-b98e38b0389e", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "8a2ecd2b-f952-48b9-91a7-713680dc6b3e", "policyName": "eabd89d2-194d-42cd-81c2-edef36b76caa"}] = reason {
	checkResourceIntegrity
	checkPrincipalRole({"member"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkChainId({"137"})
	checkIntentHexSignature({"0xeae2ea7e"})
	reason = {"type": "permit", "policyId": "8a2ecd2b-f952-48b9-91a7-713680dc6b3e", "policyName": "eabd89d2-194d-42cd-81c2-edef36b76caa", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "bcb6aaef-ac0f-4815-87db-28679724a73c", "policyName": "99e86b13-641e-47ca-8936-a95d3a6f437b"}] = reason {
	checkResourceIntegrity
	checkPrincipalRole({"admin"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
	checkChainId({"137"})
	checkIntentHexSignature({"0xd2df3a9e"})
	reason = {"type": "permit", "policyId": "bcb6aaef-ac0f-4815-87db-28679724a73c", "policyName": "99e86b13-641e-47ca-8936-a95d3a6f437b", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "fde0850f-d33d-469b-9b13-0c0f04872796", "policyName": "964091bf-3bba-4699-b3e1-d3eb46ca6d8c"}] = reason {
	checkResourceIntegrity
	checkPrincipalRole({"member"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
	checkChainId({"137"})
	checkIntentHexSignature({"0xd4db00cc"})
	reason = {"type": "permit", "policyId": "fde0850f-d33d-469b-9b13-0c0f04872796", "policyName": "964091bf-3bba-4699-b3e1-d3eb46ca6d8c", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "cc5e387c-dab6-4fd2-8c81-ea7e0b7349ba", "policyName": "c5510e0e-7a09-4db9-9690-019dad364989"}] = reason {
	checkResourceIntegrity
	checkPrincipalRole({"member"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x6bc613a25afe159b70610b64783ca51c9258b92e"})
	checkChainId({"137"})
	checkIntentHexSignature({"0x6548b7ae"})
	reason = {"type": "permit", "policyId": "cc5e387c-dab6-4fd2-8c81-ea7e0b7349ba", "policyName": "c5510e0e-7a09-4db9-9690-019dad364989", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "05b93c63-6cf2-43a2-ad35-befb8f52dc46", "policyName": "acf62623-e4f0-414a-99f8-2e30552d2976"}] = reason {
	checkResourceIntegrity
	checkPrincipalRole({"admin"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
	checkChainId({"137"})
	checkIntentHexSignature({"0xd4db00cc"})
	reason = {"type": "permit", "policyId": "05b93c63-6cf2-43a2-ad35-befb8f52dc46", "policyName": "acf62623-e4f0-414a-99f8-2e30552d2976", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "eac81709-9f35-449d-bd1d-ce0a382a2cf9", "policyName": "110502e9-ac0c-423f-9a8f-6376e2ffed88"}] = reason {
	checkResourceIntegrity
	checkPrincipalRole({"member"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkChainId({"137"})
	checkIntentHexSignature({"0x51782474"})
	reason = {"type": "permit", "policyId": "eac81709-9f35-449d-bd1d-ce0a382a2cf9", "policyName": "110502e9-ac0c-423f-9a8f-6376e2ffed88", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "201f5d2b-2275-468d-bc9f-6af31702ff3b", "policyName": "bc3fae98-2e50-4ff0-9c82-cd77cc6ee143"}] = reason {
	checkResourceIntegrity
	checkPrincipalId({"13b8f90e-d929-49a9-8f8c-a40bfff0f09e"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x3df16fb8dc28f63565af2815e04a3368360ffd23"})
	checkChainId({"137"})
	checkWalletAddress({"0x7a0854f64ded80455208ad6939950d915b2a101e"})
	reason = {"type": "permit", "policyId": "201f5d2b-2275-468d-bc9f-6af31702ff3b", "policyName": "bc3fae98-2e50-4ff0-9c82-cd77cc6ee143", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "ce93bacf-864d-4004-8871-37a5571385f2", "policyName": "44b5d3e8-5e02-428f-b057-61dd6293e374"}] = reason {
	checkResourceIntegrity
	checkPrincipalRole({"member"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
	checkChainId({"137"})
	checkIntentHexSignature({"0x9edcab23"})
	reason = {"type": "permit", "policyId": "ce93bacf-864d-4004-8871-37a5571385f2", "policyName": "44b5d3e8-5e02-428f-b057-61dd6293e374", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "e6a100d6-72d6-496f-bfca-bad60fc35964", "policyName": "a8ed180c-6607-4d6d-bce5-7be3a671dd2d"}] = reason {
	checkResourceIntegrity
	checkPrincipalRole({"admin"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
	checkChainId({"137"})
	checkIntentHexSignature({"0x9edcab23"})
	reason = {"type": "permit", "policyId": "e6a100d6-72d6-496f-bfca-bad60fc35964", "policyName": "a8ed180c-6607-4d6d-bce5-7be3a671dd2d", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "c99da265-d79d-4565-9f88-99c47d021855", "policyName": "ae036a24-fa6c-463c-acfa-59914cf67a59"}] = reason {
	checkResourceIntegrity
	checkPrincipalRole({"admin"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkChainId({"137"})
	checkIntentHexSignature({"0xd3ac2166"})
	reason = {"type": "permit", "policyId": "c99da265-d79d-4565-9f88-99c47d021855", "policyName": "ae036a24-fa6c-463c-acfa-59914cf67a59", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "d5090b2a-d0bc-4639-8871-c7925683c4ef", "policyName": "325ec9af-67dc-4a2a-9f90-1703406cf261"}] = reason {
	checkResourceIntegrity
	checkPrincipalRole({"member"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkChainId({"137"})
	checkIntentHexSignature({"0xd3ac2166"})
	reason = {"type": "permit", "policyId": "d5090b2a-d0bc-4639-8871-c7925683c4ef", "policyName": "325ec9af-67dc-4a2a-9f90-1703406cf261", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "99939b54-558c-4e4b-95f7-da736f2dc529", "policyName": "48412cc3-a596-4b04-aca4-b000f1e1335b"}] = reason {
	checkResourceIntegrity
	checkPrincipalRole({"admin"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkChainId({"137"})
	checkIntentHexSignature({"0x1521465b"})
	reason = {"type": "permit", "policyId": "99939b54-558c-4e4b-95f7-da736f2dc529", "policyName": "48412cc3-a596-4b04-aca4-b000f1e1335b", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "ee3cce51-0ffc-4259-bd12-2ef767e21ab6", "policyName": "cd19a84f-4b15-440f-a389-5f70420c43cd"}] = reason {
	checkResourceIntegrity
	checkPrincipalRole({"admin"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkChainId({"137"})
	checkIntentHexSignature({"0x902ead61"})
	reason = {"type": "permit", "policyId": "ee3cce51-0ffc-4259-bd12-2ef767e21ab6", "policyName": "cd19a84f-4b15-440f-a389-5f70420c43cd", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "492adb79-1b91-4206-a80d-e402857c0f34", "policyName": "c4f40208-9037-49a1-870e-7303ca1c0c14"}] = reason {
	checkResourceIntegrity
	checkPrincipalRole({"member"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkChainId({"137"})
	checkIntentHexSignature({"0x1521465b"})
	reason = {"type": "permit", "policyId": "492adb79-1b91-4206-a80d-e402857c0f34", "policyName": "c4f40208-9037-49a1-870e-7303ca1c0c14", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "b12a3001-589b-43a5-ae67-e1ad9d88a190", "policyName": "bc39284b-490a-43c4-bb5a-87862a1ee4a9"}] = reason {
	checkResourceIntegrity
	checkPrincipalRole({"admin"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkChainId({"137"})
	checkIntentHexSignature({"0xeae2ea7e"})
	reason = {"type": "permit", "policyId": "b12a3001-589b-43a5-ae67-e1ad9d88a190", "policyName": "bc39284b-490a-43c4-bb5a-87862a1ee4a9", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "83600b6b-b63e-4327-a57b-22db3839984a", "policyName": "32a8e7af-b58a-476e-908a-74bb561f61b1"}] = reason {
	checkResourceIntegrity
	checkPrincipalRole({"member"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
	checkChainId({"137"})
	checkIntentHexSignature({"0xe01c7002"})
	reason = {"type": "permit", "policyId": "83600b6b-b63e-4327-a57b-22db3839984a", "policyName": "32a8e7af-b58a-476e-908a-74bb561f61b1", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "ab181ade-0591-48fb-be3d-730631499c20", "policyName": "f7e4631d-e5ae-435f-a00c-23448909e7db"}] = reason {
	checkResourceIntegrity
	checkPrincipalRole({"admin"})
	checkAction({"signTransaction"})
	checkIntentType({"transferErc721", "transferErc1155"})
	reason = {"type": "permit", "policyId": "ab181ade-0591-48fb-be3d-730631499c20", "policyName": "f7e4631d-e5ae-435f-a00c-23448909e7db", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "ba345f91-dcc7-41f9-a7a5-c056cfffbde9", "policyName": "7af674ef-428e-4e13-9d79-4a38ff4c0eb2"}] = reason {
	checkResourceIntegrity
	checkPrincipalRole({"admin"})
	checkAction({"signTransaction"})
	checkIntentType({"transferErc721", "transferErc1155"})
	reason = {"type": "permit", "policyId": "ba345f91-dcc7-41f9-a7a5-c056cfffbde9", "policyName": "7af674ef-428e-4e13-9d79-4a38ff4c0eb2", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "94cda7e3-9723-4c38-bfbd-df0e553ae42d", "policyName": "fe3d3406-aa65-4a20-8c72-7a24b614151a"}] = reason {
	checkResourceIntegrity
	checkPrincipalRole({"admin"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
	checkChainId({"137"})
	checkIntentHexSignature({"0xe01c7002"})
	reason = {"type": "permit", "policyId": "94cda7e3-9723-4c38-bfbd-df0e553ae42d", "policyName": "fe3d3406-aa65-4a20-8c72-7a24b614151a", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "0987dbc0-337b-4dda-a5b8-3b694086f0b4", "policyName": "f30d6697-2cda-4553-9e7d-66886110a882"}] = reason {
	checkResourceIntegrity
	checkPrincipalRole({"admin"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkChainId({"137"})
	checkIntentHexSignature({"0xdd7944f5"})
	reason = {"type": "permit", "policyId": "0987dbc0-337b-4dda-a5b8-3b694086f0b4", "policyName": "f30d6697-2cda-4553-9e7d-66886110a882", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "e51e93ed-ff94-4d48-b463-c12a67608cad", "policyName": "7fc04ac3-368f-42b1-b9f4-06761241567c"}] = reason {
	checkResourceIntegrity
	checkPrincipalRole({"member"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
	checkChainId({"137"})
	checkIntentHexSignature({"0x44c9b41f"})
	reason = {"type": "permit", "policyId": "e51e93ed-ff94-4d48-b463-c12a67608cad", "policyName": "7fc04ac3-368f-42b1-b9f4-06761241567c", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "bf76d251-bdef-40d2-9422-4c6a0f5f0942", "policyName": "8a30c2d3-ffe0-473c-a1b4-730754cb9430"}] = reason {
	checkResourceIntegrity
	checkPrincipalRole({"member"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0xa2a13ce1824f3916fc84c65e559391fc6674e6e8"})
	checkChainId({"137"})
	checkIntentHexSignature({"0x5757b38a"})
	reason = {"type": "permit", "policyId": "bf76d251-bdef-40d2-9422-4c6a0f5f0942", "policyName": "8a30c2d3-ffe0-473c-a1b4-730754cb9430", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "14ece305-ee34-4815-8f94-e52477502ef0", "policyName": "5d164652-f401-4ae3-acf1-048927eb7a88"}] = reason {
	checkResourceIntegrity
	checkPrincipalId({"13b8f90e-d929-49a9-8f8c-a40bfff0f09e"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x8f8e18dbebb8ca4fc2bc7e3425fcdfd5264e33e8"})
	checkWalletAddress({"0x7a0854f64ded80455208ad6939950d915b2a101e"})
	reason = {"type": "permit", "policyId": "14ece305-ee34-4815-8f94-e52477502ef0", "policyName": "5d164652-f401-4ae3-acf1-048927eb7a88", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "a5164a0e-72bc-41d1-8966-2138d6d63481", "policyName": "64a3a0e5-8d9c-4b3a-a82a-2271a3f6aacc"}] = reason {
	checkResourceIntegrity
	checkPrincipalRole({"member"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkChainId({"137"})
	checkIntentHexSignature({"0xdd7944f5"})
	reason = {"type": "permit", "policyId": "a5164a0e-72bc-41d1-8966-2138d6d63481", "policyName": "64a3a0e5-8d9c-4b3a-a82a-2271a3f6aacc", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "38f0ff20-fe8b-4994-a1e2-e49b49c96cb6", "policyName": "3ecd9a08-abee-4ab3-a15b-d0fbe348240f"}] = reason {
	checkResourceIntegrity
	checkPrincipalRole({"member"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
	checkChainId({"137"})
	checkIntentHexSignature({"0xef68253d"})
	reason = {"type": "permit", "policyId": "38f0ff20-fe8b-4994-a1e2-e49b49c96cb6", "policyName": "3ecd9a08-abee-4ab3-a15b-d0fbe348240f", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "04868b14-e1fa-4561-b7a2-66abfcd3a770", "policyName": "959057f2-ad2c-4d45-a0ec-0c2da6f627c5"}] = reason {
	checkResourceIntegrity
	checkPrincipalRole({"member"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x4c60051384bd2d3c01bfc845cf5f4b44bcbe9de5"})
	checkChainId({"137"})
	checkIntentHexSignature({"0x3593564c"})
	reason = {"type": "permit", "policyId": "04868b14-e1fa-4561-b7a2-66abfcd3a770", "policyName": "959057f2-ad2c-4d45-a0ec-0c2da6f627c5", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "035331f7-2cee-4813-bc8e-fc573536ae7e", "policyName": "d1100363-5283-4a61-b905-dfc760815bff"}] = reason {
	checkResourceIntegrity
	checkPrincipalRole({"member"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
	checkChainId({"137"})
	checkIntentHexSignature({"0xd2df3a9e"})
	reason = {"type": "permit", "policyId": "035331f7-2cee-4813-bc8e-fc573536ae7e", "policyName": "d1100363-5283-4a61-b905-dfc760815bff", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "fcbf528b-7f35-4414-a581-5ed353928c89", "policyName": "8f409d35-aea5-45b2-bbf9-64569fed60ae"}] = reason {
	checkResourceIntegrity
	checkPrincipalRole({"admin"})
	checkAction({"signTransaction"})
	checkIntentType({"transferErc20", "transferNative"})
	reason = {"type": "permit", "policyId": "fcbf528b-7f35-4414-a581-5ed353928c89", "policyName": "8f409d35-aea5-45b2-bbf9-64569fed60ae", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "ae16ee91-99eb-43fc-8146-c713dda07947", "policyName": "20d630d0-5f68-47a8-8e8a-554ed8ab505a"}] = reason {
	checkResourceIntegrity
	checkPrincipalRole({"member"})
	checkAction({"signTransaction"})
	checkIntentType({"callContract"})
	checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
	checkChainId({"137"})
	checkIntentHexSignature({"0xdd86381e"})
	reason = {"type": "permit", "policyId": "ae16ee91-99eb-43fc-8146-c713dda07947", "policyName": "20d630d0-5f68-47a8-8e8a-554ed8ab505a", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "260bfe28-5420-4c90-b80d-146935d4ff27", "policyName": "ad2488cf-8ab6-41b0-bc9e-41ef61153fec"}] = reason {
	checkResourceIntegrity
	checkPrincipalRole({"member"})
	checkAction({"signMessage"})
	checkIntentDomain({"version": ["1"], "name": ["Crypto Unicorns Authentication"]})
	reason = {"type": "permit", "policyId": "260bfe28-5420-4c90-b80d-146935d4ff27", "policyName": "ad2488cf-8ab6-41b0-bc9e-41ef61153fec", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "15559de0-71b9-422f-8a17-90c28591944e", "policyName": "816207da-5679-43d9-90cb-0ae17d3e26df"}] = reason {
	checkResourceIntegrity
	checkPrincipalRole({"admin"})
	checkAction({"signMessage"})
	reason = {"type": "permit", "policyId": "15559de0-71b9-422f-8a17-90c28591944e", "policyName": "816207da-5679-43d9-90cb-0ae17d3e26df", "approvalsSatisfied": [], "approvalsMissing": []}
}

permit[{"policyId": "89a8f5e3-208a-4963-9670-ace3a6a78192", "policyName": "8d79f8c1-8c65-441b-9319-ff5c9803bc65"}] = reason {
	checkResourceIntegrity
	checkAction({"signTransaction"})
	checkIntentType({"transferErc20", "transferNative"})
	reason = {"type": "permit", "policyId": "89a8f5e3-208a-4963-9670-ace3a6a78192", "policyName": "8d79f8c1-8c65-441b-9319-ff5c9803bc65", "approvalsSatisfied": [], "approvalsMissing": []}
}
