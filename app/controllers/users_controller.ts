// import type { HttpContext } from '@adonisjs/core/http'

import { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import Trip from '#models/trip'

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
}
