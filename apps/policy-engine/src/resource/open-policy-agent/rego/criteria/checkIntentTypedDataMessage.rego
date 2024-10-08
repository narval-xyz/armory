package main

import rego.v1

import data.armory.constants

typedDataMessageKeyValueCheck(conditions) if {
	count(conditions) > 0
	inputMessage = input.intent.typedData.message
	checkedConditions = [condition |
		some condition in conditions
		inputMessage[condition.key] == condition.value
	]
	count(checkedConditions) == count(conditions)
}

checkIntentTypedDataMessage(args) if {
	count(args) > 0
	checkedArgs = [singleCondition |
		some singleCondition in args
		typedDataMessageKeyValueCheck(singleCondition)
	]
	count(checkedArgs) > 0
}
