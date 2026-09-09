import { Router } from 'express'
import { checkEmailCron } from '../controllers/email.controller.js'

const router = Router()
/**
 * GET /cron-email
 * Vercel Cron Job endpoint — processes queued/failed emails every 10 minutes.
 * Protected by CRON_SECRET header check.
 * (Mounted at /cron-email in server/src/index.ts, so the path here is "/".)
 */
router.get('/', checkEmailCron)

export default router