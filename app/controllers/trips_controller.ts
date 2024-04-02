import { HttpContext } from '@adonisjs/core/http'
import { createTripValidator, updateTripValidator } from '#validators/trip'
import Trip from '#models/trip'
import { DateTime } from 'luxon'

export default class TripsController {
  /**
   * List of the resource
   */
  async index({ response, auth }: HttpContext) {
    if (auth.user) {
      await auth.user.load('trips')

      const trips = auth.user.trips

      return response.ok(trips)
    }
  }

  async store({ request, response, auth }: HttpContext) {
    const payload = await request.validateUsing(createTripValidator)

    const trip = await Trip.create({
      name: payload.name,
      city: payload.city,
      start: payload.start,
      end: payload.end,
      userId: auth.user?.id,
    })

    return response.created(trip)
  }

  async show({ params, response }: HttpContext) {
    try {
      const trip = await Trip.findOrFail(params.id)

      // Check if user can see the trip -> owns or email in participant or public link defined

      await trip.load('activities')
      await trip.load('participants')
      await trip.load('budget')
      await trip.load('payments')

      return response.ok(trip)
    } catch (error) {
      console.log(error)
      return response.notFound({ error: 'TRIP_NOT_FOUND' })
    }
  }

  async update({ params, request, response }: HttpContext) {
    const trip = await Trip.findOrFail(params.id)
    const payload = await request.validateUsing(updateTripValidator)

    const tripUpdated = await trip.merge(payload).save()

    return response.ok(tripUpdated)
  }

  async destroy({ params, response }: HttpContext) {
    const trip = await Trip.findOrFail(params.id)

    await trip.delete()

    return response.ok({ message: `Trip ${trip.id}  deleted` })
  }

  async getCurrentOrMostRecentTrip({ auth, response }: HttpContext) {
    const now = DateTime.now().startOf('day').toString()

    const currentTrip = await Trip.query()
      .where('userId', auth.user?.id as number)
      .andWhere('start', '<=', now)
      .andWhere('end', '>=', now)
      .orderBy('start', 'asc')
      .first()

    if (currentTrip) {
      return response.ok({ trip: currentTrip })
    }

    const upcomingTrip = await Trip.query()
      .where('userId', auth.user?.id as number)
      .andWhere('start', '>', now)
      .orderBy('start', 'asc')
      .first()

    if (upcomingTrip) {
      return response.ok({ trip: upcomingTrip })
    }

    return response.ok({ trip: null })
  }

  async getFutureTrips({ auth, response }: HttpContext) {
    const now = DateTime.now().startOf('day').toString()

    const futureTrips = await Trip.query()
      .where('userId', auth.user?.id as number)
      .andWhere('start', '>=', now)
      .orderBy('start', 'asc')

    return response.ok({ trips: futureTrips })
  }

  async getPastTrips({ auth, response }: HttpContext) {
    const now = DateTime.now().startOf('day').toString()

    const pastTrips = await Trip.query()
      .where('userId', auth.user?.id as number)
      .andWhere('end', '<', now)
      .orderBy('start', 'asc')

    return response.ok({ trips: pastTrips })
  }

  async getParticipants({ response, params }: HttpContext) {
    const trip = await Trip.findOrFail(params.id)

    await trip.load('participants')

    return response.ok({ participants: trip.participants })
  }
}
