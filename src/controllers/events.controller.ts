import type { Request, Response } from 'express'
import { CustomError } from '../lib/custom-error.js'
import * as eventsService from '../services/events.services.ts'

interface AuthRequest extends Request {
    auth: {
        userId: string
    }
}

export const getAllEvents = async (req: Request, res: Response) => {
    try {
        const events = await eventsService.getEvents()

        return res.status(200).json(events).header({
            'Content-Type': 'application/json'
        })
    } catch (error) {
        throw new CustomError('Error getting events', 500)
    }
}

export const getEventById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        if (!id) throw new CustomError('Event ID is required', 400)

        const event = await eventsService.getEventById(parseInt(id))

        return res.status(200).json(event)
    } catch (error) {
        throw new CustomError('Error getting event', 500)
    }
}

export const createEvent = async (req: Request, res: Response) => {
    try {
        // todo validate user
        // todo validate input
        // todo concatenat venues and sections creation
        const eventData = req.body

        const newEvent = await eventsService.createEvent(eventData)

        res.status(201).json(newEvent)
    } catch (error) {
        if (error instanceof CustomError) throw error
        throw new CustomError('Error creating event', 500)
    }
}

export const updateEvent = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const updateData = req.body
        if (!id) throw new CustomError('Event ID is required', 400)

        const userId = '123' // temp fallback userId for testing
        if (!userId) {
            throw new CustomError('Unauthorized', 401)
        }

        const updatedEvent = await eventsService.updateEvent(
            updateData,
            id,
            userId
        )

        return res.status(200).json({ message: 'Event updated successfully' })
    } catch (error) {
        if (error instanceof CustomError) throw error
        throw new CustomError('Error updating event', 500)
    }
}

export const deleteEvent = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        if (!id) throw new CustomError('Event ID is required', 400)

        const userId = '123'
        if (!userId) {
            throw new CustomError('Unauthorized', 401)
        }

        const event = await eventsService.deleteEvent(id, userId)

        return res.status(200).json({ message: 'Event deleted successfully' })
    } catch (error) {
        if (error instanceof CustomError) throw error
        throw new CustomError('Error deleting event', 500)
    }
}
