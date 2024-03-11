import vine from '@vinejs/vine'
import PaymentCategory from '../Enums/paymentCategory.js'

export const createPaymentValidator = vine.compile(
  vine.object({
    amount: vine.number().positive(),
    category: vine.enum(Object.values(PaymentCategory)).optional(),
    tripId: vine.string().exists(async (db, field) => {
      return await db.from('trips').where('id', field).first()
    }),
    participantId: vine.number().positive().optional(),
  })
)

export const updatePaymentValidator = vine.compile(
  vine.object({
    amount: vine.number().positive().optional(),
    category: vine.enum(Object.values(PaymentCategory)).optional(),
    tripId: vine
      .string()
      .exists(async (db, field) => {
        return await db.from('trips').where('id', field).first()
      })
      .optional(),
    participantId: vine.number().positive().optional(),
  })
)
