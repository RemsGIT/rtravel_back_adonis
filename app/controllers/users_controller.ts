// import type { HttpContext } from '@adonisjs/core/http'

import { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import Trip from '#models/trip'
import { updateUserValidator } from '#validators/user'

export default class UsersController {
  async hasTrips({ auth, response }: HttpContext) {
    let userTrips = []

    if (auth.user) {
      userTrips = await Trip.query().where((query) => {
        query.where('userId', auth?.user?.id as number).orWhereHas('participants', (builder) => {
          builder.where('email', auth?.user?.email as string)
        })
      })
    }

    return response.ok({ result: (userTrips.length ?? 0) > 0 })
  }

  async searchByExactEmail({ params, response }: HttpContext) {
    const user = await User.query().where('email', params.email).first()

    if (user) {
      return response.ok(user.serializeAttributes({ pick: ['username', 'email'] }))
    }

    return response.notFound()
  }

  async update({ auth, request, response }: HttpContext) {
    const payload = await request.validateUsing(updateUserValidator)

    if (auth.user) {
      const userUpdated = await auth.user.merge(payload).save()

      return response.ok(userUpdated.serializeAttributes({ pick: ['username'] }))
    }

    return response.internalServerError()
  }
}
