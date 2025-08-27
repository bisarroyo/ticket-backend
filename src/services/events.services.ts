import { db } from '../database/db.js'
import {
    eventsTable,
    sectionsTable,
    venuesTable,
    type Schema
} from '../models/schema.js'
import { eq } from 'drizzle-orm'
import { CustomError } from '../lib/custom-error.js'

type InsertEventsTable = Schema['InsertEventsTable']
type InsertVenuesTable = Schema['InsertVenuesTable']
type InsertSectionsTable = Schema['InsertSectionsTable']

interface EventData
    extends Omit<
        InsertEventsTable,
        'updatedAt' | 'status' | 'isActive' | 'isOnline' | 'capacity'
    > {
    isActive?: boolean
    isOnline?: boolean
    status?: string
}

interface VenueData extends Omit<InsertVenuesTable, 'eventId'> {}

interface SectionData extends Omit<InsertSectionsTable, 'venueId'> {}

interface CreateEventRequest {
    event: EventData
    venue: VenueData
    sections: SectionData[]
}

interface UpdateEventRequest {
    event?: Partial<EventData>
    venue?: Partial<VenueData>
    sections?: SectionData[]
}

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

export const createEvent = async (data: CreateEventRequest) => {
    // Create event
    const newEvent = await db
        .insert(eventsTable)
        .values({
            name: data.event.name,
            date: new Date(data.event.date),
            startsAt: new Date(data.event.startsAt),
            endsAt: new Date(data.event.endsAt),
            eventImage: data.event.eventImage || '',
            description: data.event.description || '',
            status: data.event.status || 'draft',
            isActive: data.event.isActive || false,
            isOnline: data.event.isOnline || false,
            capacity: 0,
            userId: data.event.userId
        })
        .returning()

    if (!newEvent.length) {
        throw new CustomError('Error creating event', 500)
    }

    const eventId = newEvent[0]?.id
    if (!eventId) {
        throw new CustomError('Error creating event: Invalid event ID', 500)
    }

    // Create venue
    const newVenue = await db
        .insert(venuesTable)
        .values({
            venueName: data.venue.venueName,
            address: data.venue.address || '',
            city: data.venue.city || '',
            state: data.venue.state || '',
            country: data.venue.country || '',
            postalCode: data.venue.postalCode || '',
            latitude: data.venue.latitude || 0,
            longitude: data.venue.longitude || 0,
            eventId
        })
        .returning()

    if (!newVenue.length) {
        // Si falla la creación del venue, eliminamos el evento
        await db.delete(eventsTable).where(eq(eventsTable.id, eventId))
        throw new CustomError('Error creating venue', 500)
    }

    const venueId = newVenue[0]?.id
    if (!venueId) {
        await db.delete(eventsTable).where(eq(eventsTable.id, eventId))
        throw new CustomError('Error creating venue: Invalid venue ID', 500)
    }

    // Create sections
    let newSections = []
    try {
        // Si no hay secciones en el request, crear una sección por defecto
        const sectionsToCreate =
            data.sections?.length > 0
                ? data.sections
                : [
                      {
                          sectionName: 'General Admission',
                          price: 0,
                          description: 'Default section',
                          capacity: 100,
                          color: '#FFFFFF',
                          isActive: true
                      }
                  ]

        // Insertar todas las secciones
        newSections = await db
            .insert(sectionsTable)
            .values(
                sectionsToCreate.map((section) => ({
                    ...section,
                    venueId
                }))
            )
            .returning()

        if (!newSections.length) {
            throw new Error('Error creating sections')
        }
    } catch (error) {
        // Si falla la creación de secciones, eliminamos el venue y el evento
        await db.delete(venuesTable).where(eq(venuesTable.id, venueId))
        await db.delete(eventsTable).where(eq(eventsTable.id, eventId))
        throw new CustomError('Error creating sections', 500)
    }

    // Calcular la capacidad total del evento sumando la capacidad de todas las secciones
    const totalCapacity = newSections.reduce(
        (sum, section) => sum + (section.capacity || 0),
        0
    )

    // Actualizar la capacidad total del evento
    await db
        .update(eventsTable)
        .set({ capacity: totalCapacity })
        .where(eq(eventsTable.id, eventId))

    return {
        event: newEvent[0],
        venue: newVenue[0],
        sections: newSections
    }
}

