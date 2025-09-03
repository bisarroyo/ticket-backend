import { eq } from 'drizzle-orm'
import { db } from '../database/db.js'
import { ticketsTable, type Schema } from '../models/schema.js'

type InsertTicketsTable = Schema['InsertTicketsTable']
type SelectTicketsTable = Schema['SelectTicketsTable']

export const getTicketById: (
    id: string
) => Promise<SelectTicketsTable> = async (id: string) => {
    const ticket = await db
        .select()
        .from(ticketsTable)
        .where(eq(ticketsTable.id, Number(id)))
        .limit(1)
        .get()
    if (!ticket) {
        throw new Error('Ticket not found')
    }
    return ticket
}
export const getTicketsByUser: (
    userId: string
) => Promise<SelectTicketsTable[]> = async (userId: string) => {
    const tickets = await db
        .select()
        .from(ticketsTable)
        .where(eq(ticketsTable.userId, userId))

    if (!tickets || tickets.length === 0) {
        throw new Error('No tickets found for this user')
    }
    return tickets
}
export const createTicket: (
    ticketData: InsertTicketsTable
) => Promise<SelectTicketsTable> = async (ticketData: InsertTicketsTable) => {
    const { eventId, sectionId, seatId, userId, orderId } = ticketData
    const newTicket = await db
        .insert(ticketsTable)
        .values({
            eventId,
            sectionId,
            seatId,
            userId,
            orderId
        })
        .returning()
    if (!newTicket || newTicket.length === 0) {
        throw new Error('Error creating ticket')
    }
    // Always return a valid ticket, never undefined
    return newTicket[0] as SelectTicketsTable
}

export const markTicketAsUsed: (
    ticketId: number
) => Promise<SelectTicketsTable> = async (ticketId: number) => {
    const updatedTicket = await db
        .update(ticketsTable)
        .set({
            isValid: false,
            usedAt: new Date() // current timestamp as Date object
        })
        .where(eq(ticketsTable.id, ticketId))
        .returning()
    if (!updatedTicket || updatedTicket.length === 0) {
        throw new Error('Error updating ticket')
    }
    return updatedTicket[0] as SelectTicketsTable
}

export const getTicketsByEvent: (
    eventId: number
) => Promise<SelectTicketsTable[]> = async (eventId: number) => {
    const tickets = await db
        .select()
        .from(ticketsTable)
        .where(eq(ticketsTable.eventId, eventId))

    if (!tickets || tickets.length === 0) {
        throw new Error('No tickets found for this event')
    }
    return tickets
}

export const deleteTicket: (
    id: string
) => Promise<{ messaje: string }> = async (id: string) => {
    const deletedCount = await db
        .delete(ticketsTable)
        .where(eq(ticketsTable.id, Number(id)))
        .returning()
    if (deletedCount.length === 0) {
        throw new Error('Ticket not found or already deleted')
    }
    return { messaje: 'Ticket deleted successfully' }
}
