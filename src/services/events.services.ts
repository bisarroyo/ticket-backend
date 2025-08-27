import { db } from '../database/db.ts'
import {
    eventsTable,
    sectionsTable,
    venuesTable,
    type Schema
} from '../models/schema.ts'
import { eq } from 'drizzle-orm'
import { CustomError } from '../lib/custom-error.ts'

type InsertEventsTable = Schema['InsertEventsTable']
type InsertVenuesTable = Schema['InsertVenuesTable']

export const getEvents = async () => {
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
                venueName: venuesTable.venueName
            }
        })
        .from(eventsTable)
        .orderBy(eventsTable.date)
        .leftJoin(venuesTable, eq(venuesTable.eventId, eventsTable.id))
    if (!events.length) {
        throw new CustomError('No events found', 400)
    }
    return events
}

export const getEventById = async (id: number) => {
    const event = await db
        .select()
        .from(eventsTable)
        .where(eq(eventsTable.id, id))
        .leftJoin(venuesTable, eq(venuesTable.eventId, eventsTable.id))
        .leftJoin(sectionsTable, eq(venuesTable.id, sectionsTable.venueId))
        .all()

    if (!event.length) {
        throw new CustomError('Event not found', 403)
    }

    return event[0]
}

export const createEvent = async (
    data: InsertEventsTable & InsertVenuesTable
) => {
    const newEvent = await db
        .insert(eventsTable)
        .values({
            name: data.name,
            date: new Date(),
            startsAt: new Date(),
            endsAt: new Date(),
            eventImage: data.eventImage || '',
            description: data.description || '',
            status: 'draft',
            isActive: false,
            isOnline: false,
            capacity: 0
        })
        .returning()
    if (!newEvent.length) {
        throw new CustomError('Error creating event', 500)
    }
    const newVenue = await db
        .insert(venuesTable)
        .values({
            venueName: data.venueName || 'Default Venue',
            address: '123 Main St',
            city: 'City',
            state: 'State',
            country: 'Country',
            postalCode: '00000',
            latitude: 0,
            longitude: 0,
            eventId: newEvent[0]?.id
        })
        .returning()
    if (!newVenue) {
        throw new CustomError('Error creating default venue', 500)
    }

    const newSection = await db
        .insert(sectionsTable)
        .values({
            sectionName: 'General Admission',
            price: 0,
            description: 'Default section',
            capacity: 100,
            color: '#FFFFFF',
            isActive: true,
            venueId: newVenue[0]?.id || 1
        })
        .returning()
    if (!newSection) {
        throw new CustomError('Error creating default section', 500)
    }

    return {
        newEvent,
        newVenue,
        newSection
    }
}

export const updateEvent = async (
    data: InsertEventsTable,
    eventId: string,
    userId: string
) => {
    const event = await db
        .select()
        .from(eventsTable)
        .where(eq(eventsTable.id, parseInt(eventId)))

    if (!event.length) {
        throw new Error('Event not found')
    }

    if (event[0]?.userId !== userId) {
        throw new Error('Unauthorized - You can only update your own events')
    }

    const { name, eventImage, description } = data

    const updateData = {
        ...data,
        updatedAt: new Date().toISOString(),
        date: new Date(data.date),
        startsAt: new Date(data.startsAt),
        endsAt: new Date(data.endsAt),
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
        .where(eq(eventsTable.id, parseInt(eventId)))
}

export const deleteEvent = async (id: string, userId: string) => {
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

    const deletedEvent = await db
        .delete(eventsTable)
        .where(eq(eventsTable.id, parseInt(id)))

    return deleteEvent
}
