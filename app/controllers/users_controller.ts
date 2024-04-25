// import type { HttpContext } from '@adonisjs/core/http'

import { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'

export default class UsersController {
  async hasTrips({ auth, response }: HttpContext) {


    if(auth.user) {
      await auth.user.load('trips')
      console.log(auth.user)
    }

    return response.ok({ result: (auth?.user?.trips?.length ?? 0) > 0 })
  }

  async searchByExactEmail({ params, response }: HttpContext) {
    const user = await User.query().where('email', params.email).first()

    if (user) {
      return response.ok(user.serializeAttributes({ pick: ['username', 'email'] }))
    }

    return response.notFound()
  }
}
