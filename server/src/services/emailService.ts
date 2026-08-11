import sendEmail from '../config/email.js'
import { resetPasswordTemplate, verifyAccountTemplate } from '../libs/emailTemplates.js'
import EmailQueue from '../models/emailQueue.js'

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
    const htmlBody = verifyAccountTemplate(otp, link)
    const result = await sendEmail({
      email: user.email,
      subject: 'Verify your account - Techstudio Academy',
      message: htmlBody,
    })
    if (result.success) {
      return { success: true, queued: false }
    }

    await EmailQueue.create({
      to: user.email,
      subject: 'Verify your account - Techstudio Academy',
      html: htmlBody,
      priority: 'high',
      status: 'queued',
      retryCount: 0,
      nextRetryAt: new Date(Date.now() + 5 * 60 * 1000),
    })
    return { success: false, queued: true }
  }

  static async sendPasswordResetEmail({
    user,
    resetLink,
  }: {
    user: any
    resetLink: string
  }): Promise<{ success: boolean; queued: boolean }> {
    const htmlBody = resetPasswordTemplate(resetLink)
    const result = await sendEmail({
      email: user.email,
      subject: 'Reset your password - Techstudio Academy',
      message: htmlBody,
    })
    if (result.success) {
      return { success: true, queued: false }
    }

    await EmailQueue.create({
      to: user.email,
      subject: 'Reset your password - Techstudio Academy',
      html: htmlBody,
      priority: 'high',
      status: 'queued',
      retryCount: 0,
      nextRetryAt: new Date(Date.now() + 5 * 60 * 1000),
    })
    return { success: false, queued: true }
  }
}

export const emailService = new EmailService()
