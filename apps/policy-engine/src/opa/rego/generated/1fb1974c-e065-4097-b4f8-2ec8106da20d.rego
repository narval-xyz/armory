package main

  permit[{"policyId": "778bbd23-6fca-46ae-ad02-305285569cb2", "policyName": "c4cb0186-a0e8-48b8-bf05-8eaffc9efdcc" }] = reason {
    checkResourceIntegrity
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x28597ea60030fbae79088d89d803f25143c7a6b5"})
    checkChainId({"137"})
    checkIntentHexSignature({"0xc16fad97"})
  reason = {"type":"permit","policyId":"778bbd23-6fca-46ae-ad02-305285569cb2","policyName":"c4cb0186-a0e8-48b8-bf05-8eaffc9efdcc","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "da364056-7a88-4a90-8c62-09e405f5977d", "policyName": "13fabcb5-e7d9-4e47-985e-9b048ebb7003" }] = reason {
    checkResourceIntegrity
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x28597ea60030fbae79088d89d803f25143c7a6b5"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x2b3f22b4"})
  reason = {"type":"permit","policyId":"da364056-7a88-4a90-8c62-09e405f5977d","policyName":"13fabcb5-e7d9-4e47-985e-9b048ebb7003","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "2c51ce42-6bc2-4ae8-93a8-fe5486245e63", "policyName": "ec539dbc-e44f-4e5b-8fe5-6f61de0c4e7b" }] = reason {
    checkResourceIntegrity
    checkAction({"signTransaction"})
    checkIntentType({"approveTokenAllowance"})
    checkIntentToken({"eip155:137/erc20:0x431cd3c9ac9fc73644bf68bf5691f4b83f9e104f"})
    checkIntentSpender({"eip155:137:0x28597ea60030fbae79088d89d803f25143c7a6b5"})
    checkChainId({"137"})
  reason = {"type":"permit","policyId":"2c51ce42-6bc2-4ae8-93a8-fe5486245e63","policyName":"ec539dbc-e44f-4e5b-8fe5-6f61de0c4e7b","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "6bd24b30-2092-4075-8dab-54dfb9425e74", "policyName": "e61592db-ec4a-435b-bce7-71b12ac57693" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signTransaction"})
    checkIntentType({"transferErc20", "transferNative"})
  reason = {"type":"permit","policyId":"6bd24b30-2092-4075-8dab-54dfb9425e74","policyName":"e61592db-ec4a-435b-bce7-71b12ac57693","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "536047fe-b6aa-4fb5-a2c4-32f49cbcdae3", "policyName": "a68e8d20-0419-475c-8fcc-b17d4de8c955" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signTransaction"})
    checkIntentType({"transferErc721", "transferErc1155"})
  reason = {"type":"permit","policyId":"536047fe-b6aa-4fb5-a2c4-32f49cbcdae3","policyName":"a68e8d20-0419-475c-8fcc-b17d4de8c955","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "0d608d8d-7485-42e9-9f96-abc73f680a48", "policyName": "f42953dc-b6d9-4186-bdcc-1b834779f462" }] = reason {
    checkResourceIntegrity
    checkPrincipalId({"auth0|62e1d7ca04533b042cb42419"})
    checkAction({"signTransaction"})
    checkIntentType({"transferErc20"})
    checkIntentToken({"eip155:137/erc20:0x431cd3c9ac9fc73644bf68bf5691f4b83f9e104f"})
    checkChainId({"137"})
    checkWalletAddress({"0x0ff514df05c423a120152df9e04ba94fab7b3491"})
    checkIntentAmount({"currency":"*","operator":"lt","value":"2"})
  reason = {"type":"permit","policyId":"0d608d8d-7485-42e9-9f96-abc73f680a48","policyName":"f42953dc-b6d9-4186-bdcc-1b834779f462","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "17b69057-4948-48f7-8d76-e83cbae95b04", "policyName": "417c3e87-9dc2-4ec8-9b8f-b5a421c90226" }] = reason {
    checkResourceIntegrity
    checkPrincipalId({"auth0|62e1d7ca04533b042cb42419"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
    checkChainId({"137"})
  reason = {"type":"permit","policyId":"17b69057-4948-48f7-8d76-e83cbae95b04","policyName":"417c3e87-9dc2-4ec8-9b8f-b5a421c90226","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "c5236869-8519-48e8-b867-3d0d32c58754", "policyName": "593000a9-05fd-4e2a-88b1-946115dfcdcf" }] = reason {
    checkResourceIntegrity
    checkPrincipalId({"auth0|62e1d7ca04533b042cb42419"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
    checkChainId({"137"})
  reason = {"type":"permit","policyId":"c5236869-8519-48e8-b867-3d0d32c58754","policyName":"593000a9-05fd-4e2a-88b1-946115dfcdcf","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "13969c45-1df4-4ed4-a41e-de6f598b96c0", "policyName": "a4a6b1b0-638a-4535-b48b-32e99ce58d92" }] = reason {
    checkResourceIntegrity
    checkPrincipalId({"auth0|62e1d7ca04533b042cb42419"})
    checkDestinationAddress({"nftAssetTransfer"})
    checkAction({"signTransaction"})
    checkIntentType({"transferErc721"})
    checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
    checkChainId({"137"})
  reason = {"type":"permit","policyId":"13969c45-1df4-4ed4-a41e-de6f598b96c0","policyName":"a4a6b1b0-638a-4535-b48b-32e99ce58d92","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "ac93e93a-f52a-4b93-9cf0-ec68ee01525a", "policyName": "0a4a01d5-78ce-4cf8-9f97-bc5726e173df" }] = reason {
    checkResourceIntegrity
    checkPrincipalId({"auth0|64784e51867282eb243a9daa"})
    checkAction({"signMessage"})
    checkChainId({"137"})
    checkIntentDomain({"version":["1"],"name":["Crypto Unicorns Authentication"]})
  reason = {"type":"permit","policyId":"ac93e93a-f52a-4b93-9cf0-ec68ee01525a","policyName":"0a4a01d5-78ce-4cf8-9f97-bc5726e173df","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "1f14c3c9-e2db-4ed3-98bc-19998e6c1ca8", "policyName": "fd02d4da-2c20-49bb-a904-57c5a81bc0e5" }] = reason {
    checkResourceIntegrity
    checkAction({"signTransaction"})
    checkIntentType({"approveTokenAllowance"})
    checkIntentToken({"eip155:137/erc20:0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad"})
    checkChainId({"137"})
  reason = {"type":"permit","policyId":"1f14c3c9-e2db-4ed3-98bc-19998e6c1ca8","policyName":"fd02d4da-2c20-49bb-a904-57c5a81bc0e5","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "9ea11622-c0dd-47b4-9df9-6701420fbd9a", "policyName": "dd0c5566-8e45-4ada-9811-73eac1886b68" }] = reason {
    checkResourceIntegrity
    checkAction({"signTransaction"})
    checkIntentType({"approveTokenAllowance"})
    checkIntentToken({"eip155:137/erc20:0x64060ab139feaae7f06ca4e63189d86adeb51691"})
    checkChainId({"137"})
  reason = {"type":"permit","policyId":"9ea11622-c0dd-47b4-9df9-6701420fbd9a","policyName":"dd0c5566-8e45-4ada-9811-73eac1886b68","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "4537728c-081a-4af4-8a52-3f5de04f16a2", "policyName": "c3d6e2a3-8812-44f2-89cb-d13a63b649fa" }] = reason {
    checkResourceIntegrity
    checkPrincipalId({"auth0|64784e51867282eb243a9daa"})
    checkDestinationAddress({"nftAssetTransfer"})
    checkAction({"signTransaction"})
    checkIntentType({"transferErc721"})
    checkIntentContract({"eip155:137:0xa2a13ce1824f3916fc84c65e559391fc6674e6e8"})
    checkChainId({"137"})
  reason = {"type":"permit","policyId":"4537728c-081a-4af4-8a52-3f5de04f16a2","policyName":"c3d6e2a3-8812-44f2-89cb-d13a63b649fa","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "fe58e000-1e48-4b2b-86f0-dc25a966c336", "policyName": "cbadfea4-164f-4c3b-88d9-5a20e6c09248" }] = reason {
    checkResourceIntegrity
    checkPrincipalId({"auth0|64784e51867282eb243a9daa"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x5c3e876cb6e531a3a35cc985ab53e8f3869530b5"})
    checkChainId({"137"})
  reason = {"type":"permit","policyId":"fe58e000-1e48-4b2b-86f0-dc25a966c336","policyName":"cbadfea4-164f-4c3b-88d9-5a20e6c09248","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "70457916-303c-45d7-935b-88b19fc13ef5", "policyName": "8a550f70-cc98-4b2d-a3ae-2a624ae3c56b" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x5c3e876cb6e531a3a35cc985ab53e8f3869530b5"})
    checkChainId({"137"})
  reason = {"type":"permit","policyId":"70457916-303c-45d7-935b-88b19fc13ef5","policyName":"8a550f70-cc98-4b2d-a3ae-2a624ae3c56b","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "66892aaf-41e0-426a-9117-83b0efa818c6", "policyName": "c715fcf4-7e9f-45ef-8615-770b0597fddf" }] = reason {
    checkResourceIntegrity
    checkPrincipalId({"auth0|62e1d7ca04533b042cb42419"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x5c3e876cb6e531a3a35cc985ab53e8f3869530b5"})
    checkChainId({"137"})
  reason = {"type":"permit","policyId":"66892aaf-41e0-426a-9117-83b0efa818c6","policyName":"c715fcf4-7e9f-45ef-8615-770b0597fddf","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "4b87cc6c-f2df-4075-aeb0-84821108e185", "policyName": "3d597a7c-cebc-4cb0-8c82-a31fda95e5e7" }] = reason {
    checkResourceIntegrity
    checkPrincipalId({"auth0|62e1d7ca04533b042cb42419"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0xa2a13ce1824f3916fc84c65e559391fc6674e6e8"})
    checkChainId({"137"})
  reason = {"type":"permit","policyId":"4b87cc6c-f2df-4075-aeb0-84821108e185","policyName":"3d597a7c-cebc-4cb0-8c82-a31fda95e5e7","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "66e07667-6f2d-4a99-a223-225e6535fef8", "policyName": "4655de9d-37be-4796-9c49-1e9344c39e21" }] = reason {
    checkResourceIntegrity
    checkPrincipalId({"auth0|62e1d7ca04533b042cb42419"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0xa2a13ce1824f3916fc84c65e559391fc6674e6e8"})
    checkChainId({"137"})
  reason = {"type":"permit","policyId":"66e07667-6f2d-4a99-a223-225e6535fef8","policyName":"4655de9d-37be-4796-9c49-1e9344c39e21","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "f8490e3e-78cc-4245-8af6-4dd0cf6bbc49", "policyName": "7ad914af-edc6-4170-b840-4988ff831ca9" }] = reason {
    checkResourceIntegrity
    checkPrincipalId({"auth0|62e1d7ca04533b042cb42419"})
    checkDestinationAddress({"nftAssetTransfer"})
    checkAction({"signTransaction"})
    checkIntentType({"transferErc721"})
    checkIntentContract({"eip155:137:0xa2a13ce1824f3916fc84c65e559391fc6674e6e8"})
    checkChainId({"137"})
  reason = {"type":"permit","policyId":"f8490e3e-78cc-4245-8af6-4dd0cf6bbc49","policyName":"7ad914af-edc6-4170-b840-4988ff831ca9","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "16168bb0-0c20-4263-be08-c2445f3008a6", "policyName": "18d771af-33a1-46c6-bd95-5008871eff60" }] = reason {
    checkResourceIntegrity
    checkPrincipalId({"auth0|62e1d7ca04533b042cb42419"})
    checkAction({"signMessage"})
  reason = {"type":"permit","policyId":"16168bb0-0c20-4263-be08-c2445f3008a6","policyName":"18d771af-33a1-46c6-bd95-5008871eff60","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "86c8e14d-ccab-41ad-acd3-028f702c2ae4", "policyName": "7543edef-087e-4550-b6bb-dba3e3e6c710" }] = reason {
    checkResourceIntegrity
    checkPrincipalId({"debb4c0f-235c-497e-8009-7476b7494c26"})
    checkAction({"signTransaction"})
    checkIntentType({"transferErc721", "transferErc1155"})
  reason = {"type":"permit","policyId":"86c8e14d-ccab-41ad-acd3-028f702c2ae4","policyName":"7543edef-087e-4550-b6bb-dba3e3e6c710","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "95641d34-b4b7-4cf5-84b0-5752d2d8e334", "policyName": "9e2b8d76-69cb-4cc2-815f-499b054686c9" }] = reason {
    checkResourceIntegrity
    checkPrincipalId({"auth0|62e1d7ca04533b042cb42419"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x5c3e876cb6e531a3a35cc985ab53e8f3869530b5"})
    checkChainId({"137"})
  reason = {"type":"permit","policyId":"95641d34-b4b7-4cf5-84b0-5752d2d8e334","policyName":"9e2b8d76-69cb-4cc2-815f-499b054686c9","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "dc272df7-e327-4ef9-8b7e-da4be57fab50", "policyName": "c77b1a6c-f86a-4910-96a7-11809199dcdc" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x9dafc880"})
  reason = {"type":"permit","policyId":"dc272df7-e327-4ef9-8b7e-da4be57fab50","policyName":"c77b1a6c-f86a-4910-96a7-11809199dcdc","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "aff1c72b-b30c-4582-b943-4183c1740ba5", "policyName": "d1d59f96-cf8f-463e-9018-9dbd4fa2113d" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"member"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x9dafc880"})
  reason = {"type":"permit","policyId":"aff1c72b-b30c-4582-b943-4183c1740ba5","policyName":"d1d59f96-cf8f-463e-9018-9dbd4fa2113d","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "e35164ef-2432-40d2-a8ba-0ede7e8f603f", "policyName": "9383acd7-591c-419a-8730-2068f0a908a9" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x4b4a0bdf"})
  reason = {"type":"permit","policyId":"e35164ef-2432-40d2-a8ba-0ede7e8f603f","policyName":"9383acd7-591c-419a-8730-2068f0a908a9","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "1d6b93ff-1612-4d15-8f3a-27db2e266829", "policyName": "13bd8904-2209-4717-a77d-511932f04391" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0xa3105f63"})
  reason = {"type":"permit","policyId":"1d6b93ff-1612-4d15-8f3a-27db2e266829","policyName":"13bd8904-2209-4717-a77d-511932f04391","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "dbf524ae-ce2b-4ca4-89fb-c667cb3e203c", "policyName": "50c7acef-8279-4fcd-a539-94c93a243d68" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"member"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x5e351737"})
  reason = {"type":"permit","policyId":"dbf524ae-ce2b-4ca4-89fb-c667cb3e203c","policyName":"50c7acef-8279-4fcd-a539-94c93a243d68","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "352a9a8a-95f0-4da6-8d3d-cac1cded0c42", "policyName": "3dd3670e-e166-4185-b18e-90f4afd07cbe" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x5e351737"})
  reason = {"type":"permit","policyId":"352a9a8a-95f0-4da6-8d3d-cac1cded0c42","policyName":"3dd3670e-e166-4185-b18e-90f4afd07cbe","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "9e0acb0c-5975-42c7-8b22-402cf96adedf", "policyName": "8f166dfc-1c16-4fcf-b760-9df12c430e46" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"member"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x37e28cd7"})
  reason = {"type":"permit","policyId":"9e0acb0c-5975-42c7-8b22-402cf96adedf","policyName":"8f166dfc-1c16-4fcf-b760-9df12c430e46","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "953cf43a-608b-43b3-8052-7f97764b7362", "policyName": "568d0fc4-ac9d-4cee-95f1-bac6863b9b38" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x65c38bb8"})
  reason = {"type":"permit","policyId":"953cf43a-608b-43b3-8052-7f97764b7362","policyName":"568d0fc4-ac9d-4cee-95f1-bac6863b9b38","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "561245b9-6ed9-4c12-93a7-7998f42b3e8b", "policyName": "38487fdd-3503-4967-ba2c-281ca974a5d3" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x37e28cd7"})
  reason = {"type":"permit","policyId":"561245b9-6ed9-4c12-93a7-7998f42b3e8b","policyName":"38487fdd-3503-4967-ba2c-281ca974a5d3","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "eaffdca9-04c8-4219-9aff-b9aad47c7b09", "policyName": "9dac2d74-54a4-415a-90ae-ed9786365b30" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"member"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0xa3105f63"})
  reason = {"type":"permit","policyId":"eaffdca9-04c8-4219-9aff-b9aad47c7b09","policyName":"9dac2d74-54a4-415a-90ae-ed9786365b30","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "9e3329b5-ad6c-443c-8e23-fbfee489de65", "policyName": "04051b89-0ba7-454a-bbc2-ea8a66e80ef1" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x77f57d50"})
  reason = {"type":"permit","policyId":"9e3329b5-ad6c-443c-8e23-fbfee489de65","policyName":"04051b89-0ba7-454a-bbc2-ea8a66e80ef1","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "bdc89272-99cc-4117-a444-082e3c27d3a5", "policyName": "cf85beee-91d9-4b16-a234-e9231c5b5589" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"member"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x4b4a0bdf"})
  reason = {"type":"permit","policyId":"bdc89272-99cc-4117-a444-082e3c27d3a5","policyName":"cf85beee-91d9-4b16-a234-e9231c5b5589","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "0cf25f81-73f1-4006-9070-82f22a038d80", "policyName": "3b1a5031-84c0-4eec-bfd3-1fab190a0ca3" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"member"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x77f57d50"})
  reason = {"type":"permit","policyId":"0cf25f81-73f1-4006-9070-82f22a038d80","policyName":"3b1a5031-84c0-4eec-bfd3-1fab190a0ca3","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "1d32ed9b-b4f8-4962-9ca3-adf45eb0b977", "policyName": "55039c69-dfde-4a2a-8b25-48d273ed5bd9" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x27b8e40c"})
  reason = {"type":"permit","policyId":"1d32ed9b-b4f8-4962-9ca3-adf45eb0b977","policyName":"55039c69-dfde-4a2a-8b25-48d273ed5bd9","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "4779780a-4c8d-41fd-b2f0-5c1361d4d4d5", "policyName": "f65db91c-e5e9-4f23-892f-9e97eed41fca" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"member"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x27b8e40c"})
  reason = {"type":"permit","policyId":"4779780a-4c8d-41fd-b2f0-5c1361d4d4d5","policyName":"f65db91c-e5e9-4f23-892f-9e97eed41fca","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "e77f1c38-865a-4560-ba04-5d79a1f9e5fa", "policyName": "2fa683d2-81d6-4c3f-a88d-9cadb2b5c21c" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"member"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x65c38bb8"})
  reason = {"type":"permit","policyId":"e77f1c38-865a-4560-ba04-5d79a1f9e5fa","policyName":"2fa683d2-81d6-4c3f-a88d-9cadb2b5c21c","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "71124dd2-21c9-4622-8e60-ab979f3e0e82", "policyName": "0d745699-8176-44db-bde9-55474fba6cc7" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"member"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x9dafc880"})
  reason = {"type":"permit","policyId":"71124dd2-21c9-4622-8e60-ab979f3e0e82","policyName":"0d745699-8176-44db-bde9-55474fba6cc7","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "3ba350e0-b852-4264-b567-cbeedcea5cad", "policyName": "e7cd1d07-c92b-404c-9ec7-a6a3b8c43790" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"member"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0xa3105f63"})
  reason = {"type":"permit","policyId":"3ba350e0-b852-4264-b567-cbeedcea5cad","policyName":"e7cd1d07-c92b-404c-9ec7-a6a3b8c43790","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "f2e4a2a2-c163-46e0-8147-2ce0eda12168", "policyName": "f0932890-7756-46c2-9509-9260416e6172" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"member"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x5e351737"})
  reason = {"type":"permit","policyId":"f2e4a2a2-c163-46e0-8147-2ce0eda12168","policyName":"f0932890-7756-46c2-9509-9260416e6172","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "960df2ad-d372-40af-9e13-824ccf20c7b4", "policyName": "15c8a58c-c63d-4964-a200-1846c20b7c72" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x4b4a0bdf"})
  reason = {"type":"permit","policyId":"960df2ad-d372-40af-9e13-824ccf20c7b4","policyName":"15c8a58c-c63d-4964-a200-1846c20b7c72","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "dd945f2b-6127-4d2f-a895-6e878a957b7b", "policyName": "3d166ee3-7ed5-4c81-a3f6-5576f474573f" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x9dafc880"})
  reason = {"type":"permit","policyId":"dd945f2b-6127-4d2f-a895-6e878a957b7b","policyName":"3d166ee3-7ed5-4c81-a3f6-5576f474573f","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "7a0931ac-5dfd-4c1f-b035-bb95b4e26bc6", "policyName": "59409ad3-aa95-4bd6-b78e-0c9bf2b85025" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"member"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x27b8e40c"})
  reason = {"type":"permit","policyId":"7a0931ac-5dfd-4c1f-b035-bb95b4e26bc6","policyName":"59409ad3-aa95-4bd6-b78e-0c9bf2b85025","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "958d1e8d-f757-4f08-ad4c-03de670f7739", "policyName": "45019a29-b5ee-4d3a-bebb-918867ba411d" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0xa3105f63"})
  reason = {"type":"permit","policyId":"958d1e8d-f757-4f08-ad4c-03de670f7739","policyName":"45019a29-b5ee-4d3a-bebb-918867ba411d","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "5a7601e4-7af0-46bb-ac3e-29b8926b2075", "policyName": "ad512d85-3827-42a1-9f92-2373ad9c48a0" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x77f57d50"})
  reason = {"type":"permit","policyId":"5a7601e4-7af0-46bb-ac3e-29b8926b2075","policyName":"ad512d85-3827-42a1-9f92-2373ad9c48a0","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "29ba7d37-9d8c-4c2d-b945-ebb4d781a4a1", "policyName": "67ebdaeb-4f83-45c5-8cec-68832fc69ec5" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"member"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x4b4a0bdf"})
  reason = {"type":"permit","policyId":"29ba7d37-9d8c-4c2d-b945-ebb4d781a4a1","policyName":"67ebdaeb-4f83-45c5-8cec-68832fc69ec5","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "8fafb5ed-ba76-4714-9776-0ddc5fc13902", "policyName": "18133452-fb49-4cbb-ab98-4277f72153bd" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x37e28cd7"})
  reason = {"type":"permit","policyId":"8fafb5ed-ba76-4714-9776-0ddc5fc13902","policyName":"18133452-fb49-4cbb-ab98-4277f72153bd","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "4ee6cab2-3e04-4b22-bd31-5295ca06294b", "policyName": "8e489a05-1ad5-4327-b316-70c8da8dc8f3" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"member"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x37e28cd7"})
  reason = {"type":"permit","policyId":"4ee6cab2-3e04-4b22-bd31-5295ca06294b","policyName":"8e489a05-1ad5-4327-b316-70c8da8dc8f3","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "903a8790-0a3f-4011-a2a5-c93984e93a45", "policyName": "4acb88b3-775d-44a7-a18a-45644d4967a0" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"member"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x65c38bb8"})
  reason = {"type":"permit","policyId":"903a8790-0a3f-4011-a2a5-c93984e93a45","policyName":"4acb88b3-775d-44a7-a18a-45644d4967a0","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "33025979-f543-41e0-a3a8-25ba419d2fb8", "policyName": "06122f43-d9ff-49c1-925e-e812fd39c6aa" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"member"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x77f57d50"})
  reason = {"type":"permit","policyId":"33025979-f543-41e0-a3a8-25ba419d2fb8","policyName":"06122f43-d9ff-49c1-925e-e812fd39c6aa","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "83f21fca-3f52-44fc-a3bf-660b6627c091", "policyName": "bef5ea3c-8e2b-42f3-846e-79383dcfe5e0" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x5e351737"})
  reason = {"type":"permit","policyId":"83f21fca-3f52-44fc-a3bf-660b6627c091","policyName":"bef5ea3c-8e2b-42f3-846e-79383dcfe5e0","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "05206a90-dec8-4049-a34b-8e8a7dfaa30b", "policyName": "325bfba9-7c23-4b87-a676-fe61fb9b1826" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x65c38bb8"})
  reason = {"type":"permit","policyId":"05206a90-dec8-4049-a34b-8e8a7dfaa30b","policyName":"325bfba9-7c23-4b87-a676-fe61fb9b1826","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "c345e94d-9107-4c0e-8d42-de77d816965b", "policyName": "1deb18cf-75cb-4cc0-850d-e73aa5c89c47" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x27b8e40c"})
  reason = {"type":"permit","policyId":"c345e94d-9107-4c0e-8d42-de77d816965b","policyName":"1deb18cf-75cb-4cc0-850d-e73aa5c89c47","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "3f238139-061c-410a-a7c0-589828362a6a", "policyName": "4280497c-ba28-4e77-b36d-8c54ef4eeac2" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"member"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x37e28cd7"})
  reason = {"type":"permit","policyId":"3f238139-061c-410a-a7c0-589828362a6a","policyName":"4280497c-ba28-4e77-b36d-8c54ef4eeac2","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "232051d2-b146-4f89-a4b8-4d172e0e96ac", "policyName": "7d4df6cc-ea13-49b7-940c-5130c0ed0992" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"member"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0xa3105f63"})
  reason = {"type":"permit","policyId":"232051d2-b146-4f89-a4b8-4d172e0e96ac","policyName":"7d4df6cc-ea13-49b7-940c-5130c0ed0992","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "28881d6e-ad40-4fa3-b6eb-1f76bbddb24d", "policyName": "a386c957-0ef6-45a6-859a-3f07e490782d" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"member"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x9dafc880"})
  reason = {"type":"permit","policyId":"28881d6e-ad40-4fa3-b6eb-1f76bbddb24d","policyName":"a386c957-0ef6-45a6-859a-3f07e490782d","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "364f9995-5899-4ba4-8b0a-145b73df634d", "policyName": "0ff36d61-d11d-4ce9-a225-dabfa8a61dcf" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x9dafc880"})
  reason = {"type":"permit","policyId":"364f9995-5899-4ba4-8b0a-145b73df634d","policyName":"0ff36d61-d11d-4ce9-a225-dabfa8a61dcf","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "1720b10a-6451-46f0-9262-33c925b4e07e", "policyName": "ef73b23d-168a-4e1c-9e0b-eb54058b925d" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0xa3105f63"})
  reason = {"type":"permit","policyId":"1720b10a-6451-46f0-9262-33c925b4e07e","policyName":"ef73b23d-168a-4e1c-9e0b-eb54058b925d","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "bde876a7-46ad-47d6-aff2-bc6c3a96caf9", "policyName": "2109d39d-6e3f-47bf-a6e6-0079128a77d8" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x65c38bb8"})
  reason = {"type":"permit","policyId":"bde876a7-46ad-47d6-aff2-bc6c3a96caf9","policyName":"2109d39d-6e3f-47bf-a6e6-0079128a77d8","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "fcb4ae66-e417-429e-acd9-55e2aa68e1f3", "policyName": "d9b9257d-d335-450f-8e6c-cc910344563f" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"member"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x27b8e40c"})
  reason = {"type":"permit","policyId":"fcb4ae66-e417-429e-acd9-55e2aa68e1f3","policyName":"d9b9257d-d335-450f-8e6c-cc910344563f","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "0cbc60ad-1b14-402e-b641-b110bdcb8910", "policyName": "6d560223-1c9a-433e-bb63-4fbfe9c2c2e9" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"member"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x77f57d50"})
  reason = {"type":"permit","policyId":"0cbc60ad-1b14-402e-b641-b110bdcb8910","policyName":"6d560223-1c9a-433e-bb63-4fbfe9c2c2e9","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "b5473df6-dcd6-4711-8b5f-081d9e9036b0", "policyName": "c69202e1-b2e1-4cdc-9c0d-57870ec9e226" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"member"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x65c38bb8"})
  reason = {"type":"permit","policyId":"b5473df6-dcd6-4711-8b5f-081d9e9036b0","policyName":"c69202e1-b2e1-4cdc-9c0d-57870ec9e226","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "95f039cb-eb91-4ba6-88d7-98fd4af63f8f", "policyName": "83a25c78-f344-49bc-81d3-0beac44ab84e" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"member"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x5e351737"})
  reason = {"type":"permit","policyId":"95f039cb-eb91-4ba6-88d7-98fd4af63f8f","policyName":"83a25c78-f344-49bc-81d3-0beac44ab84e","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "00d21839-8541-438b-8dcc-88c9ccb5eeca", "policyName": "8d0f728c-7214-43d5-ab4a-338c499d2eda" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x37e28cd7"})
  reason = {"type":"permit","policyId":"00d21839-8541-438b-8dcc-88c9ccb5eeca","policyName":"8d0f728c-7214-43d5-ab4a-338c499d2eda","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "abbfdcf3-f3f5-44f0-a4d5-f891df4521bd", "policyName": "6eaaba91-2e24-4ce2-b201-90cda846c776" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x4b4a0bdf"})
  reason = {"type":"permit","policyId":"abbfdcf3-f3f5-44f0-a4d5-f891df4521bd","policyName":"6eaaba91-2e24-4ce2-b201-90cda846c776","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "0daf1dbc-fed6-4f17-8419-9ce56166652e", "policyName": "e207ff6e-51a7-419c-b6bc-5f89d155e907" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x77f57d50"})
  reason = {"type":"permit","policyId":"0daf1dbc-fed6-4f17-8419-9ce56166652e","policyName":"e207ff6e-51a7-419c-b6bc-5f89d155e907","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "179be9eb-2b79-419d-a6b4-6c9cdf07015d", "policyName": "65970262-79ec-484d-a744-bd81dace3d15" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x27b8e40c"})
  reason = {"type":"permit","policyId":"179be9eb-2b79-419d-a6b4-6c9cdf07015d","policyName":"65970262-79ec-484d-a744-bd81dace3d15","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "aa9dbd45-b070-4a7d-a288-1874dde35e0f", "policyName": "8b8a4584-39e2-4b89-b471-eb6b262dfae9" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x5e351737"})
  reason = {"type":"permit","policyId":"aa9dbd45-b070-4a7d-a288-1874dde35e0f","policyName":"8b8a4584-39e2-4b89-b471-eb6b262dfae9","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "0f87d6f0-5824-42a3-b651-a2cbcb2aaf85", "policyName": "e8069224-68c3-4073-9249-afe0f6544631" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"member"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x4b4a0bdf"})
  reason = {"type":"permit","policyId":"0f87d6f0-5824-42a3-b651-a2cbcb2aaf85","policyName":"e8069224-68c3-4073-9249-afe0f6544631","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "12aae250-b97f-4611-b1cf-9e346bee1ef5", "policyName": "552fff6a-af3f-4a24-8b9a-4b77db6fc971" }] = reason {
    checkResourceIntegrity
    checkPrincipalId({"13b8f90e-d929-49a9-8f8c-a40bfff0f09e"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x4c60051384bd2d3c01bfc845cf5f4b44bcbe9de5"})
    checkChainId({"137"})
  reason = {"type":"permit","policyId":"12aae250-b97f-4611-b1cf-9e346bee1ef5","policyName":"552fff6a-af3f-4a24-8b9a-4b77db6fc971","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "4ec777a2-daaf-4b46-aa53-0f4d511f6ef6", "policyName": "afef70ed-9e23-4f79-a95c-a0616c01b5d1" }] = reason {
    checkResourceIntegrity
    checkPrincipalId({"debb4c0f-235c-497e-8009-7476b7494c26"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkWalletAddress({"0xa1d6e9a37b3fb99b226f64741627af6f4ae219e1"})
  reason = {"type":"permit","policyId":"4ec777a2-daaf-4b46-aa53-0f4d511f6ef6","policyName":"afef70ed-9e23-4f79-a95c-a0616c01b5d1","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "07194f64-f4b2-44ff-b64c-02156298cf44", "policyName": "6a898c76-584f-4616-8246-c5d31afc07c9" }] = reason {
    checkResourceIntegrity
    checkPrincipalId({"13b8f90e-d929-49a9-8f8c-a40bfff0f09e"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x4c60051384bd2d3c01bfc845cf5f4b44bcbe9de5"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x24856bc3"})
  reason = {"type":"permit","policyId":"07194f64-f4b2-44ff-b64c-02156298cf44","policyName":"6a898c76-584f-4616-8246-c5d31afc07c9","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "de9cfebb-f14d-445b-9505-aefae8af678f", "policyName": "48d24de0-3d05-46ce-81cf-3f81e8022283" }] = reason {
    checkResourceIntegrity
    checkPrincipalId({"13b8f90e-d929-49a9-8f8c-a40bfff0f09e"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x4c60051384bd2d3c01bfc845cf5f4b44bcbe9de5"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x24856bc3"})
  reason = {"type":"permit","policyId":"de9cfebb-f14d-445b-9505-aefae8af678f","policyName":"48d24de0-3d05-46ce-81cf-3f81e8022283","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "807a2cc5-194a-4549-a765-a313a340e9fa", "policyName": "a86e9f14-4018-43cc-b15a-fc1e42ec4406" }] = reason {
    checkResourceIntegrity
    checkPrincipalId({"13b8f90e-d929-49a9-8f8c-a40bfff0f09e"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x4c60051384bd2d3c01bfc845cf5f4b44bcbe9de5"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x24856bc3"})
  reason = {"type":"permit","policyId":"807a2cc5-194a-4549-a765-a313a340e9fa","policyName":"a86e9f14-4018-43cc-b15a-fc1e42ec4406","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "ddbae8c9-f2e6-4353-bd70-88bfb9548d50", "policyName": "68627533-b4de-4c60-9bff-8419678638a5" }] = reason {
    checkResourceIntegrity
    checkPrincipalId({"13b8f90e-d929-49a9-8f8c-a40bfff0f09e"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x4c60051384bd2d3c01bfc845cf5f4b44bcbe9de5"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x24856bc3"})
  reason = {"type":"permit","policyId":"ddbae8c9-f2e6-4353-bd70-88bfb9548d50","policyName":"68627533-b4de-4c60-9bff-8419678638a5","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "817a8db3-194b-4428-81ab-3b92238c72a1", "policyName": "8ddd52ba-fe72-488a-8c0a-49215cca56fd" }] = reason {
    checkResourceIntegrity
    checkPrincipalId({"auth0|62e3998004533b042cb44ccf"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
    checkChainId({"137"})
  reason = {"type":"permit","policyId":"817a8db3-194b-4428-81ab-3b92238c72a1","policyName":"8ddd52ba-fe72-488a-8c0a-49215cca56fd","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "2259e4e2-0f74-4a2c-ba9f-ee4cfbe3d006", "policyName": "94890c04-d3d2-4614-82cd-1709abd96c0f" }] = reason {
    checkResourceIntegrity
    checkPrincipalId({"auth0|62e3998004533b042cb44ccf"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
    checkChainId({"137"})
  reason = {"type":"permit","policyId":"2259e4e2-0f74-4a2c-ba9f-ee4cfbe3d006","policyName":"94890c04-d3d2-4614-82cd-1709abd96c0f","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  forbid[{"policyId": "2312fc76-4c32-4cf0-a227-fa20bb70dab5", "policyName": "746bbc21-c869-4d2e-8236-dda489274610" }] = reason {
    checkResourceIntegrity
    checkPrincipalId({"auth0|62e1d7ca04533b042cb42419"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
    checkChainId({"137"})
  reason = {"type":"forbid","policyId":"2312fc76-4c32-4cf0-a227-fa20bb70dab5","policyName":"746bbc21-c869-4d2e-8236-dda489274610","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "7ffc3038-067a-41e8-ab27-38d85d83cc01", "policyName": "7bf29225-1825-4bd6-8b8a-ef2c0a40707a" }] = reason {
    checkResourceIntegrity
    checkPrincipalId({"615f46d7-7039-43a3-a904-6daccaf72e61"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0xfbe3ab0cbfbd17d06bdd73aa3f55aaf038720f59"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x23b872dd"})
  reason = {"type":"permit","policyId":"7ffc3038-067a-41e8-ab27-38d85d83cc01","policyName":"7bf29225-1825-4bd6-8b8a-ef2c0a40707a","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "20047f08-f7b0-47ee-ba23-8477f47537eb", "policyName": "dda465a6-8dc1-4142-9d00-ec6313955f01" }] = reason {
    checkResourceIntegrity
    checkPrincipalId({"auth0|62e3998004533b042cb44ccf"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x42842e0e"})
  reason = {"type":"permit","policyId":"20047f08-f7b0-47ee-ba23-8477f47537eb","policyName":"dda465a6-8dc1-4142-9d00-ec6313955f01","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "e75fb238-978a-40d4-a7cf-8abb3399ac11", "policyName": "d1f6e863-ae60-409d-870f-3faf7032d616" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x65b4613f"})
  reason = {"type":"permit","policyId":"e75fb238-978a-40d4-a7cf-8abb3399ac11","policyName":"d1f6e863-ae60-409d-870f-3faf7032d616","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "4712a725-8024-4aad-a338-ef388ef6cb3d", "policyName": "39550a81-1c30-48f3-a590-6cbb6ddd375d" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
    checkChainId({"137"})
    checkIntentHexSignature({"0xef68253d"})
  reason = {"type":"permit","policyId":"4712a725-8024-4aad-a338-ef388ef6cb3d","policyName":"39550a81-1c30-48f3-a590-6cbb6ddd375d","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "6aaba346-5ede-4950-b7f0-dc3d6c836ba8", "policyName": "9d37e0ab-8b25-48d3-b0ba-766f15a12626" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x93551267"})
  reason = {"type":"permit","policyId":"6aaba346-5ede-4950-b7f0-dc3d6c836ba8","policyName":"9d37e0ab-8b25-48d3-b0ba-766f15a12626","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "ad7e8c25-151f-403f-8f53-567b8451ed4e", "policyName": "03959b54-5fdb-4c2c-b10e-996e07b7b1d4" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"member"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x93551267"})
  reason = {"type":"permit","policyId":"ad7e8c25-151f-403f-8f53-567b8451ed4e","policyName":"03959b54-5fdb-4c2c-b10e-996e07b7b1d4","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "6fef6f3d-3e40-4e17-b493-6d63fc7ad7ff", "policyName": "67151495-b1a6-4632-8dff-a84277205daa" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0xa2a13ce1824f3916fc84c65e559391fc6674e6e8"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x93e39539"})
  reason = {"type":"permit","policyId":"6fef6f3d-3e40-4e17-b493-6d63fc7ad7ff","policyName":"67151495-b1a6-4632-8dff-a84277205daa","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "f90d4e5e-d31b-4dba-ae11-5aec08cc319b", "policyName": "e9918e0e-7621-4d95-afa3-deeaed768409" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"member"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x65b4613f"})
  reason = {"type":"permit","policyId":"f90d4e5e-d31b-4dba-ae11-5aec08cc319b","policyName":"e9918e0e-7621-4d95-afa3-deeaed768409","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "8679d587-988a-40a2-abf3-2b42b5d6ed40", "policyName": "6c11f2c3-c9dc-4a67-afbb-14d2418b9233" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x44c9b41f"})
  reason = {"type":"permit","policyId":"8679d587-988a-40a2-abf3-2b42b5d6ed40","policyName":"6c11f2c3-c9dc-4a67-afbb-14d2418b9233","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "c6e4296c-19c4-431d-a144-bc1103537e26", "policyName": "c71e98e1-f4ef-4682-b628-79d03473fbdc" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x86c68622"})
  reason = {"type":"permit","policyId":"c6e4296c-19c4-431d-a144-bc1103537e26","policyName":"c71e98e1-f4ef-4682-b628-79d03473fbdc","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "22841474-679e-493e-a06f-1268107b5511", "policyName": "c0469d8c-1120-4985-8aa9-2df7a66885ea" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"member"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0xa2a13ce1824f3916fc84c65e559391fc6674e6e8"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x93e39539"})
  reason = {"type":"permit","policyId":"22841474-679e-493e-a06f-1268107b5511","policyName":"c0469d8c-1120-4985-8aa9-2df7a66885ea","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "d67fe4dd-9994-4e31-ac05-ffb2e20e509b", "policyName": "f473c356-a95b-496a-83ad-a67e07f67e59" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"member"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x902ead61"})
  reason = {"type":"permit","policyId":"d67fe4dd-9994-4e31-ac05-ffb2e20e509b","policyName":"f473c356-a95b-496a-83ad-a67e07f67e59","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "2903f47e-6a5b-4277-8962-e119f6c998bd", "policyName": "fe3167f2-c5c4-4ed1-9217-cfa02e858515" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x6bc613a25afe159b70610b64783ca51c9258b92e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x6548b7ae"})
  reason = {"type":"permit","policyId":"2903f47e-6a5b-4277-8962-e119f6c998bd","policyName":"fe3167f2-c5c4-4ed1-9217-cfa02e858515","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "7ea9770f-4293-4dbc-a278-09e0c118a617", "policyName": "a018b301-3234-434b-83df-8547c14e926b" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"member"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x86c68622"})
  reason = {"type":"permit","policyId":"7ea9770f-4293-4dbc-a278-09e0c118a617","policyName":"a018b301-3234-434b-83df-8547c14e926b","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "c34bc240-ad50-4c2d-ae05-2dd4f711a3ba", "policyName": "8b357452-f7aa-4585-a798-720ac5a64e59" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"member"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x5d878596"})
  reason = {"type":"permit","policyId":"c34bc240-ad50-4c2d-ae05-2dd4f711a3ba","policyName":"8b357452-f7aa-4585-a798-720ac5a64e59","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "2ed79cf4-7d17-402a-abb7-85b94b7d56dd", "policyName": "5f1644df-8377-4691-91b0-fe6aa00d621f" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0xdd86381e"})
  reason = {"type":"permit","policyId":"2ed79cf4-7d17-402a-abb7-85b94b7d56dd","policyName":"5f1644df-8377-4691-91b0-fe6aa00d621f","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "1053dde2-a986-43ef-8613-625df17c446d", "policyName": "247157a4-1b64-4e75-8321-b98e38b0389e" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x51782474"})
  reason = {"type":"permit","policyId":"1053dde2-a986-43ef-8613-625df17c446d","policyName":"247157a4-1b64-4e75-8321-b98e38b0389e","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "6bda29a2-db29-4741-b26e-6c5e3c8da2cb", "policyName": "eabd89d2-194d-42cd-81c2-edef36b76caa" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"member"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0xeae2ea7e"})
  reason = {"type":"permit","policyId":"6bda29a2-db29-4741-b26e-6c5e3c8da2cb","policyName":"eabd89d2-194d-42cd-81c2-edef36b76caa","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "ecc7d7c0-abfb-4d65-9cfc-5670a033fd4d", "policyName": "99e86b13-641e-47ca-8936-a95d3a6f437b" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
    checkChainId({"137"})
    checkIntentHexSignature({"0xd2df3a9e"})
  reason = {"type":"permit","policyId":"ecc7d7c0-abfb-4d65-9cfc-5670a033fd4d","policyName":"99e86b13-641e-47ca-8936-a95d3a6f437b","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "f10642a1-5e23-4ec6-982d-7ddb272aa3a4", "policyName": "964091bf-3bba-4699-b3e1-d3eb46ca6d8c" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"member"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
    checkChainId({"137"})
    checkIntentHexSignature({"0xd4db00cc"})
  reason = {"type":"permit","policyId":"f10642a1-5e23-4ec6-982d-7ddb272aa3a4","policyName":"964091bf-3bba-4699-b3e1-d3eb46ca6d8c","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "3f2a97f7-6026-428a-a99d-10194925b1e5", "policyName": "c5510e0e-7a09-4db9-9690-019dad364989" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"member"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x6bc613a25afe159b70610b64783ca51c9258b92e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x6548b7ae"})
  reason = {"type":"permit","policyId":"3f2a97f7-6026-428a-a99d-10194925b1e5","policyName":"c5510e0e-7a09-4db9-9690-019dad364989","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "807fae57-486c-4de8-b3ef-fc26dc2b4cf5", "policyName": "acf62623-e4f0-414a-99f8-2e30552d2976" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
    checkChainId({"137"})
    checkIntentHexSignature({"0xd4db00cc"})
  reason = {"type":"permit","policyId":"807fae57-486c-4de8-b3ef-fc26dc2b4cf5","policyName":"acf62623-e4f0-414a-99f8-2e30552d2976","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "087fa4f4-2b68-4b6c-8131-90bf46551944", "policyName": "110502e9-ac0c-423f-9a8f-6376e2ffed88" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"member"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x51782474"})
  reason = {"type":"permit","policyId":"087fa4f4-2b68-4b6c-8131-90bf46551944","policyName":"110502e9-ac0c-423f-9a8f-6376e2ffed88","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "86d381be-dcd3-4dd2-abe6-d6588efcc9c2", "policyName": "bc3fae98-2e50-4ff0-9c82-cd77cc6ee143" }] = reason {
    checkResourceIntegrity
    checkPrincipalId({"13b8f90e-d929-49a9-8f8c-a40bfff0f09e"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x3df16fb8dc28f63565af2815e04a3368360ffd23"})
    checkChainId({"137"})
    checkWalletAddress({"0x7a0854f64ded80455208ad6939950d915b2a101e"})
  reason = {"type":"permit","policyId":"86d381be-dcd3-4dd2-abe6-d6588efcc9c2","policyName":"bc3fae98-2e50-4ff0-9c82-cd77cc6ee143","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "ea4f0589-f7ae-49a9-bb68-677c2f844d75", "policyName": "44b5d3e8-5e02-428f-b057-61dd6293e374" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"member"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x9edcab23"})
  reason = {"type":"permit","policyId":"ea4f0589-f7ae-49a9-bb68-677c2f844d75","policyName":"44b5d3e8-5e02-428f-b057-61dd6293e374","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "b67d3899-6832-445b-80e2-0493d21ae355", "policyName": "a8ed180c-6607-4d6d-bce5-7be3a671dd2d" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x9edcab23"})
  reason = {"type":"permit","policyId":"b67d3899-6832-445b-80e2-0493d21ae355","policyName":"a8ed180c-6607-4d6d-bce5-7be3a671dd2d","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "4265bd2e-94b4-493f-8ae9-cc3dc1e93aae", "policyName": "ae036a24-fa6c-463c-acfa-59914cf67a59" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0xd3ac2166"})
  reason = {"type":"permit","policyId":"4265bd2e-94b4-493f-8ae9-cc3dc1e93aae","policyName":"ae036a24-fa6c-463c-acfa-59914cf67a59","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "b71a2cc5-e0ac-4694-a336-adbc0f1dd1b6", "policyName": "325ec9af-67dc-4a2a-9f90-1703406cf261" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"member"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0xd3ac2166"})
  reason = {"type":"permit","policyId":"b71a2cc5-e0ac-4694-a336-adbc0f1dd1b6","policyName":"325ec9af-67dc-4a2a-9f90-1703406cf261","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "ec1028b1-0a08-4fc0-aa27-f14d4dad03e5", "policyName": "48412cc3-a596-4b04-aca4-b000f1e1335b" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x1521465b"})
  reason = {"type":"permit","policyId":"ec1028b1-0a08-4fc0-aa27-f14d4dad03e5","policyName":"48412cc3-a596-4b04-aca4-b000f1e1335b","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "e00181f6-e6d7-4164-b64a-6078b5ff68ca", "policyName": "cd19a84f-4b15-440f-a389-5f70420c43cd" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x902ead61"})
  reason = {"type":"permit","policyId":"e00181f6-e6d7-4164-b64a-6078b5ff68ca","policyName":"cd19a84f-4b15-440f-a389-5f70420c43cd","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "3f01e52b-7be6-4b39-af80-4644b07f174f", "policyName": "c4f40208-9037-49a1-870e-7303ca1c0c14" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"member"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x1521465b"})
  reason = {"type":"permit","policyId":"3f01e52b-7be6-4b39-af80-4644b07f174f","policyName":"c4f40208-9037-49a1-870e-7303ca1c0c14","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "247f7444-8bc3-4c06-86fd-f8d93c92c46d", "policyName": "bc39284b-490a-43c4-bb5a-87862a1ee4a9" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0xeae2ea7e"})
  reason = {"type":"permit","policyId":"247f7444-8bc3-4c06-86fd-f8d93c92c46d","policyName":"bc39284b-490a-43c4-bb5a-87862a1ee4a9","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "f6411f9a-c7a7-4b4c-9a3c-9c6fb405d385", "policyName": "32a8e7af-b58a-476e-908a-74bb561f61b1" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"member"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
    checkChainId({"137"})
    checkIntentHexSignature({"0xe01c7002"})
  reason = {"type":"permit","policyId":"f6411f9a-c7a7-4b4c-9a3c-9c6fb405d385","policyName":"32a8e7af-b58a-476e-908a-74bb561f61b1","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "5f2ba5a2-6058-4f04-9e24-04efcd0bf995", "policyName": "f7e4631d-e5ae-435f-a00c-23448909e7db" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signTransaction"})
    checkIntentType({"transferErc721", "transferErc1155"})
  reason = {"type":"permit","policyId":"5f2ba5a2-6058-4f04-9e24-04efcd0bf995","policyName":"f7e4631d-e5ae-435f-a00c-23448909e7db","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "48605313-8d01-4334-b0f3-fea49240bb59", "policyName": "7af674ef-428e-4e13-9d79-4a38ff4c0eb2" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signTransaction"})
    checkIntentType({"transferErc721", "transferErc1155"})
  reason = {"type":"permit","policyId":"48605313-8d01-4334-b0f3-fea49240bb59","policyName":"7af674ef-428e-4e13-9d79-4a38ff4c0eb2","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "b62279b2-ae71-4c3e-a7f0-019f85e186d6", "policyName": "fe3d3406-aa65-4a20-8c72-7a24b614151a" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
    checkChainId({"137"})
    checkIntentHexSignature({"0xe01c7002"})
  reason = {"type":"permit","policyId":"b62279b2-ae71-4c3e-a7f0-019f85e186d6","policyName":"fe3d3406-aa65-4a20-8c72-7a24b614151a","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "c7c6ca57-c8bb-437b-8b1d-0fb3ae20a481", "policyName": "f30d6697-2cda-4553-9e7d-66886110a882" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0xdd7944f5"})
  reason = {"type":"permit","policyId":"c7c6ca57-c8bb-437b-8b1d-0fb3ae20a481","policyName":"f30d6697-2cda-4553-9e7d-66886110a882","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "eea66636-a9ce-4edd-8761-c9a1a030b99a", "policyName": "7fc04ac3-368f-42b1-b9f4-06761241567c" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"member"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x44c9b41f"})
  reason = {"type":"permit","policyId":"eea66636-a9ce-4edd-8761-c9a1a030b99a","policyName":"7fc04ac3-368f-42b1-b9f4-06761241567c","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "bc1faa85-9465-4a74-9474-d029e7da53bf", "policyName": "8a30c2d3-ffe0-473c-a1b4-730754cb9430" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"member"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0xa2a13ce1824f3916fc84c65e559391fc6674e6e8"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x5757b38a"})
  reason = {"type":"permit","policyId":"bc1faa85-9465-4a74-9474-d029e7da53bf","policyName":"8a30c2d3-ffe0-473c-a1b4-730754cb9430","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "2127856c-b379-459e-9463-192ab4f9a0b9", "policyName": "5d164652-f401-4ae3-acf1-048927eb7a88" }] = reason {
    checkResourceIntegrity
    checkPrincipalId({"13b8f90e-d929-49a9-8f8c-a40bfff0f09e"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x8f8e18dbebb8ca4fc2bc7e3425fcdfd5264e33e8"})
    checkWalletAddress({"0x7a0854f64ded80455208ad6939950d915b2a101e"})
  reason = {"type":"permit","policyId":"2127856c-b379-459e-9463-192ab4f9a0b9","policyName":"5d164652-f401-4ae3-acf1-048927eb7a88","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "abb30749-c59a-410f-bfcb-9ec6b9a703c9", "policyName": "64a3a0e5-8d9c-4b3a-a82a-2271a3f6aacc" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"member"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0xdd7944f5"})
  reason = {"type":"permit","policyId":"abb30749-c59a-410f-bfcb-9ec6b9a703c9","policyName":"64a3a0e5-8d9c-4b3a-a82a-2271a3f6aacc","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "f061b0ad-1833-4a86-8f8f-1ea01ce25cd1", "policyName": "3ecd9a08-abee-4ab3-a15b-d0fbe348240f" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"member"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
    checkChainId({"137"})
    checkIntentHexSignature({"0xef68253d"})
  reason = {"type":"permit","policyId":"f061b0ad-1833-4a86-8f8f-1ea01ce25cd1","policyName":"3ecd9a08-abee-4ab3-a15b-d0fbe348240f","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "9761e668-8a4e-4e27-b1fd-64e0fc45801d", "policyName": "959057f2-ad2c-4d45-a0ec-0c2da6f627c5" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"member"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x4c60051384bd2d3c01bfc845cf5f4b44bcbe9de5"})
    checkChainId({"137"})
    checkIntentHexSignature({"0x3593564c"})
  reason = {"type":"permit","policyId":"9761e668-8a4e-4e27-b1fd-64e0fc45801d","policyName":"959057f2-ad2c-4d45-a0ec-0c2da6f627c5","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "e2b7f5bc-bb5b-429e-b167-77a071dbaa46", "policyName": "d1100363-5283-4a61-b905-dfc760815bff" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"member"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0xdc0479cc5bba033b3e7de9f178607150b3abce1f"})
    checkChainId({"137"})
    checkIntentHexSignature({"0xd2df3a9e"})
  reason = {"type":"permit","policyId":"e2b7f5bc-bb5b-429e-b167-77a071dbaa46","policyName":"d1100363-5283-4a61-b905-dfc760815bff","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "c34076fd-bac8-4777-b467-220f486f412b", "policyName": "8f409d35-aea5-45b2-bbf9-64569fed60ae" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signTransaction"})
    checkIntentType({"transferErc20", "transferNative"})
  reason = {"type":"permit","policyId":"c34076fd-bac8-4777-b467-220f486f412b","policyName":"8f409d35-aea5-45b2-bbf9-64569fed60ae","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "20c68497-52e1-410f-bd4c-7ed0755d4678", "policyName": "20d630d0-5f68-47a8-8e8a-554ed8ab505a" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"member"})
    checkAction({"signTransaction"})
    checkIntentType({"callContract"})
    checkIntentContract({"eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"})
    checkChainId({"137"})
    checkIntentHexSignature({"0xdd86381e"})
  reason = {"type":"permit","policyId":"20c68497-52e1-410f-bd4c-7ed0755d4678","policyName":"20d630d0-5f68-47a8-8e8a-554ed8ab505a","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "11846169-1f99-4e0b-9c94-f0dcdba42d81", "policyName": "ad2488cf-8ab6-41b0-bc9e-41ef61153fec" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"member"})
    checkAction({"signMessage"})
    checkIntentDomain({"version":["1"],"name":["Crypto Unicorns Authentication"]})
  reason = {"type":"permit","policyId":"11846169-1f99-4e0b-9c94-f0dcdba42d81","policyName":"ad2488cf-8ab6-41b0-bc9e-41ef61153fec","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "b886740b-fe1e-405e-b356-6ddea17fe23d", "policyName": "816207da-5679-43d9-90cb-0ae17d3e26df" }] = reason {
    checkResourceIntegrity
    checkPrincipalRole({"admin"})
    checkAction({"signMessage"})
  reason = {"type":"permit","policyId":"b886740b-fe1e-405e-b356-6ddea17fe23d","policyName":"816207da-5679-43d9-90cb-0ae17d3e26df","approvalsSatisfied":[],"approvalsMissing":[]}
  }

  permit[{"policyId": "79b07289-a0b2-495c-afb1-8f9b99045618", "policyName": "8d79f8c1-8c65-441b-9319-ff5c9803bc65" }] = reason {
    checkResourceIntegrity
    checkAction({"signTransaction"})
    checkIntentType({"transferErc20", "transferNative"})
  reason = {"type":"permit","policyId":"79b07289-a0b2-495c-afb1-8f9b99045618","policyName":"8d79f8c1-8c65-441b-9319-ff5c9803bc65","approvalsSatisfied":[],"approvalsMissing":[]}
  }

