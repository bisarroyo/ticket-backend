import type { Request, Response } from 'express'
import { CustomError } from '../lib/custom-error.js'
import * as mailsService from '../services/mails.services.ts'

export const sendEmail = async (req: Request, res: Response) => {
    const { toEmail, subject, messaje } = req.body
    try {
        const data = await mailsService.sendEmail(toEmail, subject, messaje)

        res.status(200).json(data)
    } catch (error) {
        throw new CustomError('error sending email', 500)
    }
}
