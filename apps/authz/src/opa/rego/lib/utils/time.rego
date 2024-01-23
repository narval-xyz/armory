package main

secondsToNanoSeconds(epochS) = epochS * 1000000000

nanoSecondsToSeconds(epochNs) = epochNs / 1000000000

nowSeconds = nanoSecondsToSeconds(time.now_ns())