export const updateEvent = async (
    data: UpdateEventRequest,
    eventId: string,
    userId: string
) => {
    // Verificar que el evento existe y pertenece al usuario
    const existingEvent = await db
        .select()
        .from(eventsTable)
        .where(eq(eventsTable.id, parseInt(eventId)))

    if (!existingEvent.length) {
        throw new CustomError('Event not found', 404)
    }

    if (existingEvent[0]?.userId !== userId) {
        throw new CustomError(
            'Unauthorized - You can only update your own events',
            403
        )
    }

    try {
        // Actualizar el evento si se proporcionan datos
        if (data.event) {
            const updatedEvent = await db
                .update(eventsTable)
                .set({
                    ...(data.event.name && { name: data.event.name }),
                    ...(data.event.date && { date: new Date(data.event.date) }),
                    ...(data.event.startsAt && {
                        startsAt: new Date(data.event.startsAt)
                    }),
                    ...(data.event.endsAt && {
                        endsAt: new Date(data.event.endsAt)
                    }),
                    ...(data.event.eventImage && {
                        eventImage: data.event.eventImage
                    }),
                    ...(data.event.description && {
                        description: data.event.description
                    }),
                    updatedAt: new Date().toISOString(),
                    ...(typeof data.event.isActive !== 'undefined' && {
                        isActive: data.event.isActive
                    }),
                    ...(typeof data.event.isOnline !== 'undefined' && {
                        isOnline: data.event.isOnline
                    })
                })
                .where(eq(eventsTable.id, parseInt(eventId)))
                .returning()

            if (!updatedEvent.length) {
                throw new CustomError('Error updating event', 500)
            }
        }

        // Obtener el venue actual
        const existingVenue = await db
            .select()
            .from(venuesTable)
            .where(eq(venuesTable.eventId, parseInt(eventId)))

        if (!existingVenue.length) {
            throw new CustomError('Venue not found', 404)
        }

        const venueId = existingVenue[0]?.id
        if (!venueId) {
            throw new CustomError('Invalid venue ID', 500)
        }

        // Actualizar el venue si se proporcionan datos
        if (data.venue) {
            const updatedVenue = await db
                .update(venuesTable)
                .set({
                    ...(data.venue.venueName && {
                        venueName: data.venue.venueName
                    }),
                    ...(data.venue.address && { address: data.venue.address }),
                    ...(data.venue.city && { city: data.venue.city }),
                    ...(data.venue.state && { state: data.venue.state }),
                    ...(data.venue.country && { country: data.venue.country }),
                    ...(data.venue.postalCode && {
                        postalCode: data.venue.postalCode
                    }),
                    ...(typeof data.venue.latitude !== 'undefined' && {
                        latitude: data.venue.latitude
                    }),
                    ...(typeof data.venue.longitude !== 'undefined' && {
                        longitude: data.venue.longitude
                    })
                })
                .where(eq(venuesTable.id, venueId))
                .returning()

            if (!updatedVenue.length) {
                throw new CustomError('Error updating venue', 500)
            }
        }

        // Actualizar secciones si se proporcionan
        if (data.sections && data.sections.length > 0) {
            // Eliminar secciones existentes
            await db
                .delete(sectionsTable)
                .where(eq(sectionsTable.venueId, venueId))

            // Crear nuevas secciones
            const newSections = await db
                .insert(sectionsTable)
                .values(
                    data.sections.map((section: SectionData) => ({
                        ...section,
                        venueId
                    }))
                )
                .returning()

            if (!newSections.length) {
                throw new CustomError('Error updating sections', 500)
            }

            // Actualizar la capacidad total del evento
            const totalCapacity = newSections.reduce(
                (sum, section) => sum + (section.capacity || 0),
                0
            )

            await db
                .update(eventsTable)
                .set({ capacity: totalCapacity })
                .where(eq(eventsTable.id, parseInt(eventId)))
        }

        // Obtener el evento actualizado completo
        const finalEvent = await db
            .select()
            .from(eventsTable)
            .where(eq(eventsTable.id, parseInt(eventId)))
            .leftJoin(venuesTable, eq(venuesTable.eventId, eventsTable.id))
            .leftJoin(sectionsTable, eq(sectionsTable.venueId, venuesTable.id))

        return finalEvent[0]
    } catch (error) {
        if (error instanceof CustomError) throw error
        throw new CustomError('Error updating event', 500)
    }
}

export const deleteEvent = async (id: string, userId: string) => {
    try {
        // Verificar que el evento existe y pertenece al usuario
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

        // Obtener el venue para eliminar sus secciones
        const venue = await db
            .select()
            .from(venuesTable)
            .where(eq(venuesTable.eventId, parseInt(id)))

        if (venue.length) {
            const venueId = venue[0]?.id
            if (venueId) {
                // Eliminar todas las secciones asociadas al venue
                await db
                    .delete(sectionsTable)
                    .where(eq(sectionsTable.venueId, venueId))

                // Eliminar el venue
                await db.delete(venuesTable).where(eq(venuesTable.id, venueId))
            }
        }

        // Finalmente, eliminar el evento
        const deletedEvent = await db
            .delete(eventsTable)
            .where(eq(eventsTable.id, parseInt(id)))
            .returning()

        if (!deletedEvent.length) {
            throw new CustomError('Error deleting event', 500)
        }

        return deletedEvent[0]
    } catch (error) {
        if (error instanceof CustomError) throw error
        throw new CustomError('Error deleting event', 500)
    }
}
