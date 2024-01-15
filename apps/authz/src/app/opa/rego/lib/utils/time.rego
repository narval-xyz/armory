package main

seconds_to_nanoseconds(epoch_s) = epoch_ns {
	epoch_ns := epoch_s * 1000000000
}

nanoseconds_to_seconds(epoch_ns) = epoch_s {
	epoch_s := epoch_ns / 1000000000
}

now_s = now {
	now := nanoseconds_to_seconds(time.now_ns())
}
