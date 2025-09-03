import { eq } from 'drizzle-orm'
import { db } from '../database/db.js'
import { paymentsTable, type Schema } from '../models/schema.js'

type InsertPaymentsTable = Schema['InsertPaymentsTable']
type SelectPaymentsTable = Schema['SelectPaymentsTable']

export const createPayment: (
    paymentData: InsertPaymentsTable
) => Promise<SelectPaymentsTable> = async (
    paymentData: InsertPaymentsTable
) => {
    const { onvoPaymentId, amount, status } = paymentData
    const newPayment = await db
        .insert(paymentsTable)
        .values({
            id: crypto.randomUUID(), // or use your preferred id generation method
            onvoPaymentId,
            status,
            amount,
            currency: 'USD', // TODO: hacer esto dinámico
            description: paymentData.description,
            pmId: paymentData.pmId,
            customerEmail: paymentData.customerEmail,
            idempotencyKey: paymentData.idempotencyKey
        })
        .returning()
    if (!newPayment || newPayment.length === 0) {
        throw new Error('Error creating payment')
    }
    // Always return a valid payment, never undefined
    return newPayment[0] as SelectPaymentsTable
}

export const getPaymentById: (
    id: string
) => Promise<SelectPaymentsTable> = async (id: string) => {
    const payment = await db
        .select()
        .from(paymentsTable)
        .where(eq(paymentsTable.id, id))
        .limit(1)
        .get()
    if (!payment) {
        throw new Error('Payment not found')
    }
    return payment
}
export const reimbursePayment: (
    id: string
) => Promise<SelectPaymentsTable> = async (id: string) => {
    const updatedPayment = await db
        .update(paymentsTable)
        .set({ status: 'refunded' })
        .where(eq(paymentsTable.id, id))
        .returning()
    if (!updatedPayment || updatedPayment.length === 0) {
        throw new Error('Error refunding payment')
    }
    return updatedPayment[0] as SelectPaymentsTable
}
