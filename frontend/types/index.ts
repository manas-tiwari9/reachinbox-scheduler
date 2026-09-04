export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  slackConnected?: boolean
}

export interface EmailJob {
  id: string
  recipientEmail: string
  subject: string
  body: string
  senderEmail: string
  scheduledAt: string
  sentAt?: string
  status: 'scheduled' | 'sent' | 'failed' | 'rate_limited'
  etherealUrl?: string
  errorMessage?: string
  createdAt: string
}

export interface ScheduleEmailPayload {
  subject: string
  body: string
  senderEmail: string
  startTime: string
  delayBetweenMs: number
  hourlyLimit: number
  csvFile: File
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}
