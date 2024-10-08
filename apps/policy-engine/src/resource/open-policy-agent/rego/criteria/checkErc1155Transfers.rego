package criteria

import data.armory.lib
import rego.v1

checkErc1155Transfers(conditions) if {
	intentTransfers := input.intent.transfers
	matches = [e |
		some transfer in intentTransfers
		some condition in conditions
		lib.caseInsensitiveEqual(transfer.erc1155TokenId, condition.erc1155TokenId)

		e = [transfer, condition]
	]

	validTransfers = [transfer |
		some m in matches
		transfer = m[0]
		condition = m[1]
  checkTransferAmount(transfer.amount, condition)
	]

	count(intentTransfers) == count(validTransfers)
}
