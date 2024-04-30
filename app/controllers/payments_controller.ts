// import type { HttpContext } from '@adonisjs/core/http'

import { HttpContext } from '@adonisjs/core/http'
import { createPaymentValidator, updatePaymentValidator } from '#validators/payment'
import Participant from '#models/participant'
import Payment from '#models/payment'
import PaymentCategory from '../Enums/paymentCategory.js'
import Trip from '#models/trip'

export default class PaymentsController {
  async store({ params, request, response, auth }: HttpContext) {
    const payload = await request.validateUsing(createPaymentValidator)

    let pId = null
    let uId = null
    if (payload.participantId) {
      const participant = await Participant.find(payload.participantId)
      if (participant) {
        pId = participant.id
      } else {
        // Search if the participant is the owner
        const trip = await Trip.findOrFail(params.tripId)

        if (payload.participantId === trip.userId) {
          uId = payload.participantId
        }
      }
    }

    try {
      const payment = await Payment.create({
        amount: payload.amount,
        description: payload.description,
        category: payload.category ? (payload.category as PaymentCategory) : undefined,
        tripId: Number(params.tripId),
        participantId: pId,
        userId: uId,
        createdById: auth.user?.id,
      })

      await payment.load('user')
      await payment.load('participant')

      return response.created(payment)
    } catch (error) {
      console.log(error)
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

    let pId = null
    let uId = null
    if (payload.participantId) {
      const participant = await Participant.find(payload.participantId)
      if (participant) {
        pId = participant.id
      } else {
        // Search if the participant is the owner
        const trip = await Trip.findOrFail(params.tripId)

        if (payload.participantId === trip.userId) {
          uId = payload.participantId
        }
      }
    }

    const paymentUpdated = await payment
      .merge({
        amount: payload.amount,
        description: payload.description,
        category: payload.category,
        participantId: pId,
        userId: uId,
        tripId: Number(params.tripId),
      })
      .save()

    await paymentUpdated.load('participant')
    await paymentUpdated.load('user')

    return response.ok(paymentUpdated)
  }

  async destroy({ params, response }: HttpContext) {
    const payment = await Payment.findOrFail(params.id)

    await payment.delete()

    return response.ok({ message: `Payment ${payment.id} deleted` })
  }
}
