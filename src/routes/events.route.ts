import { Router } from 'express'

import { requireAuth, getAuth } from '@clerk/express'

import {
    getAllEvents,
    getEventById,
    createEvent
    //   updateEvent,
    //   deleteEvent,
} from '../controllers/events.controller.js'

const router = Router()

// Public routes
router.get('/', getAllEvents)
router.get('/:id', getEventById)

// Protected routes
router.post('/create', createEvent)
// router.put("/:id", updateEvent);
// router.delete("/:id", deleteEvent);

export default router
