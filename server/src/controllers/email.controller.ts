import { Request, Response } from 'express'
import { env } from '../config/keys.js'
import { startEmailCron } from '../jobs/emailCron.js'
import { sendTsRestError, sendTsRestSuccess } from '../libs/responseHandler.js'
import tryCatchWrapper from '../libs/tryCatchWrapper.js'

export const checkEmailCron = tryCatchWrapper(async (req: Request, res: Response) => {
  const cronSecret = req.headers['x-cron-secret']

  if (!cronSecret || cronSecret !== env.CRON_SECRET) {
    return sendTsRestError(res, 401, 'Unauthorized: invalid or missing CRON_SECRET')
  }

  const result = await startEmailCron()

  return sendTsRestSuccess(res, 200, {
    success: true,
    message: 'Email cron job completed',
    body: result,
  })
})