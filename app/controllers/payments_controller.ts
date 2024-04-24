// import type { HttpContext } from '@adonisjs/core/http'

import { HttpContext } from '@adonisjs/core/http'
import { createPaymentValidator, updatePaymentValidator } from '#validators/payment'
import Participant from '#models/participant'
import Payment from '#models/payment'
import PaymentCategory from '../Enums/paymentCategory.js'

export default class PaymentsController {
  async store({ params, request, response, auth }: HttpContext) {
    const payload = await request.validateUsing(createPaymentValidator)

    let pId
    if (payload.participantId) {
      const participant = await Participant.findOrFail(payload.participantId)
      pId = participant.id
    }

    try {
      const payment = await Payment.create({
        amount: payload.amount,
        category: payload.category ? (payload.category as PaymentCategory) : undefined,
        tripId: Number(params.tripId),
        participantId: pId,
        createdById: auth.user?.id,
      })

      return response.created(payment)
    } catch (error) {
      return response.internalServerError({ message: 'Error creating the payment' })
    }
  }

  async show({ params, response }: HttpContext) {
    const payment = await Payment.findOrFail(params.id)

    return response.ok(payment)
  }

  async update({ params, request, response }: HttpContext) {
    const payment = await Payment.findOrFail(params.id)

    const payload = await request.validateUsing(updatePaymentValidator)

    const paymentUpdated = await payment
      .merge({
        amount: payload.amount,
        category: payload.category,
        participantId: payload.participantId,
        tripId: Number(params.tripId),
      })
      .save()

    return response.ok(paymentUpdated)
  }

  async destroy({ params, response }: HttpContext) {
    const payment = await Payment.findOrFail(params.id)

    await payment.delete()

    return response.ok({ message: `Payment ${payment.id} deleted` })
  }
}
