import type { Request, Response } from 'express'
import { CustomError } from '../lib/custom-error.js'
import * as ticketsService from '../services/tickets.services.ts'

interface AuthRequest extends Request {
    auth: {
        userId: string
    }
}

export const getTicketById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        if (!id) throw new CustomError('Ticket ID is required', 400)

        const ticket = await ticketsService.getTicketById(id)
        return res.status(200).json(ticket)
    } catch (error) {
        if (error instanceof CustomError) throw error
        throw new CustomError('Error getting ticket', 500)
    }
}

export const getTicketsByUser = async (req: Request, res: Response) => {
    try {
        // try params first, fallback to query
        const userId = 'user_test123'
        if (!userId) throw new CustomError('User ID is required', 400)

        const tickets = await ticketsService.getTicketsByUser(String(userId))
        return res.status(200).json(tickets)
    } catch (error) {
        if (error instanceof CustomError) throw error
        throw new CustomError('Error getting tickets for user', 500)
    }
}

export const createTicket = async (req: Request, res: Response) => {
    try {
        // Prefer authenticated user id if available
        const authReq = req as AuthRequest
        const userIdFromAuth = authReq.auth?.userId
        const ticketData = req.body

        // If service expects userId, ensure it's present
        if (!ticketData.userId && !userIdFromAuth) {
            throw new CustomError('userId is required to create ticket', 400)
        }

        if (!ticketData.userId && userIdFromAuth)
            ticketData.userId = userIdFromAuth

        const newTicket = await ticketsService.createTicket(ticketData)
        return res.status(201).json(newTicket)
    } catch (error) {
        if (error instanceof CustomError) throw error
        throw new CustomError('Error creating ticket', 500)
    }
}

export const markTicketAsUsed = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        if (!id) throw new CustomError('Ticket ID is required', 400)

        const updated = await ticketsService.markTicketAsUsed(Number(id))
        return res.status(200).json(updated)
    } catch (error) {
        if (error instanceof CustomError) throw error
        throw new CustomError('Error marking ticket as used', 500)
    }
}

export const getTicketsByEvent = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        if (!id) throw new CustomError('Event ID is required', 400)

        const tickets = await ticketsService.getTicketsByEvent(Number(id))
        return res.status(200).json(tickets)
    } catch (error) {
        if (error instanceof CustomError) throw error
        throw new CustomError('Error getting tickets for event', 500)
    }
}

export const deleteTicket = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        if (!id) throw new CustomError('Ticket ID is required', 400)

        const result = await ticketsService.deleteTicket(id)
        return res.status(200).json(result)
    } catch (error) {
        if (error instanceof CustomError) throw error
        throw new CustomError('Error deleting ticket', 500)
    }
}
