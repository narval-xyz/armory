package main

seconds_to_nanoseconds(epoch_s) = epoch_s * 1000000000

nanoseconds_to_seconds(epoch_ns) = epoch_ns / 1000000000

now_s = nanoseconds_to_seconds(time.now_ns())

substract_from_date(date, epoch_s) = date - epoch_s
