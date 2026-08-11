import axios from 'axios'
import { env } from './keys.js'
import logger, { logError } from './logger.js'

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email'

export interface SendEmailOptions {
  email: string
  subject: string
  message: string
  attachments?: { filename: string; content: Buffer | string }[]
}

export interface SendEmailResult {
  success: boolean
  messageId?: string
  error?: string
}

/**
 * Strip HTML tags and entities for plain-text fallback
 */
const toTextFallback = (html: string): string =>
  html
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim()

/**
 * Low-level send — called by both the named export and cron job.
 */
const sendViaBrevo = async (
  to: string | string[],
  subject: string,
  html: string,
  attachments?: { filename: string; content: Buffer | string }[]
): Promise<SendEmailResult> => {
  try {
    const recipients = (Array.isArray(to) ? to : [to]).map(email => ({ email }))

    const payload: Record<string, any> = {
      sender: { name: 'Techstudio Academy', email: env.EMAIL_OWNER || 'onboarding@eventra.com' },
      to: recipients,
      subject,
      htmlContent: html,
      textContent: toTextFallback(html),
    }

    if (attachments && attachments.length > 0) {
      payload.attachments = attachments.map(att => ({
        name: att.filename,
        content:
          typeof att.content === 'string'
            ? Buffer.from(att.content).toString('base64')
            : att.content.toString('base64'),
      }))
    }

    const response = await axios.post(BREVO_API_URL, payload, {
      headers: {
        'api-key': env.BREVO_API_KEY,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      timeout: 15000,
    })

    if (env.NODE_ENV === 'development') {
      logger.info(`Email sent successfully via Brevo! Message ID: ${response.data.messageId}`)
    }

    return { success: true, messageId: response.data.messageId }
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : String(error)
    const errorData = error && typeof error === 'object' && 'response' in error
      ? (error as any).response?.data
      : undefined

    logError(error, 'Brevo email sending failed', {
      message: errMessage,
      details: errorData || 'No additional details',
    })

    return { success: false, error: errMessage }
  }
}

/**
 * Named export — accepts individual args. Used by the cron job.
 */
export const sendEmail = async (to: string | string[], subject: string, html: string): Promise<SendEmailResult> => {
  return sendViaBrevo(to, subject, html)
}

/**
 * Default export — accepts an options object. Used by EmailService.
 */
const sendEmailWithOptions = async (options: SendEmailOptions): Promise<SendEmailResult> => {
  return sendViaBrevo(options.email, options.subject, options.message, options.attachments)
}

export default sendEmailWithOptions
