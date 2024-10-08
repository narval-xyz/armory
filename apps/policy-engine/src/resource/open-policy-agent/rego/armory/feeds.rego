package armory.feeds

import rego.v1

import data.armory.constants

priceFeed := result if {
	some feed in input.feeds
	feed.source == "armory/price-feed"
	result = feed.data
}

transferFeed := result if {
	some feed in input.feeds
	feed.source == "armory/historical-transfer-feed"
	result = feed.data
}
