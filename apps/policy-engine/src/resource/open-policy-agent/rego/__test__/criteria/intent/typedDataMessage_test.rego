package main

typedData := {
    "typedData": {
        "message": {
            "greeting": "Hello world",
            "farewell": "Goodbye world",
        }
    }
}

test_checkIntentTypedDataMessageCondition {
    conditions := [
        [{"key": "greeting", "value": "Hello world"}],
        [{"key": "farewell", "value": "Goodbye world"}],
    ]

    checkIntentTypedDataMessageCondition(conditions) with input as typedData
}

test_checkIntentTypedDataMessageCondition_fail {
    conditions := [
        [{"key": "greeting", "value": "Hello world"}],
        [{"key": "farewell", "value": "Hello world"}], 
    ]

    not checkIntentTypedDataMessageCondition(conditions) with input as typedData
}
