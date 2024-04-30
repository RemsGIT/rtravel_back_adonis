import vine from '@vinejs/vine'
import PaymentCategory from '../Enums/paymentCategory.js'

export const createPaymentValidator = vine.compile(
  vine.object({
    amount: vine.number().positive(),
    description: vine.string().optional(),
    category: vine.enum(Object.values(PaymentCategory)).optional(),
    participantId: vine.number().positive().optional(),
  })
)

export const updatePaymentValidator = vine.compile(
  vine.object({
    amount: vine.number().positive().optional(),
    description: vine.string().optional(),
    category: vine.enum(Object.values(PaymentCategory)).optional(),
    participantId: vine.number().positive().optional(),
  })
)
