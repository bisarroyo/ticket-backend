import { Router } from 'express'

import {
    getTicketById,
    getTicketsByUser,
    createTicket,
    markTicketAsUsed,
    getTicketsByEvent,
    deleteTicket
} from '../controllers/tickets.controller.js'

const router = Router()

// Public
router.get('/event/:id', getTicketsByEvent)
router.get('/:id', getTicketById)
router.get('/user', getTicketsByUser)

// Protected
// router.post('/', requireAuth(), createTicket)
// router.patch('/:id/use', requireAuth(), markTicketAsUsed)
// router.delete('/:id', requireAuth(), deleteTicket)
router.post('/', createTicket)
router.patch('/:id/use', markTicketAsUsed)
router.delete('/:id', deleteTicket)

router.get('/', (req, res) => {
    res.send('Ticket route is working!')
})

export default router
