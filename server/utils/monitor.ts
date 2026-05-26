interface MonitorContext {
  [key: string]: unknown
}

interface ErrorReporter {
  captureException: (error: unknown, context?: MonitorContext) => void
  captureMessage: (message: string, context?: MonitorContext) => void
}

const logger = createLogger('monitor')

const consoleReporter: ErrorReporter = {
  captureException(error, context) {
    const message = error instanceof Error ? error.message : String(error)
    const stack = error instanceof Error ? error.stack : undefined
    logger.error(message, { ...context, stack })
  },
  captureMessage(message, context) {
    logger.warn(message, context)
  }
}

let cachedReporter: ErrorReporter | null = null

interface SentryModule {
  init: (config: { dsn: string, tracesSampleRate: number }) => void
  captureException: (error: unknown, options?: { extra?: MonitorContext }) => void
  captureMessage: (message: string, options?: { extra?: MonitorContext }) => void
}

const loadSentryModule = async (): Promise<SentryModule | null> => {
  const moduleName = '@sentry/node'
  try {
    const loaded = await import(moduleName) as SentryModule | { default: SentryModule } | null
    if (!loaded) return null
    return 'default' in loaded ? loaded.default : loaded
  } catch {
    return null
  }
}

const buildSentryReporter = async (dsn: string): Promise<ErrorReporter | null> => {
  const sentry = await loadSentryModule()
  if (!sentry) return null
  try {
    sentry.init({ dsn, tracesSampleRate: 0.05 })
    return {
      captureException(error, context) {
        sentry.captureException(error, { extra: context })
      },
      captureMessage(message, context) {
        sentry.captureMessage(message, { extra: context })
      }
    }
  } catch (error) {
    logger.warn('Sentry init failed, falling back to console', { error: String(error) })
    return null
  }
}

const resolveReporter = async (): Promise<ErrorReporter> => {
  if (cachedReporter) return cachedReporter
  const dsn = process.env.NUXT_SENTRY_DSN
  if (dsn) {
    const sentry = await buildSentryReporter(dsn)
    if (sentry) {
      cachedReporter = sentry
      return sentry
    }
  }
  cachedReporter = consoleReporter
  return cachedReporter
}

export const captureError = (error: unknown, context: MonitorContext = {}): void => {
  void resolveReporter().then((reporter) => reporter.captureException(error, context))
}

export const captureWarning = (message: string, context: MonitorContext = {}): void => {
  void resolveReporter().then((reporter) => reporter.captureMessage(message, context))
}
