package main

  permit[{"policyId": "59802031-5a9c-4a1c-adfb-21f0c71d0f94", "policyName": "c4cb0186-a0e8-48b8-bf05-8eaffc9efdcc" }] = reason {
    checkResourceIntegrity
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x28597ea60030fbae79088d89d803f25143c7a6b5"})
    checkChainId({"137"})
    checkIntentHexSignature({"0xc16fad97"})
  reason = {"type":"permit","policyId":"59802031-5a9c-4a1c-adfb-21f0c71d0f94","policyName":"c4cb0186-a0e8-48b8-bf05-8eaffc9efdcc","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "8661ae63-1c2c-4825-baff-ed522f120eaf", "policyName": "13fabcb5-e7d9-4e47-985e-9b048ebb7003" }] = reason {
    checkResourceIntegrity
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x28597ea60030fbae79088d89d803f25143c7a6b5"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x2b3f22b4"})
  reason = {"type":"permit","policyId":"8661ae63-1c2c-4825-baff-ed522f120eaf","policyName":"13fabcb5-e7d9-4e47-985e-9b048ebb7003","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "759c4059-7f3f-4a1b-85c0-c7ad9f58df7a", "policyName": "ec539dbc-e44f-4e5b-8fe5-6f61de0c4e7b" }] = reason {
    checkResourceIntegrity
    checkAction({"signTransaction"})
    checkIntentType({"approveTokenAllowance"})
    checkIntentToken({"eip155:137/erc20:0x431cd3c9ac9fc73644bf68bf5691f4b83f9e104f"})
    checkIntentSpender({"eip155:137:0x28597ea60030fbae79088d89d803f25143c7a6b5"})
    checkChainId({"137"})
  reason = {"type":"permit","policyId":"759c4059-7f3f-4a1b-85c0-c7ad9f58df7a","policyName":"ec539dbc-e44f-4e5b-8fe5-6f61de0c4e7b","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "9dcd9971-eedb-41ee-a743-2e24a2055c5e", "policyName": "e61592db-ec4a-435b-bce7-71b12ac57693" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signTransaction"})
    checkIntentType({"transferErc20", "transferNative"})
  reason = {"type":"permit","policyId":"9dcd9971-eedb-41ee-a743-2e24a2055c5e","policyName":"e61592db-ec4a-435b-bce7-71b12ac57693","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "d8318ad5-7211-45b8-8e3c-dab550944a6f", "policyName": "a68e8d20-0419-475c-8fcc-b17d4de8c955" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signTransaction"})
    checkIntentType({"transferErc721", "transferErc1155"})
  reason = {"type":"permit","policyId":"d8318ad5-7211-45b8-8e3c-dab550944a6f","policyName":"a68e8d20-0419-475c-8fcc-b17d4de8c955","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "33c4751c-a62b-4f84-970c-d2bab7bd0c8b", "policyName": "f42953dc-b6d9-4186-bdcc-1b834779f462" }] = reason {
    checkResourceIntegrity
    checkPrincipalId({"auth0|62e1d7ca04533b042cb42419"})
    checkAction({"signTransaction"})
    checkIntentType({"transferErc20"})
    checkIntentToken({"eip155:137:0x431cd3c9ac9fc73644bf68bf5691f4b83f9e104f"})
    checkChainId({"137"})
    checkWalletAddress({"0x0ff514df05c423a120152df9e04ba94fab7b3491"})
    checkIntentAmount({"currency":"*","operator":"lt","value":"2"})
  reason = {"type":"permit","policyId":"33c4751c-a62b-4f84-970c-d2bab7bd0c8b","policyName":"f42953dc-b6d9-4186-bdcc-1b834779f462","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "12cb2944-144b-4c42-b270-96df797d5215", "policyName": "417c3e87-9dc2-4ec8-9b8f-b5a421c90226" }] = reason {
    checkResourceIntegrity
    checkPrincipalId({"auth0|62e1d7ca04533b042cb42419"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
    checkChainId({"137"})
  reason = {"type":"permit","policyId":"12cb2944-144b-4c42-b270-96df797d5215","policyName":"417c3e87-9dc2-4ec8-9b8f-b5a421c90226","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "c72a6f5f-171b-48da-bb2e-ccc531a1a0c7", "policyName": "593000a9-05fd-4e2a-88b1-946115dfcdcf" }] = reason {
    checkResourceIntegrity
    checkPrincipalId({"auth0|62e1d7ca04533b042cb42419"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
    checkChainId({"137"})
  reason = {"type":"permit","policyId":"c72a6f5f-171b-48da-bb2e-ccc531a1a0c7","policyName":"593000a9-05fd-4e2a-88b1-946115dfcdcf","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "83f64823-7d57-4689-b427-60652282e42d", "policyName": "a4a6b1b0-638a-4535-b48b-32e99ce58d92" }] = reason {
    checkResourceIntegrity
    checkPrincipalId({"auth0|62e1d7ca04533b042cb42419"})
    checkDestinationAddress({"nftAssetTransfer"})
    checkAction({"signTransaction"})
    checkIntentType({"transferErc721"})
    checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
    checkChainId({"137"})
  reason = {"type":"permit","policyId":"83f64823-7d57-4689-b427-60652282e42d","policyName":"a4a6b1b0-638a-4535-b48b-32e99ce58d92","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "941c0df0-3043-4646-820c-b3250eb4459e", "policyName": "0a4a01d5-78ce-4cf8-9f97-bc5726e173df" }] = reason {
    checkResourceIntegrity
    checkPrincipalId({"auth0|64784e51867282eb243a9daa"})
    checkAction({"signMessage"})
    checkChainId({"137"})
    checkIntentDomain({"version":["1"],"name":["Crypto Unicorns Authentication"]})
  reason = {"type":"permit","policyId":"941c0df0-3043-4646-820c-b3250eb4459e","policyName":"0a4a01d5-78ce-4cf8-9f97-bc5726e173df","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "b039313e-b9f6-477a-a501-9f717f0d62b9", "policyName": "fd02d4da-2c20-49bb-a904-57c5a81bc0e5" }] = reason {
    checkResourceIntegrity
    checkAction({"signTransaction"})
    checkIntentType({"approveTokenAllowance"})
    checkIntentToken({"eip155:137/erc20:0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad"})
    checkChainId({"137"})
  reason = {"type":"permit","policyId":"b039313e-b9f6-477a-a501-9f717f0d62b9","policyName":"fd02d4da-2c20-49bb-a904-57c5a81bc0e5","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "f72a86ba-e0f8-491a-b7dd-5a7a2bb2ff28", "policyName": "dd0c5566-8e45-4ada-9811-73eac1886b68" }] = reason {
    checkResourceIntegrity
    checkAction({"signTransaction"})
    checkIntentType({"approveTokenAllowance"})
    checkIntentToken({"eip155:137/erc20:0x64060ab139feaae7f06ca4e63189d86adeb51691"})
    checkChainId({"137"})
  reason = {"type":"permit","policyId":"f72a86ba-e0f8-491a-b7dd-5a7a2bb2ff28","policyName":"dd0c5566-8e45-4ada-9811-73eac1886b68","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "6c49ffcb-4057-4286-bbbe-fd88f0415ab2", "policyName": "c3d6e2a3-8812-44f2-89cb-d13a63b649fa" }] = reason {
    checkResourceIntegrity
    checkPrincipalId({"auth0|64784e51867282eb243a9daa"})
    checkDestinationAddress({"nftAssetTransfer"})
    checkAction({"signTransaction"})
    checkIntentType({"transferErc721"})
    checkIntentContract({"eip155:137:0xa2a13ce1824f3916fc84c65e559391fc6674e6e8"})
    checkChainId({"137"})
  reason = {"type":"permit","policyId":"6c49ffcb-4057-4286-bbbe-fd88f0415ab2","policyName":"c3d6e2a3-8812-44f2-89cb-d13a63b649fa","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "ccbde514-b635-4520-a8d0-c7b134c5ba25", "policyName": "cbadfea4-164f-4c3b-88d9-5a20e6c09248" }] = reason {
    checkResourceIntegrity
    checkPrincipalId({"auth0|64784e51867282eb243a9daa"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x5c3e876cb6e531a3a35cc985ab53e8f3869530b5"})
    checkChainId({"137"})
  reason = {"type":"permit","policyId":"ccbde514-b635-4520-a8d0-c7b134c5ba25","policyName":"cbadfea4-164f-4c3b-88d9-5a20e6c09248","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "4b7858ed-5494-4328-8191-923d0b33b833", "policyName": "8a550f70-cc98-4b2d-a3ae-2a624ae3c56b" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x5c3e876cb6e531a3a35cc985ab53e8f3869530b5"})
    checkChainId({"137"})
  reason = {"type":"permit","policyId":"4b7858ed-5494-4328-8191-923d0b33b833","policyName":"8a550f70-cc98-4b2d-a3ae-2a624ae3c56b","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "74972a6a-3182-47f3-9756-14f9c626d684", "policyName": "c715fcf4-7e9f-45ef-8615-770b0597fddf" }] = reason {
    checkResourceIntegrity
    checkPrincipalId({"auth0|62e1d7ca04533b042cb42419"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x5c3e876cb6e531a3a35cc985ab53e8f3869530b5"})
    checkChainId({"137"})
  reason = {"type":"permit","policyId":"74972a6a-3182-47f3-9756-14f9c626d684","policyName":"c715fcf4-7e9f-45ef-8615-770b0597fddf","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "eba17047-b974-4831-b2db-488f57df7a88", "policyName": "3d597a7c-cebc-4cb0-8c82-a31fda95e5e7" }] = reason {
    checkResourceIntegrity
    checkPrincipalId({"auth0|62e1d7ca04533b042cb42419"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0xa2a13ce1824f3916fc84c65e559391fc6674e6e8"})
    checkChainId({"137"})
  reason = {"type":"permit","policyId":"eba17047-b974-4831-b2db-488f57df7a88","policyName":"3d597a7c-cebc-4cb0-8c82-a31fda95e5e7","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "9e30d639-7870-4836-a1a9-6969afaaf19c", "policyName": "4655de9d-37be-4796-9c49-1e9344c39e21" }] = reason {
    checkResourceIntegrity
    checkPrincipalId({"auth0|62e1d7ca04533b042cb42419"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0xa2a13ce1824f3916fc84c65e559391fc6674e6e8"})
    checkChainId({"137"})
  reason = {"type":"permit","policyId":"9e30d639-7870-4836-a1a9-6969afaaf19c","policyName":"4655de9d-37be-4796-9c49-1e9344c39e21","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "71679ed7-b85d-44dc-8817-242ae0cce5fa", "policyName": "7ad914af-edc6-4170-b840-4988ff831ca9" }] = reason {
    checkResourceIntegrity
    checkPrincipalId({"auth0|62e1d7ca04533b042cb42419"})
    checkDestinationAddress({"nftAssetTransfer"})
    checkAction({"signTransaction"})
    checkIntentType({"transferErc721"})
    checkIntentContract({"eip155:137:0xa2a13ce1824f3916fc84c65e559391fc6674e6e8"})
    checkChainId({"137"})
  reason = {"type":"permit","policyId":"71679ed7-b85d-44dc-8817-242ae0cce5fa","policyName":"7ad914af-edc6-4170-b840-4988ff831ca9","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "751ec93b-59a6-4206-94da-5ef33ae5988d", "policyName": "18d771af-33a1-46c6-bd95-5008871eff60" }] = reason {
    checkResourceIntegrity
    checkPrincipalId({"auth0|62e1d7ca04533b042cb42419"})
    checkAction({"signMessage"})
  reason = {"type":"permit","policyId":"751ec93b-59a6-4206-94da-5ef33ae5988d","policyName":"18d771af-33a1-46c6-bd95-5008871eff60","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "582aa47f-d4bc-4257-bd7a-745ddc8f256c", "policyName": "7543edef-087e-4550-b6bb-dba3e3e6c710" }] = reason {
    checkResourceIntegrity
    checkPrincipalId({"debb4c0f-235c-497e-8009-7476b7494c26"})
    checkAction({"signTransaction"})
    checkIntentType({"transferErc721", "transferErc1155"})
  reason = {"type":"permit","policyId":"582aa47f-d4bc-4257-bd7a-745ddc8f256c","policyName":"7543edef-087e-4550-b6bb-dba3e3e6c710","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "370381a2-b557-4ab9-91fc-82ff4267825c", "policyName": "9e2b8d76-69cb-4cc2-815f-499b054686c9" }] = reason {
    checkResourceIntegrity
    checkPrincipalId({"auth0|62e1d7ca04533b042cb42419"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x5c3e876cb6e531a3a35cc985ab53e8f3869530b5"})
    checkChainId({"137"})
  reason = {"type":"permit","policyId":"370381a2-b557-4ab9-91fc-82ff4267825c","policyName":"9e2b8d76-69cb-4cc2-815f-499b054686c9","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "6a2c0928-22d7-47c3-aac2-d2c189d41bf3", "policyName": "c77b1a6c-f86a-4910-96a7-11809199dcdc" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x9dafc880"})
  reason = {"type":"permit","policyId":"6a2c0928-22d7-47c3-aac2-d2c189d41bf3","policyName":"c77b1a6c-f86a-4910-96a7-11809199dcdc","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "c00daec6-f112-4d80-b410-b9a8d3415f3a", "policyName": "d1d59f96-cf8f-463e-9018-9dbd4fa2113d" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"member"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x9dafc880"})
  reason = {"type":"permit","policyId":"c00daec6-f112-4d80-b410-b9a8d3415f3a","policyName":"d1d59f96-cf8f-463e-9018-9dbd4fa2113d","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "8023bd86-624f-419a-bcb3-af734cea6026", "policyName": "9383acd7-591c-419a-8730-2068f0a908a9" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x4b4a0bdf"})
  reason = {"type":"permit","policyId":"8023bd86-624f-419a-bcb3-af734cea6026","policyName":"9383acd7-591c-419a-8730-2068f0a908a9","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "ad6def36-77bc-46d0-8cee-712c20258ca4", "policyName": "13bd8904-2209-4717-a77d-511932f04391" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0xa3105f63"})
  reason = {"type":"permit","policyId":"ad6def36-77bc-46d0-8cee-712c20258ca4","policyName":"13bd8904-2209-4717-a77d-511932f04391","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "7a77eea4-0778-470b-b93c-cfe6393d691a", "policyName": "50c7acef-8279-4fcd-a539-94c93a243d68" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"member"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x5e351737"})
  reason = {"type":"permit","policyId":"7a77eea4-0778-470b-b93c-cfe6393d691a","policyName":"50c7acef-8279-4fcd-a539-94c93a243d68","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "b7a31061-8422-405a-a58c-15b930dfe6f4", "policyName": "3dd3670e-e166-4185-b18e-90f4afd07cbe" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x5e351737"})
  reason = {"type":"permit","policyId":"b7a31061-8422-405a-a58c-15b930dfe6f4","policyName":"3dd3670e-e166-4185-b18e-90f4afd07cbe","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "a5caa38e-c266-4325-9501-84cc3921cdb6", "policyName": "8f166dfc-1c16-4fcf-b760-9df12c430e46" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"member"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x37e28cd7"})
  reason = {"type":"permit","policyId":"a5caa38e-c266-4325-9501-84cc3921cdb6","policyName":"8f166dfc-1c16-4fcf-b760-9df12c430e46","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "42e0902f-37e7-4fee-b89b-27728082d0e8", "policyName": "568d0fc4-ac9d-4cee-95f1-bac6863b9b38" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x65c38bb8"})
  reason = {"type":"permit","policyId":"42e0902f-37e7-4fee-b89b-27728082d0e8","policyName":"568d0fc4-ac9d-4cee-95f1-bac6863b9b38","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "352da86a-2997-45f8-87da-5fc6c4005add", "policyName": "38487fdd-3503-4967-ba2c-281ca974a5d3" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x37e28cd7"})
  reason = {"type":"permit","policyId":"352da86a-2997-45f8-87da-5fc6c4005add","policyName":"38487fdd-3503-4967-ba2c-281ca974a5d3","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "db504a7b-58ec-4410-aa41-faa58a021ed5", "policyName": "9dac2d74-54a4-415a-90ae-ed9786365b30" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"member"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0xa3105f63"})
  reason = {"type":"permit","policyId":"db504a7b-58ec-4410-aa41-faa58a021ed5","policyName":"9dac2d74-54a4-415a-90ae-ed9786365b30","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "6e2f6109-f3a4-431a-b5d2-5edcda6b1cbe", "policyName": "04051b89-0ba7-454a-bbc2-ea8a66e80ef1" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x77f57d50"})
  reason = {"type":"permit","policyId":"6e2f6109-f3a4-431a-b5d2-5edcda6b1cbe","policyName":"04051b89-0ba7-454a-bbc2-ea8a66e80ef1","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "66376fc7-c82e-4c3b-ad53-4e88b8642af7", "policyName": "cf85beee-91d9-4b16-a234-e9231c5b5589" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"member"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x4b4a0bdf"})
  reason = {"type":"permit","policyId":"66376fc7-c82e-4c3b-ad53-4e88b8642af7","policyName":"cf85beee-91d9-4b16-a234-e9231c5b5589","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "5831c3d9-a70e-455b-94ac-1f0daf9f9f66", "policyName": "3b1a5031-84c0-4eec-bfd3-1fab190a0ca3" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"member"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x77f57d50"})
  reason = {"type":"permit","policyId":"5831c3d9-a70e-455b-94ac-1f0daf9f9f66","policyName":"3b1a5031-84c0-4eec-bfd3-1fab190a0ca3","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "11b0a4ab-eeba-42b7-9d72-3dd5dc180fe5", "policyName": "55039c69-dfde-4a2a-8b25-48d273ed5bd9" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x27b8e40c"})
  reason = {"type":"permit","policyId":"11b0a4ab-eeba-42b7-9d72-3dd5dc180fe5","policyName":"55039c69-dfde-4a2a-8b25-48d273ed5bd9","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "e92c97b8-e3ab-451d-b1c0-922160a88ddf", "policyName": "f65db91c-e5e9-4f23-892f-9e97eed41fca" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"member"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x27b8e40c"})
  reason = {"type":"permit","policyId":"e92c97b8-e3ab-451d-b1c0-922160a88ddf","policyName":"f65db91c-e5e9-4f23-892f-9e97eed41fca","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "072377e9-d719-4629-a3f8-4f1d8b2d5521", "policyName": "2fa683d2-81d6-4c3f-a88d-9cadb2b5c21c" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"member"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x65c38bb8"})
  reason = {"type":"permit","policyId":"072377e9-d719-4629-a3f8-4f1d8b2d5521","policyName":"2fa683d2-81d6-4c3f-a88d-9cadb2b5c21c","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "4182eba8-f05c-4639-a7df-adf4b9836ec5", "policyName": "0d745699-8176-44db-bde9-55474fba6cc7" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"member"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x9dafc880"})
  reason = {"type":"permit","policyId":"4182eba8-f05c-4639-a7df-adf4b9836ec5","policyName":"0d745699-8176-44db-bde9-55474fba6cc7","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "95171650-f1c7-462d-a3ff-35238e05e2bc", "policyName": "e7cd1d07-c92b-404c-9ec7-a6a3b8c43790" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"member"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0xa3105f63"})
  reason = {"type":"permit","policyId":"95171650-f1c7-462d-a3ff-35238e05e2bc","policyName":"e7cd1d07-c92b-404c-9ec7-a6a3b8c43790","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "dc7303ea-d6fb-46a4-a262-cadd11fe16d7", "policyName": "f0932890-7756-46c2-9509-9260416e6172" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"member"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x5e351737"})
  reason = {"type":"permit","policyId":"dc7303ea-d6fb-46a4-a262-cadd11fe16d7","policyName":"f0932890-7756-46c2-9509-9260416e6172","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "a4674f3c-fd7f-4ab8-9f01-cbd0f5777c94", "policyName": "15c8a58c-c63d-4964-a200-1846c20b7c72" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x4b4a0bdf"})
  reason = {"type":"permit","policyId":"a4674f3c-fd7f-4ab8-9f01-cbd0f5777c94","policyName":"15c8a58c-c63d-4964-a200-1846c20b7c72","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "7f67a97a-43ba-402f-8e28-bc775e49bde9", "policyName": "3d166ee3-7ed5-4c81-a3f6-5576f474573f" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x9dafc880"})
  reason = {"type":"permit","policyId":"7f67a97a-43ba-402f-8e28-bc775e49bde9","policyName":"3d166ee3-7ed5-4c81-a3f6-5576f474573f","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "9c5136e1-7f7b-471e-836e-a9bf5e7254e9", "policyName": "59409ad3-aa95-4bd6-b78e-0c9bf2b85025" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"member"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x27b8e40c"})
  reason = {"type":"permit","policyId":"9c5136e1-7f7b-471e-836e-a9bf5e7254e9","policyName":"59409ad3-aa95-4bd6-b78e-0c9bf2b85025","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "d4e0c96f-c699-4c3c-9d34-55e19a102948", "policyName": "45019a29-b5ee-4d3a-bebb-918867ba411d" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0xa3105f63"})
  reason = {"type":"permit","policyId":"d4e0c96f-c699-4c3c-9d34-55e19a102948","policyName":"45019a29-b5ee-4d3a-bebb-918867ba411d","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "59c6ab02-26dc-4842-b679-6bd5c2f4e572", "policyName": "ad512d85-3827-42a1-9f92-2373ad9c48a0" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x77f57d50"})
  reason = {"type":"permit","policyId":"59c6ab02-26dc-4842-b679-6bd5c2f4e572","policyName":"ad512d85-3827-42a1-9f92-2373ad9c48a0","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "daf38446-4c07-43fe-a054-80b774bb6ae1", "policyName": "67ebdaeb-4f83-45c5-8cec-68832fc69ec5" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"member"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x4b4a0bdf"})
  reason = {"type":"permit","policyId":"daf38446-4c07-43fe-a054-80b774bb6ae1","policyName":"67ebdaeb-4f83-45c5-8cec-68832fc69ec5","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "e52720d8-27b5-4f19-8eeb-36f132e8798b", "policyName": "18133452-fb49-4cbb-ab98-4277f72153bd" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x37e28cd7"})
  reason = {"type":"permit","policyId":"e52720d8-27b5-4f19-8eeb-36f132e8798b","policyName":"18133452-fb49-4cbb-ab98-4277f72153bd","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "aa777052-17ec-4f99-9b6b-9aff6108c6f4", "policyName": "8e489a05-1ad5-4327-b316-70c8da8dc8f3" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"member"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x37e28cd7"})
  reason = {"type":"permit","policyId":"aa777052-17ec-4f99-9b6b-9aff6108c6f4","policyName":"8e489a05-1ad5-4327-b316-70c8da8dc8f3","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "a4e67cf4-5b4d-4253-8820-8d49f04edce5", "policyName": "4acb88b3-775d-44a7-a18a-45644d4967a0" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"member"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x65c38bb8"})
  reason = {"type":"permit","policyId":"a4e67cf4-5b4d-4253-8820-8d49f04edce5","policyName":"4acb88b3-775d-44a7-a18a-45644d4967a0","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "10cdd3ac-1561-47cf-85ec-f338f9212d68", "policyName": "06122f43-d9ff-49c1-925e-e812fd39c6aa" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"member"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x77f57d50"})
  reason = {"type":"permit","policyId":"10cdd3ac-1561-47cf-85ec-f338f9212d68","policyName":"06122f43-d9ff-49c1-925e-e812fd39c6aa","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "fd503b1e-e763-4574-92c1-9e18278cf6eb", "policyName": "bef5ea3c-8e2b-42f3-846e-79383dcfe5e0" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x5e351737"})
  reason = {"type":"permit","policyId":"fd503b1e-e763-4574-92c1-9e18278cf6eb","policyName":"bef5ea3c-8e2b-42f3-846e-79383dcfe5e0","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "8a2d20a7-ef55-4de1-b805-f0d64220d303", "policyName": "325bfba9-7c23-4b87-a676-fe61fb9b1826" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x65c38bb8"})
  reason = {"type":"permit","policyId":"8a2d20a7-ef55-4de1-b805-f0d64220d303","policyName":"325bfba9-7c23-4b87-a676-fe61fb9b1826","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "3f4924ed-85f1-4b50-84d6-fc890621d94f", "policyName": "1deb18cf-75cb-4cc0-850d-e73aa5c89c47" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x27b8e40c"})
  reason = {"type":"permit","policyId":"3f4924ed-85f1-4b50-84d6-fc890621d94f","policyName":"1deb18cf-75cb-4cc0-850d-e73aa5c89c47","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "8aaf64cc-d270-4b14-8619-841e407eb45b", "policyName": "4280497c-ba28-4e77-b36d-8c54ef4eeac2" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"member"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x37e28cd7"})
  reason = {"type":"permit","policyId":"8aaf64cc-d270-4b14-8619-841e407eb45b","policyName":"4280497c-ba28-4e77-b36d-8c54ef4eeac2","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "8b8c7599-4577-4426-8497-4d0f26174758", "policyName": "7d4df6cc-ea13-49b7-940c-5130c0ed0992" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"member"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0xa3105f63"})
  reason = {"type":"permit","policyId":"8b8c7599-4577-4426-8497-4d0f26174758","policyName":"7d4df6cc-ea13-49b7-940c-5130c0ed0992","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "f0293385-3e75-46b3-ab9f-0abfe8e21a80", "policyName": "a386c957-0ef6-45a6-859a-3f07e490782d" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"member"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x9dafc880"})
  reason = {"type":"permit","policyId":"f0293385-3e75-46b3-ab9f-0abfe8e21a80","policyName":"a386c957-0ef6-45a6-859a-3f07e490782d","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "c66c969c-62e9-4c6d-ad2b-154bd70abfca", "policyName": "0ff36d61-d11d-4ce9-a225-dabfa8a61dcf" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x9dafc880"})
  reason = {"type":"permit","policyId":"c66c969c-62e9-4c6d-ad2b-154bd70abfca","policyName":"0ff36d61-d11d-4ce9-a225-dabfa8a61dcf","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "9f49cc69-60f0-47a2-a139-84d779559c83", "policyName": "ef73b23d-168a-4e1c-9e0b-eb54058b925d" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0xa3105f63"})
  reason = {"type":"permit","policyId":"9f49cc69-60f0-47a2-a139-84d779559c83","policyName":"ef73b23d-168a-4e1c-9e0b-eb54058b925d","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "d066e716-7b7a-497d-bcc0-9529aa0b9f01", "policyName": "2109d39d-6e3f-47bf-a6e6-0079128a77d8" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x65c38bb8"})
  reason = {"type":"permit","policyId":"d066e716-7b7a-497d-bcc0-9529aa0b9f01","policyName":"2109d39d-6e3f-47bf-a6e6-0079128a77d8","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "ae0b5e62-3389-4c6d-b22a-7b979fe10e72", "policyName": "d9b9257d-d335-450f-8e6c-cc910344563f" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"member"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x27b8e40c"})
  reason = {"type":"permit","policyId":"ae0b5e62-3389-4c6d-b22a-7b979fe10e72","policyName":"d9b9257d-d335-450f-8e6c-cc910344563f","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "2ebe5fe3-1e48-42a6-97b2-2f3fa065d403", "policyName": "6d560223-1c9a-433e-bb63-4fbfe9c2c2e9" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"member"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x77f57d50"})
  reason = {"type":"permit","policyId":"2ebe5fe3-1e48-42a6-97b2-2f3fa065d403","policyName":"6d560223-1c9a-433e-bb63-4fbfe9c2c2e9","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "73000dc1-6b15-490b-978d-45b0702131a3", "policyName": "c69202e1-b2e1-4cdc-9c0d-57870ec9e226" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"member"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x65c38bb8"})
  reason = {"type":"permit","policyId":"73000dc1-6b15-490b-978d-45b0702131a3","policyName":"c69202e1-b2e1-4cdc-9c0d-57870ec9e226","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "460890da-adae-41d5-a2dd-37e8c5a650b6", "policyName": "83a25c78-f344-49bc-81d3-0beac44ab84e" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"member"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x5e351737"})
  reason = {"type":"permit","policyId":"460890da-adae-41d5-a2dd-37e8c5a650b6","policyName":"83a25c78-f344-49bc-81d3-0beac44ab84e","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "1c0fa073-6cf6-4845-8d39-5b9daaca689b", "policyName": "8d0f728c-7214-43d5-ab4a-338c499d2eda" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x37e28cd7"})
  reason = {"type":"permit","policyId":"1c0fa073-6cf6-4845-8d39-5b9daaca689b","policyName":"8d0f728c-7214-43d5-ab4a-338c499d2eda","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "168bd022-f114-4fd1-a11b-8beef455dfcb", "policyName": "6eaaba91-2e24-4ce2-b201-90cda846c776" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x4b4a0bdf"})
  reason = {"type":"permit","policyId":"168bd022-f114-4fd1-a11b-8beef455dfcb","policyName":"6eaaba91-2e24-4ce2-b201-90cda846c776","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "621e1ebb-e7c5-4d26-88cd-deab5363e810", "policyName": "e207ff6e-51a7-419c-b6bc-5f89d155e907" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x77f57d50"})
  reason = {"type":"permit","policyId":"621e1ebb-e7c5-4d26-88cd-deab5363e810","policyName":"e207ff6e-51a7-419c-b6bc-5f89d155e907","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "66d46c46-2be8-46e5-b6d3-17eb47463d65", "policyName": "65970262-79ec-484d-a744-bd81dace3d15" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x27b8e40c"})
  reason = {"type":"permit","policyId":"66d46c46-2be8-46e5-b6d3-17eb47463d65","policyName":"65970262-79ec-484d-a744-bd81dace3d15","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "f0414a2f-e4e2-474d-a06d-8845212337c8", "policyName": "8b8a4584-39e2-4b89-b471-eb6b262dfae9" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x5e351737"})
  reason = {"type":"permit","policyId":"f0414a2f-e4e2-474d-a06d-8845212337c8","policyName":"8b8a4584-39e2-4b89-b471-eb6b262dfae9","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "d2158ed1-25c6-44a7-bc72-2b8c29021c06", "policyName": "e8069224-68c3-4073-9249-afe0f6544631" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"member"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x4b4a0bdf"})
  reason = {"type":"permit","policyId":"d2158ed1-25c6-44a7-bc72-2b8c29021c06","policyName":"e8069224-68c3-4073-9249-afe0f6544631","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "49084b4c-e474-49f6-a3ab-b980991d51fd", "policyName": "552fff6a-af3f-4a24-8b9a-4b77db6fc971" }] = reason {
    checkResourceIntegrity
    checkPrincipalId({"13b8f90e-d929-49a9-8f8c-a40bfff0f09e"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x4c60051384bd2d3c01bfc845cf5f4b44bcbe9de5"})
    checkChainId({"137"})
  reason = {"type":"permit","policyId":"49084b4c-e474-49f6-a3ab-b980991d51fd","policyName":"552fff6a-af3f-4a24-8b9a-4b77db6fc971","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "223d4848-4657-4f91-bd66-92093a2326b5", "policyName": "afef70ed-9e23-4f79-a95c-a0616c01b5d1" }] = reason {
    checkResourceIntegrity
    checkPrincipalId({"debb4c0f-235c-497e-8009-7476b7494c26"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkWalletAddress({"0xa1d6e9a37b3fb99b226f64741627af6f4ae219e1"})
  reason = {"type":"permit","policyId":"223d4848-4657-4f91-bd66-92093a2326b5","policyName":"afef70ed-9e23-4f79-a95c-a0616c01b5d1","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "cc79d218-af79-4c5b-9e9a-1deae49d79cf", "policyName": "6a898c76-584f-4616-8246-c5d31afc07c9" }] = reason {
    checkResourceIntegrity
    checkPrincipalId({"13b8f90e-d929-49a9-8f8c-a40bfff0f09e"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x4c60051384bd2d3c01bfc845cf5f4b44bcbe9de5"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x24856bc3"})
  reason = {"type":"permit","policyId":"cc79d218-af79-4c5b-9e9a-1deae49d79cf","policyName":"6a898c76-584f-4616-8246-c5d31afc07c9","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "d02eabfd-3cf1-469a-b554-466f44c187ba", "policyName": "48d24de0-3d05-46ce-81cf-3f81e8022283" }] = reason {
    checkResourceIntegrity
    checkPrincipalId({"13b8f90e-d929-49a9-8f8c-a40bfff0f09e"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x4c60051384bd2d3c01bfc845cf5f4b44bcbe9de5"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x24856bc3"})
  reason = {"type":"permit","policyId":"d02eabfd-3cf1-469a-b554-466f44c187ba","policyName":"48d24de0-3d05-46ce-81cf-3f81e8022283","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "83f21502-464f-4cae-82be-75e6fcfbb9e5", "policyName": "a86e9f14-4018-43cc-b15a-fc1e42ec4406" }] = reason {
    checkResourceIntegrity
    checkPrincipalId({"13b8f90e-d929-49a9-8f8c-a40bfff0f09e"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x4c60051384bd2d3c01bfc845cf5f4b44bcbe9de5"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x24856bc3"})
  reason = {"type":"permit","policyId":"83f21502-464f-4cae-82be-75e6fcfbb9e5","policyName":"a86e9f14-4018-43cc-b15a-fc1e42ec4406","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "c977bd49-c68a-4a0a-a643-3d9728b86939", "policyName": "68627533-b4de-4c60-9bff-8419678638a5" }] = reason {
    checkResourceIntegrity
    checkPrincipalId({"13b8f90e-d929-49a9-8f8c-a40bfff0f09e"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x4c60051384bd2d3c01bfc845cf5f4b44bcbe9de5"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x24856bc3"})
  reason = {"type":"permit","policyId":"c977bd49-c68a-4a0a-a643-3d9728b86939","policyName":"68627533-b4de-4c60-9bff-8419678638a5","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "607c19cf-aacd-407a-81b4-c14eb81eb260", "policyName": "8ddd52ba-fe72-488a-8c0a-49215cca56fd" }] = reason {
    checkResourceIntegrity
    checkPrincipalId({"auth0|62e3998004533b042cb44ccf"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
    checkChainId({"137"})
  reason = {"type":"permit","policyId":"607c19cf-aacd-407a-81b4-c14eb81eb260","policyName":"8ddd52ba-fe72-488a-8c0a-49215cca56fd","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "823b7c65-0d55-4fff-bda9-bf2eae09fc1c", "policyName": "94890c04-d3d2-4614-82cd-1709abd96c0f" }] = reason {
    checkResourceIntegrity
    checkPrincipalId({"auth0|62e3998004533b042cb44ccf"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
    checkChainId({"137"})
  reason = {"type":"permit","policyId":"823b7c65-0d55-4fff-bda9-bf2eae09fc1c","policyName":"94890c04-d3d2-4614-82cd-1709abd96c0f","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  forbid[{"policyId": "1a990114-a81d-4e85-a1c6-fb931ad73987", "policyName": "746bbc21-c869-4d2e-8236-dda489274610" }] = reason {
    checkResourceIntegrity
    checkPrincipalId({"auth0|62e1d7ca04533b042cb42419"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
    checkChainId({"137"})
  reason = {"type":"forbid","policyId":"1a990114-a81d-4e85-a1c6-fb931ad73987","policyName":"746bbc21-c869-4d2e-8236-dda489274610","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "54d5fc22-7e35-429c-8087-662c6cbd0227", "policyName": "7bf29225-1825-4bd6-8b8a-ef2c0a40707a" }] = reason {
    checkResourceIntegrity
    checkPrincipalId({"615f46d7-7039-43a3-a904-6daccaf72e61"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0xfbe3ab0cbfbd17d06bdd73aa3f55aaf038720f59"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x23b872dd"})
  reason = {"type":"permit","policyId":"54d5fc22-7e35-429c-8087-662c6cbd0227","policyName":"7bf29225-1825-4bd6-8b8a-ef2c0a40707a","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "59ec82ff-ac9d-45ac-a50c-9a4b2da4f284", "policyName": "dda465a6-8dc1-4142-9d00-ec6313955f01" }] = reason {
    checkResourceIntegrity
    checkPrincipalId({"auth0|62e3998004533b042cb44ccf"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x42842e0e"})
  reason = {"type":"permit","policyId":"59ec82ff-ac9d-45ac-a50c-9a4b2da4f284","policyName":"dda465a6-8dc1-4142-9d00-ec6313955f01","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "5657a599-667e-48db-89c8-b49a502f2c24", "policyName": "d1f6e863-ae60-409d-870f-3faf7032d616" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x65b4613f"})
  reason = {"type":"permit","policyId":"5657a599-667e-48db-89c8-b49a502f2c24","policyName":"d1f6e863-ae60-409d-870f-3faf7032d616","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "b5318f66-8fd4-46e2-9535-ff107ecb1bea", "policyName": "39550a81-1c30-48f3-a590-6cbb6ddd375d" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
    checkChainId({"137"})
    checkIntentHexSignature({"0xef68253d"})
  reason = {"type":"permit","policyId":"b5318f66-8fd4-46e2-9535-ff107ecb1bea","policyName":"39550a81-1c30-48f3-a590-6cbb6ddd375d","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "36248a1f-9479-4e70-a48a-186b06403dad", "policyName": "9d37e0ab-8b25-48d3-b0ba-766f15a12626" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x93551267"})
  reason = {"type":"permit","policyId":"36248a1f-9479-4e70-a48a-186b06403dad","policyName":"9d37e0ab-8b25-48d3-b0ba-766f15a12626","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "1df4afa2-e994-4cc2-a7af-ca185a95d724", "policyName": "03959b54-5fdb-4c2c-b10e-996e07b7b1d4" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"member"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x93551267"})
  reason = {"type":"permit","policyId":"1df4afa2-e994-4cc2-a7af-ca185a95d724","policyName":"03959b54-5fdb-4c2c-b10e-996e07b7b1d4","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "fd418afd-3192-49fc-a93a-b39c5ffddfa1", "policyName": "67151495-b1a6-4632-8dff-a84277205daa" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0xa2a13ce1824f3916fc84c65e559391fc6674e6e8"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x93e39539"})
  reason = {"type":"permit","policyId":"fd418afd-3192-49fc-a93a-b39c5ffddfa1","policyName":"67151495-b1a6-4632-8dff-a84277205daa","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "978188e6-335f-4b14-b898-cea51d433f42", "policyName": "e9918e0e-7621-4d95-afa3-deeaed768409" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"member"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x65b4613f"})
  reason = {"type":"permit","policyId":"978188e6-335f-4b14-b898-cea51d433f42","policyName":"e9918e0e-7621-4d95-afa3-deeaed768409","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "f8442c92-c275-440a-9706-7055538b1ec1", "policyName": "6c11f2c3-c9dc-4a67-afbb-14d2418b9233" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x44c9b41f"})
  reason = {"type":"permit","policyId":"f8442c92-c275-440a-9706-7055538b1ec1","policyName":"6c11f2c3-c9dc-4a67-afbb-14d2418b9233","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "a8ed9aaa-7392-4502-b687-3ca80e75d720", "policyName": "c71e98e1-f4ef-4682-b628-79d03473fbdc" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x86c68622"})
  reason = {"type":"permit","policyId":"a8ed9aaa-7392-4502-b687-3ca80e75d720","policyName":"c71e98e1-f4ef-4682-b628-79d03473fbdc","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "563be2dd-1ca7-4d76-9679-23eff0898ae9", "policyName": "c0469d8c-1120-4985-8aa9-2df7a66885ea" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"member"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0xa2a13ce1824f3916fc84c65e559391fc6674e6e8"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x93e39539"})
  reason = {"type":"permit","policyId":"563be2dd-1ca7-4d76-9679-23eff0898ae9","policyName":"c0469d8c-1120-4985-8aa9-2df7a66885ea","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "61a7d4eb-0d90-4803-9fe4-10d9dc34dd93", "policyName": "f473c356-a95b-496a-83ad-a67e07f67e59" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"member"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x902ead61"})
  reason = {"type":"permit","policyId":"61a7d4eb-0d90-4803-9fe4-10d9dc34dd93","policyName":"f473c356-a95b-496a-83ad-a67e07f67e59","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "c77a9031-b65b-4c82-9701-05fe42065826", "policyName": "fe3167f2-c5c4-4ed1-9217-cfa02e858515" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x6bc613a25afe159b70610b64783ca51c9258b92e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x6548b7ae"})
  reason = {"type":"permit","policyId":"c77a9031-b65b-4c82-9701-05fe42065826","policyName":"fe3167f2-c5c4-4ed1-9217-cfa02e858515","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "d90e6f0d-1020-4e56-b0d3-60c231127cf6", "policyName": "a018b301-3234-434b-83df-8547c14e926b" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"member"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x86c68622"})
  reason = {"type":"permit","policyId":"d90e6f0d-1020-4e56-b0d3-60c231127cf6","policyName":"a018b301-3234-434b-83df-8547c14e926b","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "a8a1e9ff-e86f-4976-8e7d-ae51f747f9ef", "policyName": "8b357452-f7aa-4585-a798-720ac5a64e59" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"member"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x5d878596"})
  reason = {"type":"permit","policyId":"a8a1e9ff-e86f-4976-8e7d-ae51f747f9ef","policyName":"8b357452-f7aa-4585-a798-720ac5a64e59","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "5913a17e-fbc3-442c-aec7-572c2759bcb1", "policyName": "5f1644df-8377-4691-91b0-fe6aa00d621f" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0xdd86381e"})
  reason = {"type":"permit","policyId":"5913a17e-fbc3-442c-aec7-572c2759bcb1","policyName":"5f1644df-8377-4691-91b0-fe6aa00d621f","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "a7433a49-45e1-4d1e-8297-a2b15becbbae", "policyName": "247157a4-1b64-4e75-8321-b98e38b0389e" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x51782474"})
  reason = {"type":"permit","policyId":"a7433a49-45e1-4d1e-8297-a2b15becbbae","policyName":"247157a4-1b64-4e75-8321-b98e38b0389e","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "597a54d6-60a6-4e48-a4d6-9351fd3ab068", "policyName": "eabd89d2-194d-42cd-81c2-edef36b76caa" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"member"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0xeae2ea7e"})
  reason = {"type":"permit","policyId":"597a54d6-60a6-4e48-a4d6-9351fd3ab068","policyName":"eabd89d2-194d-42cd-81c2-edef36b76caa","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "bffb11b4-394c-414c-a31e-c6d403952924", "policyName": "99e86b13-641e-47ca-8936-a95d3a6f437b" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
    checkChainId({"137"})
    checkIntentHexSignature({"0xd2df3a9e"})
  reason = {"type":"permit","policyId":"bffb11b4-394c-414c-a31e-c6d403952924","policyName":"99e86b13-641e-47ca-8936-a95d3a6f437b","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "5a0e34d0-6ec8-48fe-9610-9cea78dc1542", "policyName": "964091bf-3bba-4699-b3e1-d3eb46ca6d8c" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"member"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
    checkChainId({"137"})
    checkIntentHexSignature({"0xd4db00cc"})
  reason = {"type":"permit","policyId":"5a0e34d0-6ec8-48fe-9610-9cea78dc1542","policyName":"964091bf-3bba-4699-b3e1-d3eb46ca6d8c","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "13e3144b-d8f0-4f9f-8fba-4c6c6fde366f", "policyName": "c5510e0e-7a09-4db9-9690-019dad364989" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"member"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x6bc613a25afe159b70610b64783ca51c9258b92e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x6548b7ae"})
  reason = {"type":"permit","policyId":"13e3144b-d8f0-4f9f-8fba-4c6c6fde366f","policyName":"c5510e0e-7a09-4db9-9690-019dad364989","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "59c245b3-8761-4fc9-842a-06e981f08003", "policyName": "acf62623-e4f0-414a-99f8-2e30552d2976" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
    checkChainId({"137"})
    checkIntentHexSignature({"0xd4db00cc"})
  reason = {"type":"permit","policyId":"59c245b3-8761-4fc9-842a-06e981f08003","policyName":"acf62623-e4f0-414a-99f8-2e30552d2976","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "cf4e0cb3-ec2a-4d16-a311-6005ed71200b", "policyName": "110502e9-ac0c-423f-9a8f-6376e2ffed88" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"member"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x51782474"})
  reason = {"type":"permit","policyId":"cf4e0cb3-ec2a-4d16-a311-6005ed71200b","policyName":"110502e9-ac0c-423f-9a8f-6376e2ffed88","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "e9d96df5-42d8-4b00-9c2a-527db3c82151", "policyName": "bc3fae98-2e50-4ff0-9c82-cd77cc6ee143" }] = reason {
    checkResourceIntegrity
    checkPrincipalId({"13b8f90e-d929-49a9-8f8c-a40bfff0f09e"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x3df16fb8dc28f63565af2815e04a3368360ffd23"})
    checkChainId({"137"})
    checkWalletAddress({"0x7a0854f64ded80455208ad6939950d915b2a101e"})
  reason = {"type":"permit","policyId":"e9d96df5-42d8-4b00-9c2a-527db3c82151","policyName":"bc3fae98-2e50-4ff0-9c82-cd77cc6ee143","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "eb4ecb18-5d15-4e30-96b3-2c31a5d11221", "policyName": "44b5d3e8-5e02-428f-b057-61dd6293e374" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"member"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x9edcab23"})
  reason = {"type":"permit","policyId":"eb4ecb18-5d15-4e30-96b3-2c31a5d11221","policyName":"44b5d3e8-5e02-428f-b057-61dd6293e374","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "2e965df4-28ec-4736-9df5-2e53fbb00c36", "policyName": "a8ed180c-6607-4d6d-bce5-7be3a671dd2d" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x9edcab23"})
  reason = {"type":"permit","policyId":"2e965df4-28ec-4736-9df5-2e53fbb00c36","policyName":"a8ed180c-6607-4d6d-bce5-7be3a671dd2d","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "3b38f911-2ae2-45be-b6af-f2a1d2c846e5", "policyName": "ae036a24-fa6c-463c-acfa-59914cf67a59" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0xd3ac2166"})
  reason = {"type":"permit","policyId":"3b38f911-2ae2-45be-b6af-f2a1d2c846e5","policyName":"ae036a24-fa6c-463c-acfa-59914cf67a59","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "0e3ca467-a9b1-4dd8-b383-8e9a0d2116c6", "policyName": "325ec9af-67dc-4a2a-9f90-1703406cf261" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"member"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0xd3ac2166"})
  reason = {"type":"permit","policyId":"0e3ca467-a9b1-4dd8-b383-8e9a0d2116c6","policyName":"325ec9af-67dc-4a2a-9f90-1703406cf261","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "21453c49-9167-4217-a9dd-6e735addb9d2", "policyName": "48412cc3-a596-4b04-aca4-b000f1e1335b" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x1521465b"})
  reason = {"type":"permit","policyId":"21453c49-9167-4217-a9dd-6e735addb9d2","policyName":"48412cc3-a596-4b04-aca4-b000f1e1335b","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "7613ad17-6d42-4526-b40b-071fd66a5c4f", "policyName": "cd19a84f-4b15-440f-a389-5f70420c43cd" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x902ead61"})
  reason = {"type":"permit","policyId":"7613ad17-6d42-4526-b40b-071fd66a5c4f","policyName":"cd19a84f-4b15-440f-a389-5f70420c43cd","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "5211ca1a-50dd-44d6-af33-c890e666b512", "policyName": "c4f40208-9037-49a1-870e-7303ca1c0c14" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"member"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x1521465b"})
  reason = {"type":"permit","policyId":"5211ca1a-50dd-44d6-af33-c890e666b512","policyName":"c4f40208-9037-49a1-870e-7303ca1c0c14","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "759528ee-2e6a-4058-a21e-b4a2d1a0193e", "policyName": "bc39284b-490a-43c4-bb5a-87862a1ee4a9" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0xeae2ea7e"})
  reason = {"type":"permit","policyId":"759528ee-2e6a-4058-a21e-b4a2d1a0193e","policyName":"bc39284b-490a-43c4-bb5a-87862a1ee4a9","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "cf43df6d-16f5-4444-940b-ff6db84bb83b", "policyName": "32a8e7af-b58a-476e-908a-74bb561f61b1" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"member"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
    checkChainId({"137"})
    checkIntentHexSignature({"0xe01c7002"})
  reason = {"type":"permit","policyId":"cf43df6d-16f5-4444-940b-ff6db84bb83b","policyName":"32a8e7af-b58a-476e-908a-74bb561f61b1","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "99e35133-6b9b-4a4b-b7b2-35f816050f8f", "policyName": "f7e4631d-e5ae-435f-a00c-23448909e7db" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signTransaction"})
    checkIntentType({"transferErc721", "transferErc1155"})
  reason = {"type":"permit","policyId":"99e35133-6b9b-4a4b-b7b2-35f816050f8f","policyName":"f7e4631d-e5ae-435f-a00c-23448909e7db","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "3ac7dffa-82df-47c9-8730-204d1e68d57f", "policyName": "7af674ef-428e-4e13-9d79-4a38ff4c0eb2" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signTransaction"})
    checkIntentType({"transferErc721", "transferErc1155"})
  reason = {"type":"permit","policyId":"3ac7dffa-82df-47c9-8730-204d1e68d57f","policyName":"7af674ef-428e-4e13-9d79-4a38ff4c0eb2","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "ad271fc5-12e3-4ddf-bdad-594ddbff292c", "policyName": "fe3d3406-aa65-4a20-8c72-7a24b614151a" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
    checkChainId({"137"})
    checkIntentHexSignature({"0xe01c7002"})
  reason = {"type":"permit","policyId":"ad271fc5-12e3-4ddf-bdad-594ddbff292c","policyName":"fe3d3406-aa65-4a20-8c72-7a24b614151a","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "737143a3-7684-405e-9459-d32309ae76fb", "policyName": "f30d6697-2cda-4553-9e7d-66886110a882" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0xdd7944f5"})
  reason = {"type":"permit","policyId":"737143a3-7684-405e-9459-d32309ae76fb","policyName":"f30d6697-2cda-4553-9e7d-66886110a882","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "3deb2add-f509-40df-8db8-0313d16da60d", "policyName": "7fc04ac3-368f-42b1-b9f4-06761241567c" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"member"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x44c9b41f"})
  reason = {"type":"permit","policyId":"3deb2add-f509-40df-8db8-0313d16da60d","policyName":"7fc04ac3-368f-42b1-b9f4-06761241567c","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "41778d6b-91f5-412e-bea7-c2784518af9a", "policyName": "8a30c2d3-ffe0-473c-a1b4-730754cb9430" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"member"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0xa2a13ce1824f3916fc84c65e559391fc6674e6e8"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x5757b38a"})
  reason = {"type":"permit","policyId":"41778d6b-91f5-412e-bea7-c2784518af9a","policyName":"8a30c2d3-ffe0-473c-a1b4-730754cb9430","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "42bdf301-12b6-4588-8983-41e263dd1050", "policyName": "5d164652-f401-4ae3-acf1-048927eb7a88" }] = reason {
    checkResourceIntegrity
    checkPrincipalId({"13b8f90e-d929-49a9-8f8c-a40bfff0f09e"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x8f8e18dbebb8ca4fc2bc7e3425fcdfd5264e33e8"})
    checkWalletAddress({"0x7a0854f64ded80455208ad6939950d915b2a101e"})
  reason = {"type":"permit","policyId":"42bdf301-12b6-4588-8983-41e263dd1050","policyName":"5d164652-f401-4ae3-acf1-048927eb7a88","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "100d481c-1679-4c47-a612-4291534f48d9", "policyName": "64a3a0e5-8d9c-4b3a-a82a-2271a3f6aacc" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"member"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0xdd7944f5"})
  reason = {"type":"permit","policyId":"100d481c-1679-4c47-a612-4291534f48d9","policyName":"64a3a0e5-8d9c-4b3a-a82a-2271a3f6aacc","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "8ed9ca86-64dc-4012-8e3d-f38501be9637", "policyName": "3ecd9a08-abee-4ab3-a15b-d0fbe348240f" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"member"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
    checkChainId({"137"})
    checkIntentHexSignature({"0xef68253d"})
  reason = {"type":"permit","policyId":"8ed9ca86-64dc-4012-8e3d-f38501be9637","policyName":"3ecd9a08-abee-4ab3-a15b-d0fbe348240f","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "ba93486e-841a-4a97-8a32-9dc54ac22a3e", "policyName": "959057f2-ad2c-4d45-a0ec-0c2da6f627c5" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"member"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x4c60051384bd2d3c01bfc845cf5f4b44bcbe9de5"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x3593564c"})
  reason = {"type":"permit","policyId":"ba93486e-841a-4a97-8a32-9dc54ac22a3e","policyName":"959057f2-ad2c-4d45-a0ec-0c2da6f627c5","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "87f6cabf-7a56-4c69-9c99-049e90e7aff7", "policyName": "d1100363-5283-4a61-b905-dfc760815bff" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"member"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
    checkChainId({"137"})
    checkIntentHexSignature({"0xd2df3a9e"})
  reason = {"type":"permit","policyId":"87f6cabf-7a56-4c69-9c99-049e90e7aff7","policyName":"d1100363-5283-4a61-b905-dfc760815bff","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "129c6d26-5ced-41e3-afdf-5c494ba5510e", "policyName": "8f409d35-aea5-45b2-bbf9-64569fed60ae" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signTransaction"})
    checkIntentType({"transferErc20", "transferNative"})
  reason = {"type":"permit","policyId":"129c6d26-5ced-41e3-afdf-5c494ba5510e","policyName":"8f409d35-aea5-45b2-bbf9-64569fed60ae","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "ec732208-dcba-48a7-a313-2bd1c0f60049", "policyName": "20d630d0-5f68-47a8-8e8a-554ed8ab505a" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"member"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0xdd86381e"})
  reason = {"type":"permit","policyId":"ec732208-dcba-48a7-a313-2bd1c0f60049","policyName":"20d630d0-5f68-47a8-8e8a-554ed8ab505a","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "13672127-f4e8-4f21-874d-cbdce3b00784", "policyName": "ad2488cf-8ab6-41b0-bc9e-41ef61153fec" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"member"})
    checkAction({"signMessage"})
    checkIntentDomain({"version":["1"],"name":["Crypto Unicorns Authentication"]})
  reason = {"type":"permit","policyId":"13672127-f4e8-4f21-874d-cbdce3b00784","policyName":"ad2488cf-8ab6-41b0-bc9e-41ef61153fec","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "fe1b4e32-2f16-49cb-ac20-84221a36b734", "policyName": "816207da-5679-43d9-90cb-0ae17d3e26df" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signMessage"})
  reason = {"type":"permit","policyId":"fe1b4e32-2f16-49cb-ac20-84221a36b734","policyName":"816207da-5679-43d9-90cb-0ae17d3e26df","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "e05f41ea-773e-4d45-b105-1af0cff81913", "policyName": "8d79f8c1-8c65-441b-9319-ff5c9803bc65" }] = reason {
    checkResourceIntegrity
    checkAction({"signTransaction"})
    checkIntentType({"transferErc20", "transferNative"})
  reason = {"type":"permit","policyId":"e05f41ea-773e-4d45-b105-1af0cff81913","policyName":"8d79f8c1-8c65-441b-9319-ff5c9803bc65","approvalsSatisfied":[],"approvalsMissing":[]}
  }

