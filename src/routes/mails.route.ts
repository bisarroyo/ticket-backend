import { Router } from 'express'

import { sendEmail } from '../controllers/mails.controller.ts'

const router = Router()

router.post('/send', sendEmail)

export default router
