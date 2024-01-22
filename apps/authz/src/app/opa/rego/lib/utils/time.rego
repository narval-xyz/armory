package main

secondsToNanoseconds(epochS) = epochS * 1000000000

nanosecondsToSeconds(epochNs) = epochNs / 1000000000

nowS = nanosecondsToSeconds(time.now_ns())

substractFromDate(date, epochS) = date - epochS

addToDate(date, epochS) = date + epochS
