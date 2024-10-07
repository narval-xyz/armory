package criteria.intent

import data.armory.lib
import rego.v1

checkErc1155TokenId(values) if {
	intentTransfers := input.intent.transfers
	transfer = intentTransfers[_]
	lib.caseInsensitiveFindInSet(transfer.erc1155TokenId, values)
}
