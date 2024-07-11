package main

dateFormat = "2006-01-01"

secondsToNanoSeconds(epochS) = epochS * 1000000000

nanoSecondsToSeconds(epochNs) = epochNs / 1000000000

nowSeconds = nanoSecondsToSeconds(time.now_ns())

todayFormatted = time.format([time.now_ns(), "UTC", dateFormat])

getStartDateInNanoSeconds(period) = result {
	period == "1d"
	result = time.parse_ns(dateFormat, todayFormatted)
}

getStartDateInNanoSeconds(period) = result {
	period == "1m"
	todayArr = split(todayFormatted, "-")
	startMonth = concat("-", [todayArr[0], todayArr[1], "01"])
	result = time.parse_ns(dateFormat, startMonth)
}

getStartDateInNanoSeconds(period) = result {
	period == "1y"
	todayArr = split(todayFormatted, "-")
	startYear = concat("-", [todayArr[0], "01", "01"])
	result = time.parse_ns(dateFormat, startYear)
}