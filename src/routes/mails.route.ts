import { Router } from 'express'

import { sendEmail } from '../controllers/mails.controller.ts'

const router = Router()

router.post('/send', sendEmail)
// router.get('/id', getClientById)
// router.get('/email', getClientByEmail)
// router.get('/name', getClientByName)
// router.post('/create', insertClient)
// router.put('/update', updateClient)
// router.delete('/remove', removeClient)

export default router
