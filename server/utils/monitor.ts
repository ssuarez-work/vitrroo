interface MonitorContext {
  [key: string]: unknown
}

const logger = createLogger('monitor')

export const captureError = (error: unknown, context: MonitorContext = {}): void => {
  const message = error instanceof Error ? error.message : String(error)
  const stack = error instanceof Error ? error.stack : undefined
  logger.error(message, { ...context, stack })
}

export const captureWarning = (message: string, context: MonitorContext = {}): void => {
  logger.warn(message, context)
}
