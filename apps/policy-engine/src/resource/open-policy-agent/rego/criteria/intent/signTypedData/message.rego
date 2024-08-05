package main

typedDataMessageKeyValueCheck(conditions) {
  count(conditions) > 0
	inputMessage = input.typedData.message
    checkedConditions = [condition | 
    	condition = conditions[_]
        inputMessage[condition.key] == condition.value
    ]
    count(checkedConditions) == count(conditions)
}

typedDataMessageCondition(args) {
  count(args) > 0
	checkedArgs = [singleCondition | 
    	singleCondition = args[_]
        typedDataMessageKeyValueCheck(singleCondition)
    ]
  count(checkedArgs) > 0
}