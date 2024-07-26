import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import Trip from '#models/trip'
import Roles from "../Enums/roles.js";

export default class CanViewTripMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    /**
     * Middleware logic goes here (before the next call)
     */
    const user = ctx.auth.user

    if (!user) return ctx.response.abort('Not authorized', 403)

    const trip = await Trip.findOrFail(ctx.params.tripId)
    await trip.load('participants')

    // Check if user is the owner or in the participants
    const isOwner = trip.userId === user.id
    const isParticipant = !!trip.participants.find(
      (p) => p.email?.toLowerCase() === user.email.toLowerCase()
    )

    if (!isOwner && !isParticipant && user.role !== Roles.SUPERADMIN)
      return ctx.response.abort({ error: 'NOT_AUTHORIZED' }, 400)

    /**
     * Call next method in the pipeline and return its output
     */
    const output = await next()
    return output
  }
}
