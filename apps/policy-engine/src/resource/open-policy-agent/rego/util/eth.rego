package armory.util.eth

isAddressEqual(a, b) = result {
    lower_a := lower(a)
    lower_b := lower(b)
    result := (lower_a == lower_b)
}