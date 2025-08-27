import { Resend } from 'resend'
import 'dotenv/config'
import { CustomError } from '../lib/custom-error.ts'

const resend = new Resend(process.env.RESEND_API_KEY)

export const sendEmail = async (to: string, subject: string, html: string) => {
    const { data, error } = await resend.emails.send({
        from: 'Ticket Master <bismark@no-reply.pluscreativesolutions.com>',
        to: [to],
        subject: subject,
        html: `<strong>${html}</strong>`
    })

    if (error) {
        throw new Error()
    }
    return data
}
