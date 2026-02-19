import pino from 'pino'

const logLevel = process.env.LOG_LEVEL || 'info'

export const logger = pino({
  level: logLevel,
  transport:
    process.env.NODE_ENV === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
  formatters: {
    level: (label) => ({ level: label }),
  },
})

export function createAuditLog(
  userId: string | null,
  action: string,
  entity: string,
  entityId: string | null,
  oldData: unknown,
  newData: unknown,
  ipAddress: string | null,
  userAgent: string | null
) {
  return {
    userId,
    action,
    entity,
    entityId,
    oldData: oldData ? JSON.parse(JSON.stringify(oldData)) : null,
    newData: newData ? JSON.parse(JSON.stringify(newData)) : null,
    ipAddress,
    userAgent,
  }
}
