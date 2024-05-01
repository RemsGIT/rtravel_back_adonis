// import type { HttpContext } from '@adonisjs/core/http'

import { HttpContext } from '@adonisjs/core/http'
import { createParticipantValidator, updateParticipantValidator } from '#validators/participant'
import Participant from '#models/participant'

export default class ParticipantsController {
  async store({ params, request, response }: HttpContext) {
    const payload = await request.validateUsing(createParticipantValidator)

    // Check if participant isn't already in the trip
    if (payload.email) {
      const isParticipantInTrip = await Participant.query()
        .where('email', payload.email)
        .andWhere('tripId', Number(params.tripId))

      if (isParticipantInTrip) {
        return response.abort({ error: 'ALREADY_EXISTS' })
      }
    }

    const participant = await Participant.create({
      name: payload.name,
      email: payload.email,
      tripId: Number(params.tripId),
      policy: payload.policy,
    })

    return response.created(participant)
  }

  async show({ params, response }: HttpContext) {
    const participant = await Participant.findOrFail(params.id)

    return response.ok(participant)
  }

  async update({ params, request, response }: HttpContext) {
    const participant = await Participant.findOrFail(params.id)

    const payload = await request.validateUsing(updateParticipantValidator)

    const participantUpdated = await participant
      .merge({
        name: payload.name,
        email: payload.email,
        tripId: Number(params.tripId),
        policy: payload.policy,
      })
      .save()

    return response.ok(participantUpdated)
  }

  async destroy({ params, response }: HttpContext) {
    const participant = await Participant.findOrFail(params.id)

    await participant.delete()

    return response.ok({ message: `Participant ${participant.id} deleted` })
  }
}
