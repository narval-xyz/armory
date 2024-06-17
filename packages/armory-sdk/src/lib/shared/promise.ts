export class ArmoryPromiseError extends Error {}

/**
 * Pauses the execution for a specified amount of time.
 *
 * @param time - The duration to pause in milliseconds.
 * @returns A Promise that resolves after the specified time has elapsed.
 */
export const sleep = (time: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), time)
  })
}

export type PollingOptions = {
  intervalMs?: number
  timeoutMs?: number
  // After this amount of time, start using exponential backoff
  exponentialBackoffAfterMs?: number
}

/**
 * Executes a polling function until a condition is met or a timeout occurs.
 *
 * @param input - The input object containing the polling function and options.
 * @returns A promise that resolves with the result of the polling function.
 * @throws {ArmoryPromiseError} If the polling times out or ends unexpectedly.
 */
export const polling = async <T>(
  input: {
    fn: () => Promise<T>
    shouldStop: (value: T) => boolean
  } & PollingOptions
): Promise<T> => {
  const timoutMs = input?.timeoutMs || 10_000
  const exponentialBackoffAfterMs = input?.exponentialBackoffAfterMs

  let intervalMs = input?.intervalMs || 1_000

  const startTime = new Date().getTime()
  const keepPolling = true

  do {
    const now = new Date().getTime()
    const elapsedSeconds = now - startTime

    const result = await input.fn()

    if (input.shouldStop(result)) {
      return result
    }

    if (elapsedSeconds > timoutMs) {
      throw new ArmoryPromiseError('Timeout while waiting')
    }

    await sleep(intervalMs)

    // Exponential backoff: double the polling interval each time, up to a
    // maximum of 10 minute.
    if (exponentialBackoffAfterMs && elapsedSeconds > exponentialBackoffAfterMs) {
      intervalMs = Math.min(intervalMs * 2, 10 * 60 * 1000)
    }
  } while (keepPolling)

  throw new ArmoryPromiseError('Polling end up unexpectedly')
}
