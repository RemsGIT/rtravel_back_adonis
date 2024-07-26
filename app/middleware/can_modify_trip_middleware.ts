import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import Trip from '#models/trip'
import ParticipantPolicies from '../Enums/participantPolicies.js'

export default class CanModifyTripMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    /**
     * Middleware logic goes here (before the next call)
     */
    const user = ctx.auth.user

    if (!user) return ctx.response.abort('Not authorized', 403)

    const trip = await Trip.findOrFail(ctx.params.tripId)
    await trip.load('participants')

    // Check if user is the owner or participant with write permission
    const isOwner = trip.userId === user.id
    const isParticipantWithWritePermission = !!trip.participants.find(
      (p) =>
        p.email?.toLowerCase() === user.email.toLowerCase() &&
        p.policy === ParticipantPolicies.WRITE
    )

    if (!isOwner && !isParticipantWithWritePermission)
      return ctx.response.abort({ error: 'NOT_AUTHORIZED' }, 400)

    /**
     * Call next method in the pipeline and return its output
     */
    const output = await next()
    return output
  }
}
