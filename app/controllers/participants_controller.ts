// import type { HttpContext } from '@adonisjs/core/http'

import { HttpContext } from '@adonisjs/core/http'
import { createParticipantValidator, updateParticipantValidator } from '#validators/participant'
import Participant from '#models/participant'
import User from '#models/user'
import emitter from '@adonisjs/core/services/emitter'

export default class ParticipantsController {
  async store({ params, request, response }: HttpContext) {
    const payload = await request.validateUsing(createParticipantValidator)

    // Check if participant isn't already in the trip
    if (payload.email) {
      const isParticipantInTrip = await Participant.query()
        .where('email', payload.email)
        .andWhere('tripId', Number(params.tripId))
        .first()

      if (isParticipantInTrip) {
        return response.abort({ error: 'ALREADY_EXISTS' })
      }
    }

    // Check if the email is an account
    const hasAccount = await this.checkIfParticipantHasAnAccount(payload)
    if (hasAccount) {
      payload.name = hasAccount
    }

    const participant = await Participant.create({
      name: payload.name,
      email: payload.email,
      tripId: Number(params.tripId),
      policy: payload.policy,
    })

    // Event to send email
    emitter.emit('participant:created', participant)

    return response.created(participant)
  }

  async show({ params, response }: HttpContext) {
    const participant = await Participant.findOrFail(params.id)

    return response.ok(participant)
  }

  async update({ params, request, response }: HttpContext) {
    const participant = await Participant.findOrFail(params.id)
    const payload = await request.validateUsing(updateParticipantValidator)

    payload.email = payload.email ?? ''

    // Check if participant isn't already in the trip -> if new email
    if (payload.email !== participant.email) {
      const isParticipantInTrip = await Participant.query()
        .where('email', payload.email)
        .andWhere('tripId', Number(params.tripId))
        .first()

      if (isParticipantInTrip) {
        return response.abort({ error: 'ALREADY_EXISTS' })
      }
    }

    // Check if the email is an account
    const hasAccount = await this.checkIfParticipantHasAnAccount(payload)
    if (hasAccount) {
      payload.name = hasAccount
    }

    const participantUpdated = await participant.merge(payload).save()

    return response.ok(participantUpdated)
  }

  async destroy({ params, response }: HttpContext) {
    const participant = await Participant.findOrFail(params.id)

    await participant.delete()

    return response.ok({ message: `Participant ${participant.id} deleted` })
  }

  private async checkIfParticipantHasAnAccount(payload: any): Promise<string | null> {
    const user = await User.query().where('email', payload.email ?? '')

    return user.length > 0 ? user[0].username : null
  }
}
