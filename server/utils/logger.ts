type LogLevel = 'info' | 'warn' | 'error'

interface LogContext {
  [key: string]: unknown
}

const format = (level: LogLevel, scope: string, message: string, context?: LogContext): string => {
  const timestamp = new Date().toISOString()
  const ctx = context ? ` ${JSON.stringify(context)}` : ''
  return `[${timestamp}] ${level.toUpperCase()} [${scope}] ${message}${ctx}`
}

export const createLogger = (scope: string) => ({
  info(message: string, context?: LogContext) {
    console.log(format('info', scope, message, context))
  },
  warn(message: string, context?: LogContext) {
    console.warn(format('warn', scope, message, context))
  },
  error(message: string, context?: LogContext) {
    console.error(format('error', scope, message, context))
  }
})
