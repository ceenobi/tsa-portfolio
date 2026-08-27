import { DeleteMediaSchema, UploadSchema } from '@tsa/shared';
import { Router } from 'express';
import { deleteFile, uploadFile } from '../controllers/upload.controller.js';
import { requireRole } from '../middlewares/auth.middleware.js';
import { customRateLimiter } from '../middlewares/rateLimit.middleware.js';
import { validateFormData } from '../middlewares/schema.middleware.js';

const router = Router()

router.post('/', customRateLimiter(5), requireRole('admin', 'super_admin'), validateFormData(UploadSchema), uploadFile)
router.delete(
  '/delete',
  customRateLimiter(5),
  requireRole('admin', 'super_admin'),
  validateFormData(DeleteMediaSchema),
  deleteFile
)

export default router
