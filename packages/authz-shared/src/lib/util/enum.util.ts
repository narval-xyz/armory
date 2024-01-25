/**
 * Converts a string value to an enum value.
 *
 * @param enumType - The enum object.
 * @param value - The string value to convert.
 * @returns The corresponding enum value if found, otherwise null.
 */
export const toEnum = <Enum extends Record<string, string>>(enumType: Enum, value: string): Enum[keyof Enum] | null => {
  if (value in enumType) {
    return enumType[value as keyof typeof enumType]
  }

  return null
}
