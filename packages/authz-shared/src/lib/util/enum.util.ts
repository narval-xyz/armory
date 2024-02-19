/* eslint-disable @typescript-eslint/no-explicit-any */
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

export type EnumMap<T> = {
  [K in keyof T]?: any
}

type EnumConverted<T, EnumMap> = {
  [K in keyof T]: K extends keyof EnumMap ? EnumMap[K] : T[K]
}

/**
 * Takes an object and returns a new object with the same keys but with the values converted to enum values for the list of key+enum pairs provided
 */
export const convertEnums = <T extends Record<string, string>>(
  enumMap: EnumMap<T>,
  data: T
): EnumConverted<T, EnumMap<T>> => {
  return Object.entries(data).reduce(
    (acc, [key, value]) => {
      if (key in enumMap) {
        acc[key as keyof T] = toEnum(enumMap[key as keyof EnumMap<T>], value) as EnumConverted<T, EnumMap<T>>[keyof T]
        if (acc[key] === undefined || acc[key] === null) {
          throw new Error(`Invalid enum value for key ${key}: ${value}`)
        }
      } else {
        acc[key as keyof T] = value as EnumConverted<T, EnumMap<T>>[keyof T]
      }
      return acc
    },
    {} as EnumConverted<T, EnumMap<T>>
  )
}

export const convertEnumsArray = <T extends Record<string, string>>(
  enumMap: EnumMap<T>,
  data: T[]
): EnumConverted<T, EnumMap<T>>[] => {
  return data.map((d) => convertEnums(enumMap, d))
}
