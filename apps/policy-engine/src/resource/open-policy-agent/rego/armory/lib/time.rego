package armory.lib

import rego.v1

# DON'T CHANGE 01 AND 02
# 01 always displays current month
# 02 always displays current day
dateFormat := "2006-01-02" # YYYY-MM-DD

todayFormatted := time.format([time.now_ns(), "UTC", dateFormat])

nowSeconds := nanoSecondsToSeconds(time.now_ns())

secondsToNanoSeconds(epochSec) := epochSec * 1000000000

nanoSecondsToSeconds(epochNs) := epochNs / 1000000000

getStartDateInNanoSeconds(period) := result if {
	period == "1d"
	result = time.parse_ns(dateFormat, todayFormatted)
}

getStartDateInNanoSeconds(period) := result if {
	period == "1m"
	todayArr = split(todayFormatted, "-")
	startMonth = concat("-", [todayArr[0], todayArr[1], "01"])
	result = time.parse_ns(dateFormat, startMonth)
}

getStartDateInNanoSeconds(period) := result if {
	period == "1y"
	todayArr = split(todayFormatted, "-")
	startYear = concat("-", [todayArr[0], "01", "01"])
	result = time.parse_ns(dateFormat, startYear)
}
