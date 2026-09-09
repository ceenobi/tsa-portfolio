import { Router } from 'express'
import { checkEmailCron } from '../controllers/email.controller.js'
import { verifyCronSecret } from '../middlewares/auth.middleware.js'

const router = Router()
/**
 * GET /cron-email
 * Scheduled cron endpoint — processes queued/failed emails every 10 minutes.
 * Protected by CRON_SECRET header check.
 * (Mounted at /cron-email in server/src/index.ts, so the path here is "/".)
 */
router.get('/', verifyCronSecret, checkEmailCron)

export default router