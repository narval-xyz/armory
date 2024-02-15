export const decodeConstant = <T, K extends keyof T, V extends T[K]>(
  response: T,
  key: K,
  validValues: V[]
): T & Record<K, V> => {
  if (!validValues.includes(response[key] as V)) {
    throw new Error(`Invalid value for key ${key as string}: ${response[key]}`)
  }

  return {
    ...response,
    [key]: response[key] as V
  } as T & Record<K, V>
}
