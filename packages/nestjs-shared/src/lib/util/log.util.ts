import { LoggerService } from '../module/logger/service/logger.service'

export const startExecutionTimer = (logger: LoggerService, id: string, startContext?: Record<string, unknown>) => {
  const startTime = new Date().getTime()

  logger.log(`Execution time of ${id} - Start`, {
    ...(startContext ? { ...startContext } : {}),
    startTime
  })

  return {
    stop: (stopContext?: Record<string, unknown>) => {
      const stopTime = new Date().getTime()
      const duration = stopTime - startTime

      logger.log(`Execution time of ${id} - Stop`, {
        ...(startContext ? { ...startContext } : {}),
        ...(stopContext ? { ...stopContext } : {}),
        startTime,
        stopTime,
        duration
      })
    }
  }
}

export const withExecutionTime = <T>({
  logger,
  id,
  startContext,
  thunk
}: {
  logger: LoggerService
  id: string
  thunk: () => T | Promise<T>
  startContext?: Record<string, unknown>
}): T | Promise<T> => {
  const timer = startExecutionTimer(logger, id, startContext)
  const result = thunk()

  if (result instanceof Promise) {
    return result.then(
      (value) => {
        timer.stop()

        return value
      },
      (error) => {
        timer.stop()
        throw error
      }
    )
  }

  timer.stop()

  return result
}
