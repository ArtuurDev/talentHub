export enum HealthStatusEnum {
  HEALTHY = 'HEALTHY',
  UNHEALTHY = 'UNHEALTHY',
  DEGRADED = 'DEGRADED'
}

export interface ServiceHealth {
  name: string
  url: string
  status: HealthStatusEnum
  responseTime: number
  lastCheck: number
  error?: Error
}
