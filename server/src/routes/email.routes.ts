import { Router } from 'express'
import { checkEmailCron } from '../controllers/email.controller.js'

const router = Router()
/**
 * GET /api/cron-email
 * Vercel Cron Job endpoint — processes queued/failed emails every 10 minutes.
 * Protected by CRON_SECRET header check.
 */
router.get('/cron-email', checkEmailCron)

export default router