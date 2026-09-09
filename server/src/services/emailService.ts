import { resetPasswordTemplate, verifyAccountTemplate } from '../libs/emailTemplates.js'
import { triggerImmediateDelivery } from '../jobs/emailCron.js'
import EmailQueue from '../models/emailQueue.js'

/**
 * Auth emails are queue-first: persist immediately (due now), then attempt
 * delivery in the background without blocking the API response. The
 * scheduled cron is the backstop; the atomic claim prevents double-sends
 * when both paths overlap.
 */
const queueEmail = async (to: string, subject: string, html: string): Promise<void> => {
  await EmailQueue.create({
    to,
    subject,
    html,
    priority: 'high',
    status: 'queued',
    retryCount: 0,
    nextRetryAt: new Date(),
  })
  triggerImmediateDelivery()
}

export class EmailService {
  static async sendVerifyAccountEmail({
    user,
    otp,
    link,
  }: {
    user: any
    otp: string
    link: string
  }): Promise<{ success: boolean; queued: boolean }> {
    const greeting = user.email.split('@')[0]
    const htmlBody = verifyAccountTemplate(otp, link, greeting)
    await queueEmail(user.email, 'Verify your account - Techstudio Academy', htmlBody)
    return { success: true, queued: true }
  }

  static async sendPasswordResetEmail({
    user,
    resetLink,
  }: {
    user: any
    resetLink: string
  }): Promise<{ success: boolean; queued: boolean }> {
    const greeting = user.email.split('@')[0]
    const htmlBody = resetPasswordTemplate(resetLink, greeting)
    await queueEmail(user.email, 'Reset your password - Techstudio Academy', htmlBody)
    return { success: true, queued: true }
  }
}

export const emailService = new EmailService()
