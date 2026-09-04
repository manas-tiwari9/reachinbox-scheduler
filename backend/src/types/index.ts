// ─── Authenticated user information stored in JWT ────────────
export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
}

// ─── Request body structure for scheduling emails ─────────────
export interface ScheduleEmailRequest {
  subject: string;
  body: string;
  senderEmail: string;
  startTime: string; // ISO date string
  delayBetweenMs: number;
  hourlyLimit: number;
  recipients: string[];
}

// ─── Job data payload for BullMQ ──────────────────────────────
export interface EmailJobData {
  emailJobId: string;
  recipientEmail: string;
  subject: string;
  body: string;
  senderEmail: string;
  userId: string;
  hourlyLimit: number;
  delayBetweenMs: number;
}

// ─── Extend Express Request to carry our authenticated user ───
// We extend Express.User (the standard interface) instead of
// Request.user directly to avoid the "subsequent property" clash.
declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface User extends AuthenticatedUser {}
  }
}
