import { sendEmail } from '../config/email.js';
import logger from '../config/logger.js'
import EmailQueue from '../models/emailQueue.js'

const BATCH_SIZE = 10

/**
 * Calculate exponential backoff delay in milliseconds.
 * Retry 1 → 5 min, Retry 2 → 25 min, Retry 3 → 125 min, etc.
 */
const getBackoffDelay = (retryCount: number): number => {
  return Math.min(Math.pow(5, retryCount) * 60 * 1000, 24 * 60 * 60 * 1000) // cap at 24h
}

/**
 * Atomically claim a queued email for delivery. Returns null when another
 * worker (cron tick or immediate drain) already claimed it — the guard
 * against double-sending.
 */
const claimEmail = async (id: unknown) => {
  return EmailQueue.findOneAndUpdate(
    { _id: id, status: { $in: ['queued', 'failed'] } },
    { $set: { status: 'sending' } },
    { new: true },
  ).lean()
}

/**
 * Process queued and failed emails that are due for retry.
 * Called by the scheduled cron job (GET /cron-email) every 10 minutes.
 */
export const startEmailCron = async (): Promise<{ processed: number; sent: number; failed: number }> => {
  let sent = 0
  let failed = 0

  try {
    const dueEmails = await EmailQueue.find({
      status: { $in: ['queued', 'failed'] },
      $or: [{ nextRetryAt: { $lte: new Date() } }, { nextRetryAt: { $exists: false } }],
      $expr: { $lt: ['$retryCount', '$maxRetries'] },
    })
      .sort({ priority: -1, queuedAt: 1 })
      .limit(BATCH_SIZE)
      .lean()

    if (dueEmails.length === 0) {
      logger.info('Email cron: no emails due for processing')
      return { processed: 0, sent: 0, failed: 0 }
    }

    logger.info({ count: dueEmails.length }, `Email cron: processing ${dueEmails.length} email(s)`)

    for (const email of dueEmails) {
      const claimed = await claimEmail(email._id)
      if (!claimed) continue // taken by a concurrent worker
      if (claimed.retryCount >= claimed.maxRetries) {
        await EmailQueue.updateOne(
          { _id: email._id },
          { $set: { status: 'failed', lastError: 'Max retries exceeded' } },
        )
        failed++
        continue
      }
      try {
        const result = await sendEmail(claimed.to, claimed.subject, claimed.html)

        if (result.success) {
          await EmailQueue.deleteOne({ _id: email._id })
          sent++
          logger.info({ emailId: email._id }, 'Email sent successfully')
        } else {
          throw new Error(result.error || 'Send returned failure')
        }
      } catch (error: unknown) {
        const errMsg = error instanceof Error ? error.message : 'Unknown error'
        const errStack = error instanceof Error ? error.stack : undefined

        const nextRetryAt = new Date(Date.now() + getBackoffDelay(claimed.retryCount + 1))

        await EmailQueue.updateOne(
          { _id: email._id },
          {
            $set: {
              status: 'failed',
              lastError: errMsg,
              lastErrorStack: errStack,
              nextRetryAt,
              failedAt: new Date(),
            },
            $inc: { retryCount: 1 },
          }
        )
        failed++
        logger.error({ emailId: email._id, error: errMsg, retryCount: claimed.retryCount + 1 }, 'Email send failed')
      }
    }

    logger.info({ sent, failed }, 'Email cron: batch complete')
    return { processed: dueEmails.length, sent, failed }
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error'
    logger.error({ err: error }, `Email cron: error querying email queue: ${errMsg}`)
    return { processed: 0, sent: 0, failed: 0 }
  }
}

let immediateDrainInFlight = false

/**
 * Fire-and-forget delivery attempt for freshly queued mail (auth flows).
 * Keeps OTP/reset emails arriving in seconds without blocking the API
 * response; the scheduled cron remains the backstop. Never throws.
 */
export const triggerImmediateDelivery = (): void => {
  if (immediateDrainInFlight) return
  immediateDrainInFlight = true
  startEmailCron()
    .catch((error: unknown) => {
      logger.error({ err: error }, 'Immediate email delivery failed')
    })
    .finally(() => {
      immediateDrainInFlight = false
    })
}

export default { startEmailCron }
