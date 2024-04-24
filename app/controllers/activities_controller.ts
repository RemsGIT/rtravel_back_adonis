import { HttpContext } from '@adonisjs/core/http'
import { createActivityValidator, updateActivityValidator } from '#validators/activity'
import Trip from '#models/trip'
import Activity from '#models/activity'

export default class ActivitiesController {
  async store({ params, request, response }: HttpContext) {
    const payload = await request.validateUsing(createActivityValidator)

    const trip = await Trip.findOrFail(params.tripId)

    try {
      const activity = await trip.related('activities').create({
        name: payload.name,
        place: payload.place,
        city: payload.city,
        start: payload.start,
        icon: payload.icon,
      })

      return response.created(activity)
    } catch (error) {
      console.log(error)
      return response.internalServerError()
    }
  }

  async show({ params, response }: HttpContext) {
    const activity = await Activity.findOrFail(params.id)

    return response.ok(activity)
  }

  async update({ params, request, response }: HttpContext) {
    const activity = await Activity.findOrFail(params.id)
    const payload = await request.validateUsing(updateActivityValidator)

    const activityUpdated = await activity.merge(payload).save()

    return response.ok(activityUpdated)
  }

  async destroy({ params, response }: HttpContext) {
    const activity = await Activity.findOrFail(params.id)

    await activity.delete()

    return response.ok({ message: `Activity ${activity.id} deleted` })
  }
}
