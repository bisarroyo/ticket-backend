import type { Request, Response } from 'express'
import { db } from '../database/db.ts'
import {
    eventsTable,
    sectionsTable,
    venuesTable,
    type Schema
} from '../models/schema.js'
import { eq } from 'drizzle-orm'
import { CustomError } from '../lib/custom-error.js'

interface AuthRequest extends Request {
    auth: {
        userId: string
    }
}

type InsertEventsTable = Schema['InsertEventsTable']

export const getAllEvents = async (req: Request, res: Response) => {
    try {
        const events = await db
            .select({
                events: {
                    id: eventsTable.id,
                    name: eventsTable.name,
                    date: eventsTable.date,
                    eventImage: eventsTable.eventImage
                },
                venues: {
                    id: venuesTable.id,
                    name: venuesTable.name
                }
            })
            .from(eventsTable)
            .orderBy(eventsTable.date)
            .leftJoin(venuesTable, eq(venuesTable.eventId, eventsTable.id))

        if (!events.length) {
            throw new CustomError('No events found', 404)
        }
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

        const event = await db
            .select()
            .from(eventsTable)
            .where(eq(eventsTable.id, Number(id)))
            .leftJoin(venuesTable, eq(venuesTable.eventId, eventsTable.id))
            .leftJoin(sectionsTable, eq(venuesTable.id, sectionsTable.venueId))
            .all()

        console.log(event)

        if (!event.length) {
            throw new CustomError('Event not found', 404)
        }

        return res.status(200).json(event[0])
    } catch (error) {
        if (error instanceof CustomError) throw error
        throw new CustomError('Error getting event', 500)
    }
}

export const createEvent = async (req: Request, res: Response) => {
    try {
        // todo validate user
        // todo validate input
        // todo concatenat venues and sections creation
        const { name, eventImage, description } = req.body
        const newEvent = await db.insert(eventsTable).values({
            name,
            date: new Date(),
            startsAt: new Date(),
            endsAt: new Date(),
            eventImage,
            description,
            status: 'draft',
            isActive: false,
            isOnline: false,
            capacity: 0
        })
        console.log(newEvent)
        res.status(201).json(newEvent)
    } catch (error) {
        if (error instanceof CustomError) throw error
        throw new CustomError('Error creating event', 500)
    }
}

export const updateEvent = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const { name, eventImage, description } = req.body
        if (!id) throw new CustomError('Event ID is required', 400)

        const userId = '123' // temp fallback userId for testing
        if (!userId) {
            throw new CustomError('Unauthorized', 401)
        }

        const event = await db
            .select()
            .from(eventsTable)
            .where(eq(eventsTable.id, parseInt(id)))

        if (!event.length) {
            throw new CustomError('Event not found', 404)
        }

        if (event[0]?.userId !== userId) {
            throw new CustomError(
                'Unauthorized - You can only update your own events',
                403
            )
        }

        const updateData = {
            ...req.body,
            updatedAt: new Date().toISOString(),
            date: new Date(req.body.date),
            startsAt: new Date(req.body.startsAt),
            endsAt: new Date(req.body.endsAt),
            eventImage,
            description,
            status: 'draft',
            isActive: false,
            isOnline: false,
            capacity: 0
        }

        await db
            .update(eventsTable)
            .set(updateData)
            .where(eq(eventsTable.id, parseInt(id)))

        return res.status(200).json({ message: 'Event updated successfully' })
    } catch (error) {
        if (error instanceof CustomError) throw error
        throw new CustomError('Error updating event', 500)
    }
}

export const deleteEvent = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params
        if (!id) throw new CustomError('Event ID is required', 400)

        const userId = req.auth?.userId
        if (!userId) {
            throw new CustomError('Unauthorized', 401)
        }

        const event = await db
            .select()
            .from(eventsTable)
            .where(eq(eventsTable.id, parseInt(id)))

        if (!event.length) {
            throw new CustomError('Event not found', 404)
        }

        if (event[0]?.userId !== userId) {
            throw new CustomError(
                'Unauthorized - You can only delete your own events',
                403
            )
        }

        await db.delete(eventsTable).where(eq(eventsTable.id, parseInt(id)))

        return res.status(200).json({ message: 'Event deleted successfully' })
    } catch (error) {
        if (error instanceof CustomError) throw error
        throw new CustomError('Error deleting event', 500)
    }
}
